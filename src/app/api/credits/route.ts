import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Fetch user credits
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const memberId = searchParams.get('memberId');

    // If memberId is provided, get single user's credits
    if (memberId) {
      const { rows } = await sql`
        SELECT credits 
        FROM user_credits 
        WHERE member_id = ${memberId} 
        AND team_id = ${teamId}
      `;
      return NextResponse.json({ credits: rows[0]?.credits || 0 });
    }

    // Otherwise get all team members
    const { rows } = await sql`
      SELECT 
        uc.*,
        CASE 
          WHEN uc.last_monthly_credit_date IS NULL 
          OR uc.last_monthly_credit_date < DATE_TRUNC('month', CURRENT_TIMESTAMP)
          THEN true
          ELSE false
        END as needs_monthly_credits
      FROM user_credits uc
      WHERE team_id = ${teamId}
      ORDER BY user_name ASC;
    `;

    return NextResponse.json({ users: rows });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { action } = data;

    switch (action) {
      case 'ADD_CREDITS':
        return handleAddCredits(data);
      case 'REMOVE_CREDITS':
        return handleRemoveCredits(data);
      case 'UPDATE_MONTHLY_CREDITS':
        return handleUpdateMonthlyCredits(data);
      case 'REMOVE_USER':
        return handleRemoveUser(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

async function handleAddCredits(data: any) {
  const { fromMemberId, toMemberId, teamId, amount } = data;
  
  // Start a transaction
  const client = await sql.begin();
  
  try {
    // Check if sender has enough credits
    const { rows: [sender] } = await client.query`
      SELECT credits FROM user_credits 
      WHERE member_id = ${fromMemberId} AND team_id = ${teamId}
    `;
    
    if (!sender || sender.credits < amount) {
      await client.rollback();
      return NextResponse.json({ 
        error: 'Insufficient credits' 
      }, { status: 400 });
    }

    // Remove credits from sender
    await client.query`
      UPDATE user_credits 
      SET credits = credits - ${amount}
      WHERE member_id = ${fromMemberId} AND team_id = ${teamId}
    `;

    // Add credits to receiver
    await client.query`
      UPDATE user_credits 
      SET credits = credits + ${amount}
      WHERE member_id = ${toMemberId} AND team_id = ${teamId}
    `;

    // Record the transaction
    await client.query`
      INSERT INTO credit_transactions (
        from_member_id, 
        to_member_id, 
        team_id, 
        amount, 
        transaction_type
      ) VALUES (
        ${fromMemberId}, 
        ${toMemberId}, 
        ${teamId}, 
        ${amount}, 
        'MANUAL'
      )
    `;

    await client.commit();
    return NextResponse.json({ success: true });

  } catch (error) {
    await client.rollback();
    throw error;
  }
}

async function handleRemoveCredits(data: any) {
  const { memberId, teamId, amount } = data;

  const result = await sql`
    WITH updated AS (
      UPDATE user_credits
      SET 
        credits = credits - ${amount},
        updated_at = CURRENT_TIMESTAMP
      WHERE 
        member_id = ${memberId} 
        AND team_id = ${teamId}
        AND credits >= ${amount}
      RETURNING *
    )
    INSERT INTO credit_transactions (
      from_member_id, 
      to_member_id, 
      team_id, 
      amount, 
      transaction_type
    )
    SELECT 
      ${memberId}, 
      ${memberId}, 
      ${teamId}, 
      ${amount}, 
      'REMOVE'
    WHERE EXISTS (SELECT 1 FROM updated)
    RETURNING *;
  `;

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

async function handleUpdateMonthlyCredits(data: any) {
  const { managerId, memberId, teamId, amount } = data;
  const numAmount = parseInt(amount);
  
  // Start a transaction
  const client = await sql.begin();
  
  try {
    // If amount is 0, we're canceling the automation
    if (numAmount === 0) {
      await client.query`
        UPDATE user_credits 
        SET 
          monthly_credits = 0,
          monthly_credit_manager_id = NULL,
          last_monthly_credit_date = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE member_id = ${memberId} AND team_id = ${teamId}
      `;

      await client.query`
        INSERT INTO credit_transactions (
          from_member_id, 
          to_member_id, 
          team_id, 
          amount, 
          transaction_type
        ) VALUES (
          ${managerId}, 
          ${memberId}, 
          ${teamId}, 
          0, 
          'MONTHLY_CANCEL'
        )
      `;

      await client.commit();
      return NextResponse.json({ success: true });
    }

    // Check if manager has enough credits
    const { rows: [manager] } = await client.query`
      SELECT credits FROM user_credits 
      WHERE member_id = ${managerId} AND team_id = ${teamId}
    `;
    
    if (!manager || manager.credits < numAmount) {
      await client.rollback();
      return NextResponse.json({ 
        error: 'Insufficient credits for monthly automation setup' 
      }, { status: 400 });
    }

    // Update the monthly credits setup and do initial transfer
    await client.query`
      UPDATE user_credits 
      SET 
        monthly_credits = ${numAmount},
        monthly_credit_manager_id = ${managerId},
        credits = credits + ${numAmount},
        last_monthly_credit_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE member_id = ${memberId} AND team_id = ${teamId}
    `;

    // Subtract initial credits from manager
    await client.query`
      UPDATE user_credits 
      SET credits = credits - ${numAmount}
      WHERE member_id = ${managerId} AND team_id = ${teamId}
    `;

    // Record the transaction
    await client.query`
      INSERT INTO credit_transactions (
        from_member_id, 
        to_member_id, 
        team_id, 
        amount, 
        transaction_type
      ) VALUES (
        ${managerId}, 
        ${memberId}, 
        ${teamId}, 
        ${numAmount}, 
        'MONTHLY_SETUP'
      )
    `;

    await client.commit();
    return NextResponse.json({ success: true });

  } catch (error) {
    await client.rollback();
    throw error;
  }
}

async function handleRemoveUser(data: any) {
  const { memberId, teamId } = data;

  const result = await sql`
    DELETE FROM user_credits
    WHERE member_id = ${memberId} AND team_id = ${teamId}
    RETURNING *;
  `;

  return NextResponse.json({ success: true });
}

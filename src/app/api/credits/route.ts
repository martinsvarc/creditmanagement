import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

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
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
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
      case 'ADD_USER':
        return handleAddUser(data);
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
  const { memberId, teamId, amount } = data;
  
  const result = await sql`
    WITH updated AS (
      UPDATE user_credits
      SET 
        credits = credits + ${amount},
        updated_at = CURRENT_TIMESTAMP
      WHERE member_id = ${memberId} AND team_id = ${teamId}
      RETURNING *
    )
    INSERT INTO credit_transactions (member_id, team_id, amount, transaction_type)
    VALUES (${memberId}, ${teamId}, ${amount}, 'ADD')
    RETURNING *;
  `;
  
  return NextResponse.json({ success: true, data: result.rows[0] });
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
    INSERT INTO credit_transactions (member_id, team_id, amount, transaction_type)
    SELECT ${memberId}, ${teamId}, ${-amount}, 'REMOVE'
    WHERE EXISTS (SELECT 1 FROM updated)
    RETURNING *;
  `;

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: result.rows[0] });
}

async function handleUpdateMonthlyCredits(data: any) {
  const { memberId, teamId, amount } = data;

  const result = await sql`
    UPDATE user_credits
    SET 
      monthly_credits = ${amount},
      updated_at = CURRENT_TIMESTAMP
    WHERE member_id = ${memberId} AND team_id = ${teamId}
    RETURNING *;
  `;

  return NextResponse.json({ success: true, data: result.rows[0] });
}

async function handleAddUser(data: any) {
  const { memberId, teamId, userName, userPictureUrl, credits = 0, monthlyCredits = 0 } = data;

  const result = await sql`
    INSERT INTO user_credits (
      member_id, team_id, user_name, user_picture_url, credits, monthly_credits
    ) VALUES (
      ${memberId}, ${teamId}, ${userName}, ${userPictureUrl}, ${credits}, ${monthlyCredits}
    )
    ON CONFLICT (member_id, team_id) 
    DO UPDATE SET
      user_name = EXCLUDED.user_name,
      user_picture_url = EXCLUDED.user_picture_url,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  return NextResponse.json({ success: true, data: result.rows[0] });
}

async function handleRemoveUser(data: any) {
  const { memberId, teamId } = data;

  const result = await sql`
    DELETE FROM user_credits
    WHERE member_id = ${memberId} AND team_id = ${teamId}
    RETURNING *;
  `;

  return NextResponse.json({ success: true, data: result.rows[0] });
}

import { sql } from '@vercel/postgres';

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await sql.query(query, params);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Database query error:', error);
    return { success: false, error: error.message };
  }
}

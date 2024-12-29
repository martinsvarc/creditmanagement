import { sql } from '@vercel/postgres';

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await sql.query(query, params);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Database query error:', error);
    // Type guard to check if error is an Error object
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    // Fallback for non-Error objects
    return { success: false, error: 'An unknown error occurred' };
  }
}

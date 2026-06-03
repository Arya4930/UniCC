import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get('admin_auth');
    
    if (!adminAuth || adminAuth.value !== 'true') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: false, message: 'DATABASE_URL is not configured.' }, { status: 500 });
    }

    const buses = await req.json();

    if (!Array.isArray(buses)) {
      return NextResponse.json({ success: false, message: 'Expected an array of buses.' }, { status: 400 });
    }

    const pool = getDbPool();

    // Create table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS buses (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(50),
        route VARCHAR(255),
        boarding_points JSONB,
        driver_phone VARCHAR(50),
        driver_name VARCHAR(100),
        whatsapp_group TEXT,
        bus_location TEXT
      );
    `);

    // We'll use a transaction to replace the buses
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('TRUNCATE TABLE buses');

      for (const bus of buses) {
        await client.query(
          `INSERT INTO buses (id, type, route, boarding_points, driver_phone, driver_name, whatsapp_group, bus_location)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            bus.id,
            bus.type,
            bus.route,
            JSON.stringify(bus.boardingPoints || []),
            bus.driverPhone,
            bus.driverName,
            bus.whatsappGroup,
            bus.busLocation
          ]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, message: 'Buses updated successfully in the database.' });
  } catch (error: any) {
    console.error('Failed to update buses:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

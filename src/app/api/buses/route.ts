import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import defaultBuses from '@/data/dayscholar_buses.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  const fallbackBuses = (defaultBuses as any).default || defaultBuses;
  try {
    const pool = getDbPool();
    // If DATABASE_URL is not set, fallback to local JSON to avoid breaking the app
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: true, buses: fallbackBuses });
    }

    const { rows } = await pool.query('SELECT * FROM buses');
    
    // Convert snake_case db columns back to camelCase JSON
    const buses = rows.map(row => ({
      id: row.id,
      type: row.type,
      route: row.route,
      boardingPoints: row.boarding_points,
      driverPhone: row.driver_phone,
      driverName: row.driver_name,
      whatsappGroup: row.whatsapp_group,
      busLocation: row.bus_location
    }));

    if (buses.length === 0) {
      return NextResponse.json({ success: true, buses: fallbackBuses });
    }

    return NextResponse.json({ success: true, buses });
  } catch (error: any) {
    console.error('Failed to fetch buses:', error);
    // On failure (like table not exists), fallback to default json
    return NextResponse.json({ success: true, buses: fallbackBuses, error: error.message });
  }
}

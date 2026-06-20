import { openDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await openDb();
    
    const outletsSql = `
      SELECT DISTINCT Outlet_Name as outlet
      FROM orders
      ORDER BY outlet ASC
    `;
    const outlets = await db.all(outletsSql);

    // Also get the min and max date for the date picker
    const datesSql = `
      SELECT 
        MIN(substr(Order_Datetime, 1, 10)) as minDate,
        MAX(substr(Order_Datetime, 1, 10)) as maxDate
      FROM orders
    `;
    const dates = await db.get(datesSql);

    return Response.json({
      outlets: outlets.map(o => o.outlet),
      dateRange: dates
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch filters' }, { status: 500 });
  }
}

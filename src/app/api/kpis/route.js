import { openDb } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const outlet = searchParams.get('outlet');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    const db = await openDb();
    
    let whereClause = '1=1';
    let params = [];
    
    if (outlet && outlet !== 'All') {
      whereClause += ' AND Outlet_Name = ?';
      params.push(outlet);
    }
    
    if (startDate && endDate) {
      whereClause += ' AND date BETWEEN ? AND ?';
      params.push(startDate);
      params.push(endDate);
    }

    // Revenue is calculated as SUM(Price * Quantity)
    const sql = `
      SELECT 
        SUM(Price * Quantity) as totalRevenue,
        COUNT(DISTINCT BillNo) as totalOrders,
        SUM(Quantity) as totalItems,
        SUM(Price * Quantity) * 1.0 / COUNT(DISTINCT BillNo) as averageOrderValue
      FROM orders
      WHERE ${whereClause}
    `;
    
    const kpis = await db.get(sql, params);
    
    return Response.json(kpis || { totalRevenue: 0, totalOrders: 0, totalItems: 0, averageOrderValue: 0 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch KPIs' }, { status: 500 });
  }
}

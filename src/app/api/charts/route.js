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

    // 1. Revenue over time
    const revenueOverTimeSql = `
      SELECT 
        date,
        SUM(Price * Quantity) as revenue
      FROM orders
      WHERE ${whereClause}
      GROUP BY date
      ORDER BY date ASC
    `;
    const revenueOverTime = await db.all(revenueOverTimeSql, params);

    // 2. Sales by Category (Group)
    const categorySql = `
      SELECT 
        "Group" as category,
        SUM(Price * Quantity) as revenue
      FROM orders
      WHERE ${whereClause}
      GROUP BY category
      ORDER BY revenue DESC
    `;
    const categorySales = await db.all(categorySql, params);

    // 3. Order Type Distribution
    const typeSql = `
      SELECT 
        Order_Type as type,
        SUM(Price * Quantity) as revenue,
        COUNT(DISTINCT BillNo) as orders
      FROM orders
      WHERE ${whereClause}
      GROUP BY type
    `;
    const typeDistribution = await db.all(typeSql, params);

    return Response.json({
      revenueOverTime,
      categorySales,
      typeDistribution
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch charts data' }, { status: 500 });
  }
}

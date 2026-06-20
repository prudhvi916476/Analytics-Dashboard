import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
      return Response.json({ error: "Missing or invalid GEMINI_API_KEY in .env.local" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { kpis, charts } = await request.json();

    const prompt = `
You are an expert business analyst reviewing the latest performance metrics for a restaurant chain in India.
Please provide a 2-3 paragraph professional, insightful summary of the following data.
Highlight the total revenue, any clear top-performing categories or channels, and overall trends.
Keep the tone concise, encouraging, and analytical. Use ₹ (Indian Rupees) for all currency values. Do not format the response with markdown headers, just plain paragraphs or simple bullet points if necessary.

KPIs:
Total Revenue: ₹${kpis.totalRevenue}
Total Orders: ${kpis.totalOrders}
Average Order Value: ₹${kpis.averageOrderValue.toFixed(2)}
Total Items Sold: ${kpis.totalItems}

Sales by Category:
${charts.categorySales.map(c => `- ${c.category}: ₹${c.revenue}`).join('\n')}

Order Type Distribution:
${charts.typeDistribution.map(t => `- ${t.type}: ₹${t.revenue} (${t.orders} orders)`).join('\n')}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return Response.json({ text: response.text });
  } catch (error) {
    console.error("AI Insights Error:", error);
    return Response.json({ error: "Failed to generate AI insights: " + error.message }, { status: 500 });
  }
}

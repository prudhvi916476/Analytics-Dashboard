# Business Analytics Dashboard

A high-performance, web-based analytics dashboard built for visualizing a 300,000 record dataset of restaurant orders.

## Tech Stack

- **Frontend**: Next.js (App Router), React, Recharts (for visualizations)
- **Styling**: Vanilla CSS (CSS Modules) with custom dark mode and variables
- **Backend**: Next.js API Routes
- **Database**: SQLite
- **Data Ingestion**: Python (Pandas) script to ETL the raw `.xlsx` file into an optimized `.sqlite` database.

## Architecture Decisions & Trade-offs

1. **Why SQLite over parsing the Excel file in memory?**
   Loading a 15MB Excel file containing 300,000 rows into Node.js memory on every request or even at server startup would lead to massive memory bloat (300-500MB+ in memory) and slow response times. By running a one-time ETL script to transform the data into a SQLite database, we offload the heavy lifting to a database engine specifically designed for fast indexing, filtering, and aggregation.
   
2. **Custom Vanilla CSS vs Tailwind**
   A sleek, dynamic dark-mode aesthetic was crafted entirely using Vanilla CSS modules to demonstrate advanced CSS architectural skills without relying on utility classes, keeping the markup clean and modular.

3. **Next.js App Router**
   Leveraging the modern App Router provides seamless integration of backend API endpoints (`/api/kpis`, `/api/charts`) alongside the frontend React components in a unified repository.

## Setup & Run Instructions

### Prerequisites
- Node.js 18+
- Python 3+ (with `pandas` and `openpyxl` installed, if you wish to run the ingestion script)

### 1. Ingest Data (Optional, already performed)
If you need to regenerate the database from `data.xlsx`:
```bash
# In the project root directory
python ../ingest.py
```
This generates `database.sqlite` with appropriate indexes.

### 2. Install Dependencies
```bash
cd analytics-dashboard
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

Deploying to Vercel is recommended as it natively supports Next.js.
Note: Since `database.sqlite` is tracked in the repository, Vercel will bundle it with the application. The `sqlite3` dependency will read from this static file cleanly.

1. Push this repository to GitHub.
2. Import the project into Vercel.
3. Keep the build command as `npm run build` and install command as `npm install`.
4. Deploy!

## Features

- **Key KPIs**: Total Revenue, Total Orders, Average Order Value, Total Items Sold.
- **Dynamic Charts**: 
  - Revenue Over Time (Area Chart)
  - Sales by Category (Bar Chart)
  - Order Type Distribution (Donut Chart)
- **Filters**: Sift through data dynamically via specific Outlets and custom Date Ranges.

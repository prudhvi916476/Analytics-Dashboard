"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import landingStyles from "./landing.module.css";
import { BentoCard } from "@/components/ui/BentoCard";
import { RevenueChart, CategoryChart, OrderTypeChart } from "@/components/Charts";

import LandingPage from "@/components/LandingPage";
import { BeamsBackground } from "@/components/ui/beams-background";
import { IndianRupee, ShoppingBag, TrendingUp, Package, Sparkles, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";



export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  
  const [kpis, setKpis] = useState({ totalRevenue: 0, totalOrders: 0, totalItems: 0, averageOrderValue: 0 });
  const [charts, setCharts] = useState({ revenueOverTime: [], categorySales: [], typeDistribution: [] });
  const [outlets, setOutlets] = useState([]);
  
  const [selectedOutlet, setSelectedOutlet] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timeframe, setTimeframe] = useState("Custom");
  const [dateRange, setDateRange] = useState({ minDate: "", maxDate: "" });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [aiInsight, setAiInsight] = useState(null);
  const [generatingInsight, setGeneratingInsight] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exportToPDF = async () => {
    setExporting(true);
    const dashboardElement = document.getElementById("dashboard-content");
    if (!dashboardElement) {
      setExporting(false);
      return;
    }

    try {
      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        backgroundColor: "#0a0e1a",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Analytics_Report_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF", err);
      alert("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    // Fetch initial filters
    fetch('/api/filters')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        if (data.outlets) setOutlets(data.outlets);
        if (data.dateRange) {
          setStartDate(data.dateRange.minDate);
          setEndDate(data.dateRange.maxDate);
          setDateRange({ minDate: data.dateRange.minDate, maxDate: data.dateRange.maxDate });
        }
      })
      .catch(err => {
        console.error(err);
        setErrorMsg("Failed to load initial filters: " + err.message);
      });
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    const params = new URLSearchParams({
      outlet: selectedOutlet,
      startDate,
      endDate
    });

    Promise.all([
      fetch(`/api/kpis?${params}`).then(res => res.json()),
      fetch(`/api/charts?${params}`).then(res => res.json())
    ]).then(([kpiData, chartData]) => {
      if (kpiData.error) throw new Error(kpiData.error);
      if (chartData.error) throw new Error(chartData.error);
      setKpis(kpiData);
      setCharts(chartData);
      setLoading(false);
      setAiInsight(null); // Clear old insights when data changes
    }).catch(err => {
      console.error(err);
      setErrorMsg("Failed to load metrics: " + err.message);
      setLoading(false);
    });
  }, [selectedOutlet, startDate, endDate]);

  // Date constraint handlers
  const handleStartDateChange = (e) => {
    let newStart = e.target.value;
    // Clamp to data range
    if (dateRange.minDate && newStart < dateRange.minDate) newStart = dateRange.minDate;
    if (dateRange.maxDate && newStart > dateRange.maxDate) newStart = dateRange.maxDate;
    // Ensure start ≤ end
    if (endDate && newStart > endDate) {
      setEndDate(newStart);
    }
    setStartDate(newStart);
  };

  const handleEndDateChange = (e) => {
    let newEnd = e.target.value;
    // Clamp to data range
    if (dateRange.minDate && newEnd < dateRange.minDate) newEnd = dateRange.minDate;
    if (dateRange.maxDate && newEnd > dateRange.maxDate) newEnd = dateRange.maxDate;
    // Ensure end ≥ start
    if (startDate && newEnd < startDate) {
      setStartDate(newEnd);
    }
    setEndDate(newEnd);
  };

  const handleTimeframeChange = (e) => {
    const value = e.target.value;
    setTimeframe(value);
    
    if (value === "Custom") return;

    const today = new Date();
    const format = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (value === "Last 7 Days") {
      const last7 = new Date(today);
      last7.setDate(today.getDate() - 6);
      setStartDate(format(last7));
      setEndDate(format(today));
    } else if (value === "This Month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(format(firstDay));
      setEndDate(format(today));
    } else if (value === "Last 2 Months") {
      const last2Months = new Date(today);
      last2Months.setMonth(today.getMonth() - 2);
      setStartDate(format(last2Months));
      setEndDate(format(today));
    }
  };

  const generateInsight = async () => {
    if (!kpis || !charts) return;
    setGeneratingInsight(true);
    setAiInsight(null);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kpis, charts })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiInsight(data.text);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setGeneratingInsight(false);
    }
  };

  // Render markdown-style bold (**text**) in AI insights
  const renderInsightText = (text) => {
    return text.split('\n').map((paragraph, i) => {
      if (!paragraph.trim()) return <br key={i} />;
      const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  const kpiCards = [
    { 
      title: "Total Revenue", 
      value: kpis.totalRevenue || 0, 
      format: (v) => v.toLocaleString('en-IN', { maximumFractionDigits: 0 }),
      icon: IndianRupee, 
      prefix: "₹",
      subtitle: "Gross revenue over period",
      colors: ["#22d3ee", "#38bdf8", "#0ea5e9"]
    },
    { 
      title: "Total Orders", 
      value: kpis.totalOrders || 0, 
      format: (v) => v.toLocaleString('en-IN'),
      icon: ShoppingBag,
      subtitle: "Completed transactions",
      colors: ["#a78bfa", "#c084fc", "#e879f9"]
    },
    { 
      title: "Avg Order Value", 
      value: kpis.averageOrderValue || 0, 
      format: (v) => v.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      icon: TrendingUp, 
      prefix: "₹",
      subtitle: "Revenue per order",
      colors: ["#fb7185", "#f43f5e", "#e11d48"]
    },
    { 
      title: "Items Sold", 
      value: kpis.totalItems || 0, 
      format: (v) => v.toLocaleString('en-IN'),
      icon: Package,
      subtitle: "Total products moved",
      colors: ["#34d399", "#10b981", "#059669"]
    }
  ];

  return (
    <BeamsBackground intensity="strong" className={landingStyles.dashboardEnter}>
      {showLanding ? (
        <LandingPage onEnter={() => setShowLanding(false)} />
      ) : (
        <div id="dashboard-content" className={styles.container} style={{ padding: '24px' }}>
          <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Business Analytics</h1>
          <p className={styles.subtitle}>Real-time insights and performance metrics</p>
        </div>
        
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Outlet</label>
            <select 
              id="outlet-filter"
              value={selectedOutlet} 
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className={styles.select}
            >
              <option value="All">All Outlets</option>
              {outlets.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label>Timeframe</label>
            <select 
              value={timeframe} 
              onChange={handleTimeframeChange}
              className={styles.select}
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="This Month">This Month</option>
              <option value="Last 2 Months">Last 2 Months</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          
          {timeframe === "Custom" && (
            <div className={styles.filterGroup}>
              <label>Date Range</label>
              <div className={styles.dateInputs}>
                <input 
                  id="start-date"
                  type="date" 
                  value={startDate} 
                  min={dateRange.minDate}
                  max={endDate || dateRange.maxDate}
                  onChange={handleStartDateChange}
                  className={styles.input}
                />
                <span>to</span>
                <input 
                  id="end-date"
                  type="date" 
                  value={endDate} 
                  min={startDate || dateRange.minDate}
                  max={dateRange.maxDate}
                  onChange={handleEndDateChange}
                  className={styles.input}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        {errorMsg && (
          <div className={styles.errorBanner} id="error-banner">
            {errorMsg}
          </div>
        )}
        
        {loading ? (
          <>
            {/* Skeleton KPI Cards */}
            <div className={styles.skeletonGrid}>
              {[0, 1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={styles.skeletonCard} 
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={styles.skeletonLine}></div>
                  <div className={styles.skeletonLine}></div>
                </div>
              ))}
            </div>
            {/* Skeleton Charts */}
            <div className={styles.skeletonChartGrid}>
              <div className={`${styles.skeletonChart} ${styles.skeletonChartWide}`}></div>
              <div className={styles.skeletonChart}></div>
              <div className={styles.skeletonChart}></div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.aiHeaderRow}>
              <h2>Performance Overview</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  id="export-pdf-btn"
                  className={styles.aiButton} 
                  onClick={exportToPDF} 
                  disabled={exporting}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Download size={16} />
                  {exporting ? 'Exporting...' : 'Export to PDF'}
                </button>
                <button 
                  id="ai-insight-btn"
                  className={styles.aiButton} 
                  onClick={generateInsight} 
                  disabled={generatingInsight}
                >
                  <Sparkles size={16} />
                  {generatingInsight ? 'Analyzing data...' : 'Generate AI Insight'}
                </button>
              </div>
            </div>
            
            {aiInsight && (
              <div className={styles.aiInsightCard} id="ai-insight-card">
                <div className={styles.aiInsightContent}>
                  {renderInsightText(aiInsight)}
                </div>
              </div>
            )}

            <div className={styles.kpiGrid}>
              {kpiCards.map((card, index) => (
                <BentoCard 
                  key={card.title}
                  title={card.title} 
                  value={card.value}
                  format={card.format}
                  icon={card.icon} 
                  prefix={card.prefix || ''} 
                  colors={card.colors}
                  subtitle={card.subtitle}
                  delay={index * 0.1}
                />
              ))}
            </div>


            <div className={styles.chartsGrid}>
              <div className={styles.chartWide}>
                <RevenueChart data={charts.revenueOverTime} />
              </div>
              <div className={styles.chartStandard}>
                <CategoryChart data={charts.categorySales} />
              </div>
              <div className={styles.chartStandard}>
                <OrderTypeChart data={charts.typeDistribution} />
              </div>
            </div>
          </>
        )}
      </main>
        </div>
      )}
    </BeamsBackground>
  );
}

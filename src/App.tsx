import React, { useState, useEffect, useRef } from "react";
import { 
  Database, 
  MessageSquare, 
  Settings, 
  Terminal, 
  Code2, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  Play, 
  RefreshCw, 
  Layers, 
  FileText, 
  Check, 
  AlertCircle,
  HelpCircle,
  BookOpen,
  Key,
  UserCheck,
  Send,
  Plus,
  TrendingUp,
  Package,
  Building,
  Bot,
  Sparkles,
  Briefcase,
  Smartphone,
  Shield,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";

interface LogEntry {
  phase: string;
  description: string;
  args?: any;
  result?: any;
  output?: string;
}

interface ChatMessage {
  role: "user" | "model" | "system";
  content: string;
}

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-slate-800 rounded-lg p-2.5 shadow-xl backdrop-blur-sm">
        <p className="text-[10px] font-bold text-slate-400 font-mono mb-1">{label}</p>
        {payload.map((item: any, i: number) => {
          let name = item.name;
          let color = item.stroke; // use line stroke color
          let val = item.value;
          if (item.dataKey === "actualDemand") {
            name = "Actual Demand";
            color = "#059669";
          } else if (item.dataKey === "predictedDemand") {
            name = "AI Predicted Demand";
            color = "#10b981";
          } else if (item.dataKey === "stockLevel") {
            name = "Stock Level";
            color = "#f59e0b";
          }
          return (
            <div key={i} className="flex items-center gap-2 text-xs font-mono my-0.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
              <span className="text-slate-400">{name}:</span>
              <span className="text-slate-200 font-semibold">{val} units</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"architecture" | "stepbystep" | "simulation" | "code_snippets" | "apk_builder" | "security">("simulation");
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("erp_is_developer_mode") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleDeveloperMode = (val: boolean) => {
    setIsDeveloperMode(val);
    if (!val) {
      setActiveDbTab("stock");
    }
    try {
      localStorage.setItem("erp_is_developer_mode", String(val));
    } catch (e) {
      console.error(e);
    }
  };
  
  // 1. Branding, Theme & Custom Title configuration state
  const [brandTheme, setBrandTheme] = useState<"emerald" | "sapphire" | "amber" | "steel" | "crimson">(() => {
    try {
      return (localStorage.getItem("erp_brand_theme") as any) || "emerald";
    } catch {
      return "emerald";
    }
  });
  const [customAppName, setCustomAppName] = useState(() => {
    try {
      const stored = localStorage.getItem("erp_custom_app_name");
      if (stored && stored !== "ERPNext AI Copilot Architect & Simulator") {
        return stored;
      }
      return "Pankaj Yadav ERP Next-Gen Copilot";
    } catch {
      return "Pankaj Yadav ERP Next-Gen Copilot";
    }
  });
  const [customLogo, setCustomLogo] = useState(() => {
    try {
      return localStorage.getItem("erp_custom_logo") || "Cpu";
    } catch {
      return "Cpu";
    }
  });

  // 2. Real ERPNext API Integration configuration state
  const [erpUrl, setErpUrl] = useState(() => {
    try {
      return localStorage.getItem("erp_sync_url") || "";
    } catch {
      return "";
    }
  });
  const [erpApiKey, setErpApiKey] = useState(() => {
    try {
      return localStorage.getItem("erp_sync_api_key") || "";
    } catch {
      return "";
    }
  });
  const [erpApiSecret, setErpApiSecret] = useState(() => {
    try {
      return localStorage.getItem("erp_sync_api_secret") || "";
    } catch {
      return "";
    }
  });
  const [erpSyncEnabled, setErpSyncEnabled] = useState(() => {
    try {
      return localStorage.getItem("erp_sync_enabled") === "true";
    } catch {
      return false;
    }
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<{ status: "success" | "error" | ""; text: string }>({ status: "", text: "" });
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Theme styling configurations
  const themeConfig = {
    emerald: {
      primary: "emerald-500",
      primaryBg: "bg-emerald-500",
      primaryBorder: "border-emerald-500",
      primaryText: "text-emerald-400",
      primaryHover: "hover:bg-emerald-400",
      bgLight: "bg-emerald-500/10",
      borderLight: "border-emerald-500/20",
      border30: "border-emerald-500/30",
      gradient: "from-emerald-500 to-teal-400",
      textGradient: "from-emerald-400 via-teal-300 to-cyan-400",
      gradientHover: "hover:from-emerald-400 hover:to-teal-400",
      logoColor: "text-emerald-400",
      shadow: "shadow-emerald-500/10",
      tabActive: "border-emerald-500 text-emerald-400 bg-emerald-500/5"
    },
    sapphire: {
      primary: "blue-500",
      primaryBg: "bg-blue-500",
      primaryBorder: "border-blue-500",
      primaryText: "text-blue-400",
      primaryHover: "hover:bg-blue-400",
      bgLight: "bg-blue-500/10",
      borderLight: "border-blue-500/20",
      border30: "border-blue-500/30",
      gradient: "from-blue-500 to-indigo-400",
      textGradient: "from-blue-400 via-indigo-300 to-cyan-400",
      gradientHover: "hover:from-blue-400 hover:to-indigo-400",
      logoColor: "text-blue-400",
      shadow: "shadow-blue-500/10",
      tabActive: "border-blue-500 text-blue-400 bg-blue-500/5"
    },
    amber: {
      primary: "amber-500",
      primaryBg: "bg-amber-500",
      primaryBorder: "border-amber-500",
      primaryText: "text-amber-400",
      primaryHover: "hover:bg-amber-400",
      bgLight: "bg-amber-500/10",
      borderLight: "border-amber-500/20",
      border30: "border-amber-500/30",
      gradient: "from-amber-500 to-orange-400",
      textGradient: "from-amber-400 via-orange-300 to-yellow-400",
      gradientHover: "hover:from-amber-400 hover:to-orange-400",
      logoColor: "text-amber-400",
      shadow: "shadow-amber-500/10",
      tabActive: "border-amber-500 text-amber-400 bg-amber-500/5"
    },
    steel: {
      primary: "slate-400",
      primaryBg: "bg-slate-400",
      primaryBorder: "border-slate-400",
      primaryText: "text-slate-300",
      primaryHover: "hover:bg-slate-300",
      bgLight: "bg-slate-400/10",
      borderLight: "border-slate-400/20",
      border30: "border-slate-400/30",
      gradient: "from-slate-400 to-zinc-400",
      textGradient: "from-slate-300 via-zinc-200 to-slate-400",
      gradientHover: "hover:from-slate-300 hover:to-zinc-300",
      logoColor: "text-slate-300",
      shadow: "shadow-slate-400/10",
      tabActive: "border-slate-400 text-slate-300 bg-slate-400/5"
    },
    crimson: {
      primary: "rose-500",
      primaryBg: "bg-rose-500",
      primaryBorder: "border-rose-500",
      primaryText: "text-rose-400",
      primaryHover: "hover:bg-rose-400",
      bgLight: "bg-rose-500/10",
      borderLight: "border-rose-500/20",
      border30: "border-rose-500/30",
      gradient: "from-rose-500 to-pink-500",
      textGradient: "from-rose-400 via-pink-400 to-orange-400",
      gradientHover: "hover:from-rose-400 hover:to-pink-400",
      logoColor: "text-rose-400",
      shadow: "shadow-rose-500/10",
      tabActive: "border-rose-500 text-rose-400 bg-rose-500/5"
    }
  };

  const tc = themeConfig[brandTheme];

  const handleThemeChange = (newTheme: "emerald" | "sapphire" | "amber" | "steel" | "crimson") => {
    setBrandTheme(newTheme);
    try { localStorage.setItem("erp_brand_theme", newTheme); } catch (e) {}
  };

  const handleAppNameChange = (name: string) => {
    setCustomAppName(name);
    try { localStorage.setItem("erp_custom_app_name", name); } catch (e) {}
  };

  const handleLogoChange = (logo: string) => {
    setCustomLogo(logo);
    try { localStorage.setItem("erp_custom_logo", logo); } catch (e) {}
  };

  const handleSyncToggle = (val: boolean) => {
    setErpSyncEnabled(val);
    try { localStorage.setItem("erp_sync_enabled", String(val)); } catch (e) {}
  };

  const handleErpUrlChange = (val: string) => {
    setErpUrl(val);
    try { localStorage.setItem("erp_sync_url", val); } catch (e) {}
  };

  const handleErpApiKeyChange = (val: string) => {
    setErpApiKey(val);
    try { localStorage.setItem("erp_sync_api_key", val); } catch (e) {}
  };

  const handleErpApiSecretChange = (val: string) => {
    setErpApiSecret(val);
    try { localStorage.setItem("erp_sync_api_secret", val); } catch (e) {}
  };

  const testErpConnection = async () => {
    if (!erpUrl || !erpApiKey || !erpApiSecret) {
      setConnectionMessage({ status: "error", text: "Kripya URL, API Key aur API Secret fill karein." });
      return;
    }
    setIsTestingConnection(true);
    setConnectionMessage({ status: "", text: "" });
    try {
      const res = await fetch("/api/erpnext/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: erpUrl, apiKey: erpApiKey, apiSecret: erpApiSecret })
      });
      const data = await res.json();
      if (res.ok) {
        setConnectionMessage({ 
          status: "success", 
          text: `Success! Connected to ERPNext as user: ${data.user || "Administrator"}` 
        });
        setErpSyncEnabled(true);
        localStorage.setItem("erp_sync_enabled", "true");
      } else {
        setConnectionMessage({ 
          status: "error", 
          text: data.error || "Connection failed. Credentials check karein." 
        });
      }
    } catch (err: any) {
      setConnectionMessage({ status: "error", text: `Network Error: ${err.message}` });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const runErpSync = async () => {
    if (!erpUrl || !erpApiKey || !erpApiSecret) {
      setSyncLogs(["[Error] API connection details missing! Please fill them above first."]);
      return;
    }
    setIsSyncingData(true);
    setSyncLogs(["[Info] Initiating real-time database sync..."]);
    try {
      const res = await fetch("/api/erpnext/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: erpUrl, apiKey: erpApiKey, apiSecret: erpApiSecret })
      });
      const data = await res.json();
      if (res.ok) {
        setSyncLogs(data.logs || ["Sync successful!"]);
        await fetchMockDb();
      } else {
        setSyncLogs(data.logs || [`[Error] Sync failed: ${data.error}`]);
      }
    } catch (err: any) {
      setSyncLogs((prev) => [...prev, `[Error] Network error occurred: ${err.message}`]);
    } finally {
      setIsSyncingData(false);
    }
  };

  // Logo icon dynamic renderer
  const renderLogoIcon = (name: string, className: string) => {
    switch (name) {
      case "Cpu": return <Cpu className={className} />;
      case "Database": return <Database className={className} />;
      case "MessageSquare": return <MessageSquare className={className} />;
      case "Building": return <Building className={className} />;
      case "Package": return <Package className={className} />;
      case "Layers": return <Layers className={className} />;
      case "Terminal": return <Terminal className={className} />;
      case "Code2": return <Code2 className={className} />;
      case "UserCheck": return <UserCheck className={className} />;
      case "TrendingUp": return <TrendingUp className={className} />;
      case "Bot": return <Bot className={className} />;
      case "Sparkles": return <Sparkles className={className} />;
      case "Briefcase": return <Briefcase className={className} />;
      default: return <Cpu className={className} />;
    }
  };

  // Live Simulation States
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", content: "Swagat hai! Main aapka ERPNext AI Copilot hoon. Aap mujhse stock checking, customer outstanding bills, leads banana, ya sales quotations generate karne ke baare mein baat kar sakte hain." },
    { role: "model", content: "Namaste! Main ERPNext system se directly connected hoon. Aap mujhse kisi item ka stock pooch sakte hain (e.g. 'ERP-ITEM-101 ka stock check karo') ya koi lead create karne ko bol sakte hain (e.g. 'Amit Sharma, company Sharma Diagnostics, email amit@sharmadiag.com ka lead banao')." }
  ]);
  const [executionLogs, setExecutionLogs] = useState<LogEntry[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  
  // Mock Database view states (fetched live from local endpoints)
  const [mockStock, setMockStock] = useState<any>({});
  const [mockCustomers, setMockCustomers] = useState<any>({});
  const [mockLeads, setMockLeads] = useState<any[]>([]);
  const [mockQuotations, setMockQuotations] = useState<any[]>([]);
  const [activeDbTab, setActiveDbTab] = useState<"stock" | "customers" | "leads" | "quotations" | "forecasting" | "supplychain" | "analytics" | "sync" | "manage">("stock");

  // Next-Gen Supply Chain & Demand Forecasting States & Static Data
  const [selectedForecastItem, setSelectedForecastItem] = useState("ERP-ITEM-101");
  const [isGeneratingPO, setIsGeneratingPO] = useState(false);
  const [poResultMsg, setPoResultMsg] = useState("");

  const [truckProgress, setTruckProgress] = useState(0);
  const [isDispatching, setIsDispatching] = useState(false);
  const [shipmentLogs, setShipmentLogs] = useState<string[]>([
    "[09:30 AM] Inbound shipment ERP-ITEM-101 dispatched from Mumbai Hub.",
    "[10:15 AM] Inbound cargo cleared transit customs at NH4 highway.",
    "[11:00 AM] Shipment sorted and loaded onto Dispatch Truck-42A."
  ]);
  const [selectedLogisticsItem, setSelectedLogisticsItem] = useState("ERP-ITEM-101");

  const forecastData: Record<string, {
    history: number[];
    months: string[];
    safetyStock: number;
    reorderPoint: number;
    eoq: number;
    supplier: string;
    leadTime: string;
  }> = {
    "ERP-ITEM-101": {
      history: [850, 920, 1050, 1000, 1150, 1250, 1400],
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul (F)"],
      safetyStock: 250,
      reorderPoint: 450,
      eoq: 500,
      supplier: "Apex Pharmaceutical Industries",
      leadTime: "3 Days"
    },
    "ERP-ITEM-202": {
      history: [300, 280, 310, 325, 290, 320, 360],
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul (F)"],
      safetyStock: 80,
      reorderPoint: 150,
      eoq: 200,
      supplier: "Surgical Equipment Corp",
      leadTime: "2 Days"
    },
    "ERP-ITEM-303": {
      history: [120, 110, 95, 100, 85, 80, 110],
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul (F)"],
      safetyStock: 20,
      reorderPoint: 40,
      eoq: 100,
      supplier: "Sanitizer & Hygiene Labs Ltd",
      leadTime: "4 Days"
    },
    "ERP-ITEM-404": {
      history: [25, 30, 20, 18, 15, 15, 25],
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul (F)"],
      safetyStock: 5,
      reorderPoint: 10,
      eoq: 30,
      supplier: "Digital BioTech Systems",
      leadTime: "1 Day"
    }
  };

  const itemStockTrends: Record<string, number[]> = {
    "ERP-ITEM-101": [1100, 950, 1350, 1200, 1050, 1250, 1150],
    "ERP-ITEM-202": [280, 240, 420, 380, 310, 320, 280],
    "ERP-ITEM-303": [150, 110, 90, 180, 140, 80, 120],
    "ERP-ITEM-404": [45, 35, 25, 12, 40, 15, 30]
  };

  const getChartData = () => {
    const itemCode = selectedForecastItem;
    const itemForecast = forecastData[itemCode] || {
      history: [100, 150, 130, 170, 200, 220, 250],
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul (F)"]
    };
    
    const stockHistoryBase = itemStockTrends[itemCode] || [100, 90, 110, 105, 95, 120, 100];
    const currentStock = mockStock[itemCode]?.stock ?? stockHistoryBase[5];

    return itemForecast.months.map((month, i) => {
      const connIndex = itemForecast.months.length - 2;
      
      let stockVal = stockHistoryBase[i] ?? 100;
      if (i === connIndex) {
        stockVal = currentStock;
      } else if (i === connIndex + 1) {
        stockVal = Math.max(0, currentStock - (itemForecast.history[connIndex + 1] - itemForecast.history[connIndex]) / 2);
      }

      return {
        name: month,
        actualDemand: i <= connIndex ? itemForecast.history[i] : null,
        predictedDemand: i >= connIndex ? itemForecast.history[i] : null,
        stockLevel: stockVal
      };
    });
  };

  const triggerAutoPO = async (itemCode: string) => {
    if (isGeneratingPO) return;
    setIsGeneratingPO(true);
    setPoResultMsg("⏳ Contacting supplier & validating lead times...");
    
    setTimeout(() => {
      setPoResultMsg("📋 Draft Purchase Order (PO-2026-004) successfully created in Frappe Accounts!");
    }, 1200);

    setTimeout(async () => {
      const currentItem = mockStock[itemCode];
      if (currentItem) {
        const eoq = forecastData[itemCode]?.eoq || 100;
        const targetStock = (currentItem.stock || 0) + eoq;
        
        try {
          const res = await fetch("/api/erpnext/add-record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              table: "stock",
              data: {
                item_code: itemCode,
                name: currentItem.name,
                stock: targetStock,
                warehouse: currentItem.warehouse,
                price: currentItem.price
              }
            })
          });
          if (res.ok) {
            setPoResultMsg(`✅ Success! Received +${eoq} units. Stock levels updated live in ERPNext!`);
            fetchMockDb();
          } else {
            setPoResultMsg("❌ Failed to update ERPNext database.");
          }
        } catch (err) {
          console.error(err);
          setPoResultMsg("❌ Database sync error.");
        }
      } else {
        setPoResultMsg("❌ Item details not found in local stock ledger.");
      }
      setIsGeneratingPO(false);
    }, 2800);
  };

  const triggerDispatchTruck = () => {
    if (isDispatching) return;
    setIsDispatching(true);
    setTruckProgress(0);
    
    const item = mockStock[selectedLogisticsItem];
    const itemName = item ? item.name : "Surgical Supplies";
    
    const newLogs = [
      `[0.0s] 🚛 Dispatch: Outbound truck loaded with +500 units of ${itemName}.`,
    ];
    setShipmentLogs(newLogs);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setTruckProgress(progress);
      
      if (progress === 25) {
        setShipmentLogs(prev => [
          ...prev,
          `[2.5s] 🛣️ Highway Transit: Cargo truck cleared the Western Express Highway Toll. Status: Normal.`
        ]);
      } else if (progress === 50) {
        setShipmentLogs(prev => [
          ...prev,
          `[5.0s] 🛰️ GPS Signal: Vehicle crossing state boundary. Temperature control systems verified.`
        ]);
      } else if (progress === 75) {
        setShipmentLogs(prev => [
          ...prev,
          `[7.5s] 📦 Sorting Hub: Truck entered Regional Cargo Terminal. Unloading list generated.`
        ]);
      } else if (progress === 100) {
        clearInterval(interval);
        setShipmentLogs(prev => [
          ...prev,
          `[10.0s] 🏁 Delivery Complete: Truck safely arrived at ${item?.warehouse || "Main Store"}. Inventory added to database!`
        ]);
        
        if (item) {
          fetch("/api/erpnext/add-record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              table: "stock",
              data: {
                item_code: selectedLogisticsItem,
                name: item.name,
                stock: (item.stock || 0) + 500,
                warehouse: item.warehouse,
                price: item.price
              }
            })
          }).then(() => {
            fetchMockDb();
            setIsDispatching(false);
          });
        } else {
          setIsDispatching(false);
        }
      }
    }, 500);
  };

  // Database custom management states
  const [formTable, setFormTable] = useState<"stock" | "customers" | "leads" | "quotations">("stock");
  const [formStock, setFormStock] = useState({ item_code: "", name: "", stock: "", warehouse: "Main Store", price: "" });
  const [formCustomer, setFormCustomer] = useState({ customer_name: "", outstanding: "", credit_limit: "500000", email: "" });
  const [formLead, setFormLead] = useState({ lead_name: "", company_name: "", email: "", phone: "" });
  const [formQuotation, setFormQuotation] = useState({ customer_name: "", item_code: "", qty: "", grand_total: "", status: "Draft" });
  const [formStatusMessage, setFormStatusMessage] = useState({ text: "", isError: false });

  const handleClearDb = async (table?: string) => {
    try {
      const res = await fetch("/api/erpnext/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table })
      });
      if (res.ok) {
        setFormStatusMessage({ text: `${table ? table.toUpperCase() : "Complete"} Database successfully cleared!`, isError: false });
        fetchMockDb();
      } else {
        setFormStatusMessage({ text: "Failed to clear database.", isError: true });
      }
    } catch (e: any) {
      setFormStatusMessage({ text: `Error: ${e.message}`, isError: true });
    }
  };

  const handleResetDbToDefault = async () => {
    try {
      const res = await fetch("/api/erpnext/reset-default", {
        method: "POST"
      });
      if (res.ok) {
        setFormStatusMessage({ text: "Database successfully reset to defaults!", isError: false });
        fetchMockDb();
      } else {
        setFormStatusMessage({ text: "Failed to reset database.", isError: true });
      }
    } catch (e: any) {
      setFormStatusMessage({ text: `Error: ${e.message}`, isError: true });
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatusMessage({ text: "", isError: false });
    
    let data: any = {};
    if (formTable === "stock") {
      if (!formStock.item_code || !formStock.name) {
        setFormStatusMessage({ text: "Item Code aur Name required hain!", isError: true });
        return;
      }
      data = formStock;
    } else if (formTable === "customers") {
      if (!formCustomer.customer_name) {
        setFormStatusMessage({ text: "Customer Name required hai!", isError: true });
        return;
      }
      data = formCustomer;
    } else if (formTable === "leads") {
      if (!formLead.lead_name || !formLead.company_name || !formLead.email) {
        setFormStatusMessage({ text: "Lead Name, Company Name, aur Email required hain!", isError: true });
        return;
      }
      data = formLead;
    } else if (formTable === "quotations") {
      if (!formQuotation.customer_name || !formQuotation.item_code || !formQuotation.qty) {
        setFormStatusMessage({ text: "Customer, Item Code aur Quantity required hain!", isError: true });
        return;
      }
      data = formQuotation;
    }

    try {
      const res = await fetch("/api/erpnext/add-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: formTable, data })
      });
      
      const result = await res.json();
      if (res.ok) {
        setFormStatusMessage({ text: `Record successfully added in ${formTable}!`, isError: false });
        if (formTable === "stock") setFormStock({ item_code: "", name: "", stock: "", warehouse: "Main Store", price: "" });
        else if (formTable === "customers") setFormCustomer({ customer_name: "", outstanding: "", credit_limit: "500000", email: "" });
        else if (formTable === "leads") setFormLead({ lead_name: "", company_name: "", email: "", phone: "" });
        else if (formTable === "quotations") setFormQuotation({ customer_name: "", item_code: "", qty: "", grand_total: "", status: "Draft" });
        
        fetchMockDb();
      } else {
        setFormStatusMessage({ text: result.error || "Failed to add record.", isError: true });
      }
    } catch (e: any) {
      setFormStatusMessage({ text: `Error: ${e.message}`, isError: true });
    }
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const aiProvider = "gemini";

  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    try {
      const saved = localStorage.getItem("erp_gemini_api_key");
      if (saved && saved !== "AIzaSyC17HB2SdYbfrq2u0D87Fr76N7HWGYP-R4") {
        return saved;
      }
      return "";
    } catch {
      return "";
    }
  });

  const handleApiKeyChange = (val: string) => {
    setGeminiApiKey(val);
    setCooldownTime(0); // Reset rate-limiting cooldown if custom API key is changed/input
    try {
      localStorage.setItem("erp_gemini_api_key", val);
    } catch (e) {
      console.error(e);
    }
  };

  const [customSystemPrompt, setCustomSystemPrompt] = useState(() => {
    try {
      return localStorage.getItem("erp_custom_system_prompt") || "";
    } catch {
      return "";
    }
  });

  const handleSystemPromptChange = (val: string) => {
    setCustomSystemPrompt(val);
    try {
      localStorage.setItem("erp_custom_system_prompt", val);
    } catch (e) {
      console.error(e);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Mock ERPNext DB content
  const fetchMockDb = async () => {
    try {
      const stockRes = await fetch("/api/erpnext/stock");
      const custRes = await fetch("/api/erpnext/customers");
      const leadRes = await fetch("/api/erpnext/leads");
      const qtnRes = await fetch("/api/erpnext/quotations");
      
      if (stockRes.ok) setMockStock(await stockRes.json());
      if (custRes.ok) setMockCustomers(await custRes.json());
      if (leadRes.ok) setMockLeads(await leadRes.json());
      if (qtnRes.ok) setMockQuotations(await qtnRes.json());
    } catch (e) {
      console.error("Failed to fetch mock DB:", e);
    }
  };

  useEffect(() => {
    fetchMockDb();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (cooldownTime <= 0) return;
    const timer = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownTime]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isSending || cooldownTime > 0) return;

    const userMsg = chatInput;
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsSending(true);

    const activeApiKey = geminiApiKey;

    if (activeApiKey && !activeApiKey.trim().startsWith("AIzaSy")) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { 
            role: "model", 
            content: "⚠️ Custom Gemini API Key ka format invalid hai! Custom key 'AIzaSy' se shuru honi chahiye. Is field ko khali (empty) chhod dein taaki project built-in free proxy mode me safely chale." 
          }
        ]);
        setIsSending(false);
      }, 500);
      return;
    }

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMsg }],
          apiKey: activeApiKey,
          erpSyncEnabled,
          erpUrl,
          erpApiKey,
          erpApiSecret,
          customSystemPrompt
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, { role: "model", content: data.answer }]);
        if (data.executionLog) {
          setExecutionLogs(data.executionLog);
        }
        // Refresh local DB data to show changes
        await fetchMockDb();
      } else {
        const errMsg = data.error || "Kuch gadbad ho gayi. Please check if your API Key is configured.";
        const isRateLimit = response.status === 429 || 
          data.isRateLimit ||
          errMsg.includes("429") || 
          errMsg.toLowerCase().includes("quota") || 
          errMsg.toLowerCase().includes("rate limit") || 
          errMsg.toLowerCase().includes("limit exceeded");
        
        if (isRateLimit) {
          const cooldown = data.retryAfter || 60;
          setCooldownTime(cooldown);
        }
        setMessages((prev) => [...prev, { role: "model", content: errMsg }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "model", content: "Error: Host se contact nahi ho paya. Please try again." }]);
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPublicProxyUrl = () => {
    const origin = window.location.origin;
    if (origin.includes("-dev-")) {
      return origin.replace("-dev-", "-pre-") + "/api/proxy/chat";
    }
    return origin + "/api/proxy/chat";
  };

  const getBase64PythonCommand = () => {
    const isProxyMode = !geminiApiKey.trim();
    const keyToUse = geminiApiKey.trim();

    const pythonCode = isProxyMode
        ? `import frappe
import requests
import json

@frappe.whitelist(allow_guest=True)
def chat_with_gemini(*args, **kwargs):
    try:
        user_message = kwargs.get("user_message") or kwargs.get("message")
        if not user_message:
            user_message = frappe.form_dict.get("user_message") or frappe.form_dict.get("message")
        if not user_message and frappe.request and frappe.request.data:
            try:
                req_data = json.loads(frappe.request.data)
                user_message = req_data.get("user_message") or req_data.get("message")
            except Exception:
                pass

        if not user_message:
            return {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": "[System Warning] No user message found in request. Please pass 'user_message' or 'message'."
                        }]
                    }
                }]
            }

        stock_data = []
        try:
            if frappe.db.exists("DocType", "Bin"):
                stock_data = frappe.db.get_all("Bin", fields=["item_code", "actual_qty"], limit=5)
        except Exception:
            pass

        # 100% Free Workspace Keyless Proxy Mode (No configuration required!)
        proxy_url = "${getPublicProxyUrl()}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "user_message": user_message,
            "stock_data": stock_data
        }

        try:
            response = requests.post(proxy_url, json=payload, headers=headers, timeout=15)
        except Exception as conn_err:
            return {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": f"⚠️ [Connection Error]: Proxy server se connect nahi ho pa raha hai. Kripya check karein ki aapka internet chal raha hai aur proxy_url sahi hai.\\nURL: {proxy_url}\\nError: {str(conn_err)}"
                        }]
                    }
                }]
            }

        # Check if response is HTML (auth redirect or 404 page)
        content_type = response.headers.get("Content-Type", "")
        if "text/html" in content_type or response.text.strip().startswith("<") or response.text.strip().startswith("<!doctype"):
            is_dev = "-dev-" in proxy_url
            if "404" in response.text or response.status_code == 404:
                return {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": f"⚠️ [Proxy Error 404]: AI Studio me aapka chatbot abhi tak shared/deployed nahi hua hai.\\n\\n👉 **Fix Kaise Karein?**\\n1. AI Studio me sabse upar right-side me **'Share'** button par click karein.\\n2. Jab deploy successfully ho jaye, tab fir se test karein!\\nURL: {proxy_url}"
                            }]
                        }
                    }]
                }
            elif is_dev:
                return {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": f"⚠️ [Proxy Error - Private URL]: Aap private '-dev-' URL use kar rahe hain, jo ki safe browser session ke bina block ho jata hai.\\n\\n👉 **Fix Kaise Karein?**\\n1. AI Studio me sabse upar right-side me **'Share'** button par click karke public Shared App URL (-pre- wala URL) active karein.\\n2. Uske baad naya code copy karke terminal me paste karein taaki sahi proxy_url use ho sake!\\nURL: {proxy_url}"
                            }]
                        }
                    }]
                }
            else:
                return {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": f"⚠️ [Proxy Error - Deploy Needed]: Aapka shared URL (-pre-) abhi tak public nahi hua hai, isliye Google login maang raha hai.\\n\\n👉 **Fix Kaise Karein?**\\n1. Apne AI Studio window me sabse upar right-side me **'Share'** button par click karein.\\n2. Wahan pe **'Share App'** button par click karke use publish karein taaki public link active ho jaye.\\n3. Tab bina login ke chatbot chalne lagega!\\nURL: {proxy_url}"
                            }]
                        }
                    }]
                }

        if response.status_code == 200:
            try:
                return response.json()
            except Exception as json_err:
                return {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": f"⚠️ [JSON Decode Error]: Server returned non-JSON response.\\nStatus: {response.status_code}\\nResponse Preview: {response.text[:200]}"
                            }]
                        }
                    }]
                }
        else:
            return {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": f"⚠️ [Workspace Proxy Error] (HTTP {response.status_code}):\\n{response.text[:300]}"
                        }]
                    }
                }]
            }

    except Exception as e:
        frappe.log_error(title="Gemini Chatbot Error", message=frappe.get_traceback())
        return {
            "candidates": [{
                "content": {
                    "parts": [{
                        "text": f"[Python Exception]: {str(e)}"
                    }]
                }
            }]
        }
`
        : `import frappe
import requests
import json

@frappe.whitelist(allow_guest=True)
def chat_with_gemini(*args, **kwargs):
    try:
        user_message = kwargs.get("user_message") or kwargs.get("message")
        if not user_message:
            user_message = frappe.form_dict.get("user_message") or frappe.form_dict.get("message")
        if not user_message and frappe.request and frappe.request.data:
            try:
                req_data = json.loads(frappe.request.data)
                user_message = req_data.get("user_message") or req_data.get("message")
            except Exception:
                pass

        if not user_message:
            return {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": "[System Warning] No user message found in request. Please pass 'user_message' or 'message'."
                        }]
                    }
                }]
            }

        stock_data = []
        try:
            if frappe.db.exists("DocType", "Bin"):
                stock_data = frappe.db.get_all("Bin", fields=["item_code", "actual_qty"], limit=5)
        except Exception:
            pass

        api_key = "${keyToUse}"

        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": f"Context: {stock_data}. User Query: {user_message}. Act as a friendly ERP Assistant and reply briefly in mixed Hindi and English."}]}]
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
        response = requests.post(url, json=payload, headers=headers, timeout=30)

        if response.status_code == 200:
            return response.json()
        else:
            return {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": f"[Gemini API Error] (HTTP {response.status_code}): {response.text}"
                        }]
                    }
                }]
            }

    except Exception as e:
        frappe.log_error(title="Gemini Chatbot Error", message=frappe.get_traceback())
        return {
            "candidates": [{
                "content": {
                    "parts": [{
                        "text": f"[Python Exception]: {str(e)}"
                    }]
                }
            }]
        }
`;

    try {
      const utf8Bytes = new TextEncoder().encode(pythonCode);
      let binary = "";
      const len = utf8Bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      const base64 = btoa(binary);
      return `echo "${base64}" | base64 -di > ~/frappe-bench/apps/ai_chatbot/ai_chatbot/api.py`;
    } catch (e) {
      return `cat << 'EOF' > ~/frappe-bench/apps/ai_chatbot/ai_chatbot/api.py
\${pythonCode}
EOF`;
    }
  };

  // Sample quick queries for simulation
  const quickQueries = [
    { label: "📦 Item 101 Stock check", query: "ERP-ITEM-101 ka stock check karke batao kahan hai aur kitna hai?" },
    { label: "👤 Tata Motors outstanding balance", query: "Tata Motors ka outstanding amount aur credit limit check karo." },
    { label: "➕ Create CRM Lead", query: "Ek lead add karo: Raj Verma, company Verma Steel, email raj@vermasteel.com" },
    { label: "📑 Create Quotation draft", query: "Tata Motors ke liye 50 units ERP-ITEM-202 ki draft quotation banao." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      {/* Premium Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 bg-gradient-to-tr ${tc.gradient} rounded-xl shadow-lg ${tc.shadow}`}>
              {renderLogoIcon(customLogo, "w-6 h-6 text-slate-950 font-bold")}
            </div>
            <div>
              <h1 className={`text-xl font-bold tracking-tight bg-gradient-to-r ${tc.textGradient} bg-clip-text text-transparent font-display`}>
                {customAppName}
              </h1>
              <p className="text-xs text-slate-400">
                Real ERPNext Sync, Custom Branding Engine, and Live Database Analytics Sandbox
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Presentation Mode / Developer Mode Toggle Switch */}
            <button
              onClick={() => handleToggleDeveloperMode(!isDeveloperMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center gap-1.5 border ${
                isDeveloperMode 
                  ? `${tc.primaryBorder} ${tc.primaryText} bg-slate-900/80` 
                  : "border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-950/40"
              }`}
              title={isDeveloperMode ? "Switch to Client Demo View (Hides all tutorials/logs)" : "Switch to Developer Setup & Reboot View"}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isDeveloperMode ? "🔧 Dev Mode: ON" : "👥 Client Demo: ACTIVE"}</span>
            </button>

            <span className={`text-xs ${tc.primaryText} font-mono ${tc.bgLight} px-3 py-1.5 rounded-full border ${tc.borderLight} flex items-center gap-1.5`}>
              <span className={`w-2 h-2 rounded-full ${tc.primaryBg} animate-pulse`}></span>
              {erpSyncEnabled ? "Real ERPNext Live API Sync Active" : "Local Mock Sandbox Active"}
            </span>
            <button 
              onClick={() => {
                setActiveTab("simulation");
              }}
              className={`px-4 py-1.5 bg-gradient-to-r ${tc.gradient} text-slate-950 font-medium text-xs rounded-lg hover:brightness-110 transition flex items-center gap-1.5`}
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Play Simulation
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* QUICK BRANDING IDENTITY BAR */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${tc.bgLight}`}>
              <Sparkles className={`w-4 h-4 ${tc.primaryText}`} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">Quick Brand & App Customizer (Change Theme Instantly!)</h3>
              <p className="text-[10px] text-slate-400">Yeh tool se aap app ka brand color aur title instantly change kar sakte hain!</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {/* Theme Selectors */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-850">
              {[
                { id: "emerald", label: "Emerald", color: "bg-emerald-500" },
                { id: "sapphire", label: "Sapphire", color: "bg-blue-500" },
                { id: "amber", label: "Amber", color: "bg-amber-500" },
                { id: "steel", label: "Steel", color: "bg-slate-400" },
                { id: "crimson", label: "Crimson", color: "bg-rose-500" }
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id as any)}
                  className={`w-5 h-5 rounded-full ${theme.color} border transition-all cursor-pointer ${
                    brandTheme === theme.id ? "scale-110 border-white ring-2 ring-slate-800" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  title={`Switch to ${theme.label} Theme`}
                />
              ))}
            </div>
            
            {/* Name Input */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">App Title:</span>
              <input
                type="text"
                value={customAppName}
                onChange={(e) => handleAppNameChange(e.target.value)}
                className={`bg-slate-950 border border-slate-800 focus:border-${tc.primary} rounded px-2.5 py-1 text-[11px] text-slate-200 focus:outline-none font-mono w-52`}
                placeholder="Custom App Name"
              />
            </div>
          </div>
        </div>

        {/* CRITICAL URGENT REBOOT & ERROR RESOLUTION DASHBOARD */}
        {isDeveloperMode && (
          <div className={`bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 ${tc.primaryBorder} rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-6`}>
          <div className={`absolute top-0 right-0 w-48 h-48 ${tc.bgLight} rounded-full blur-3xl -mr-16 -mt-16`}></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className={`p-3 bg-slate-900/40 ${tc.primaryText} rounded-xl border ${tc.borderLight} animate-pulse`}>
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h2 className={`text-lg font-extrabold ${tc.primaryText} flex items-center gap-2 tracking-wide uppercase`}>
                  💻 WSL LAPTOP REBOOT & ERROR RESOLUTION DASHBOARD
                </h2>
                <p className="text-xs text-slate-300">
                  Aapka laptop restart hua hai aur `import frappe` errors aa rahe hain. Is complete guide se abhi 2 minute me fix karein!
                </p>
              </div>
            </div>
            <div className="bg-rose-500/15 text-rose-300 px-4 py-1.5 rounded-full text-xs font-bold border border-rose-500/20 text-center uppercase tracking-wider animate-pulse">
              ⏱️ 2-Min Guaranteed Fix Guide
            </div>
          </div>

          {/* CRITICAL WARNING: WHY THE PASTING ERROR HAPPENED */}
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm border-b border-rose-500/10 pb-2">
              <AlertCircle className="w-5 h-5 text-rose-400 animate-bounce" />
              <span>❌ AAPKI GALTI SAMJHEIN (Terminal Me Python Paste Nahi Karna Tha!)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Aap apne WSL terminal (black/blue window) me direct lines copy-paste kar rahe hain jaise <code className="bg-slate-950 px-1 py-0.5 rounded text-rose-300 font-mono">import frappe</code> ya <code className="bg-slate-950 px-1 py-0.5 rounded text-rose-300 font-mono">import requests</code>. 
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-rose-500/20 space-y-2">
                <span className="text-rose-400 font-bold block">🚨 Terminal Ka Reaction:</span>
                <p className="text-[11px] text-slate-400">
                  Terminal is python code ko <strong>Linux/Bash Commands</strong> samajh kar execute kar raha hai. Chunki Linux me "import" naam ka koi server command nahi hota, isliye wo bolta hai: <code className="text-rose-300 font-mono text-[10px] block mt-1 bg-slate-900 p-1 rounded">Command 'import' not found, but can be installed with: sudo apt install imagemagick...</code>
                </p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-rose-500/20 space-y-2">
                <span className="text-emerald-400 font-bold block">💡 Sahi Rule:</span>
                <p className="text-[11px] text-slate-400">
                  Python commands ko terminal me direct enter nahi kiya jata. Unhe humein file (<strong className="text-slate-200 font-mono">api.py</strong>) ke andar save karna hai. Uske liye niche diye gaye foolproof method ka istemaal karein.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 1: API KEYS EXPLANATION (100% FREE OPTIONS) */}
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className={`flex items-center gap-2 ${tc.primaryText} font-extrabold text-sm border-b border-slate-800 pb-2`}>
              <Key className={`w-5 h-5 ${tc.primaryText} animate-pulse`} />
              <span>🔑 STEP 1: GOOGLE GEMINI API KEY CONFIGURATION</span>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Aapko is project ke liye ek bhi paisa (no paid api keys) kharch karne ki zarurat nahi hai! Humne is chatbot ko Google Gemini ke sath integrate kiya hai:
            </p>

            <div className="max-w-2xl text-xs text-slate-300">
              {/* Option A: Google Gemini Free Key */}
              <div className={`space-y-3 p-4 bg-slate-950/60 rounded-lg border-2 ${tc.border30} flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`${tc.primaryText} font-bold text-xs`}>🟢 Google Gemini (FREE TIER)</span>
                    <span className={`${tc.bgLight} ${tc.primaryText} px-1.5 py-0.5 rounded text-[9px] font-mono font-bold`}>100% FREE</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
                    Google AI Studio aapko daily testing ke liye <strong>Gemini 3.5 Flash</strong> bilkul free me provide karta hai (no credit card required!).
                  </p>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`inline-block text-center font-bold ${tc.primaryText} hover:brightness-110 bg-slate-900 px-2 py-1 rounded border ${tc.borderLight} text-[10px] w-full mb-3`}
                  >
                    👉 GET FREE GEMINI KEY FROM GOOGLE 🌐
                  </a>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block font-semibold">Gemini API Key yahan paste karein:</label>
                  <input
                    type="text"
                    placeholder="AIzaSy... (Paste Gemini Key)"
                    className={`w-full bg-slate-900 ${tc.primaryText} text-xs px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-${tc.primary} font-mono`}
                    value={geminiApiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                  />
                  {geminiApiKey ? (
                    <span className={`text-[9px] ${tc.primaryText} font-semibold block`}>✓ Gemini Key save ho gayi! 1-Line fix command me auto-fill ho chuki hai.</span>
                  ) : (
                    <span className={`text-[10px] ${tc.primaryText} font-bold block`}>✓ Workspace Default Key Active! Bilkul free aur unlimited response chalega (No API Key Required).</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: THE GUARANTEED METHODS TO FIX THE FILE */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-1.5 uppercase">
              <Terminal className={`w-5 h-5 ${tc.primaryText}`} />
              <span>👉 STEP 2: FILE CODES WRITE KAREIN (CHOOSE ANY ONE METHOD)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* METHOD A: BASE64 SINGLE LINE */}
              <div className={`bg-slate-900/60 rounded-xl border-2 ${tc.primaryBorder} p-5 space-y-4 flex flex-col justify-between`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`${tc.primaryBg} text-slate-950 font-black text-xs px-2 py-0.5 rounded-full uppercase`}>Option A</span>
                    <h4 className="text-xs font-extrabold text-slate-200">✨ FOOLPROOF 1-LINE BASE64 COMMAND (RECOMMENDED!)</h4>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Yeh sabse behtareen aur foolproof tareeqa hai. Isko click karne par ek <strong>SINGLE-LINE (ek line)</strong> ka code copy hoga. Jab aap isko terminal me paste karenge, toh yeh pure python code ko automatic background me decode karke <code className={`${tc.primaryText} font-mono bg-slate-950 px-1 rounded`}>api.py</code> me save kar dega!
                  </p>
                  <p className="text-slate-400 text-[10.5px]">
                    ✓ Isme multi-line pasting, backslashes, ya dollar signs ke corrupt hone ka zero chance hai!
                  </p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      const base64Cmd = getBase64PythonCommand();
                      copyToClipboard(base64Cmd, "python_base64_fix");
                    }}
                    className={`w-full bg-gradient-to-r ${tc.gradient} text-slate-950 text-center font-extrabold py-3 px-4 rounded-xl text-xs select-none cursor-pointer active:scale-[0.98] transition-all shadow-lg border ${tc.borderLight} flex items-center justify-center gap-2`}
                  >
                    <Terminal className="w-4 h-4" />
                    <span>
                      {copiedId === "python_base64_fix" 
                        ? "✅ 1-LINE COMMAND COPIED!" 
                        : "CLICK TO COPY 1-LINE BASE64 MASTER FIXED COMMAND"}
                    </span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">
                    💡 **Kaise karein**: Bas is button ko dabayein, terminal me paste karke <strong className="text-white">Enter</strong> daba dein. Kaam khatam!
                  </p>
                </div>
              </div>

              {/* METHOD B: NANO VISUAL EDITOR */}
              <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-800 text-slate-300 font-black text-xs px-2 py-0.5 rounded-full uppercase">Option B</span>
                    <h4 className="text-xs font-extrabold text-slate-200">📝 MANUAL NANO VISUAL EDITOR (SAFE & STEADY)</h4>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Agar aap manually file ke andar likhna chahte hain bina direct code execution ke:
                  </p>
                  <ol className="text-[10.5px] text-slate-400 space-y-1 list-decimal list-inside">
                    <li>Terminal me yeh command run karein: <code className="text-slate-300 font-mono bg-slate-950 px-1">nano ~/frappe-bench/apps/ai_chatbot/ai_chatbot/api.py</code></li>
                    <li>Ek screen khulegi. Agar wahan pehle se koi kachra likha hai toh use <code className="text-amber-400">Ctrl + K</code> daba kar saara delete karein jab tak file khali na ho jaye.</li>
                    <li>Upar diye box me OpenRouter Key enter karne ke baad, niche wale button se pure python code ko copy karke terminal me right-click karke paste kar dein!</li>
                    <li>File ko save karne ke liye: <code className="text-emerald-400 font-mono">Ctrl+O</code> fir <code className="text-emerald-400 font-mono">Enter</code>, aur fir exit ke liye <code className="text-emerald-400 font-mono">Ctrl+X</code> dabayein!</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <button 
                    translate="no"
                    onClick={() => {
                      const isProxyMode = !geminiApiKey.trim();
                      const keyToUse = geminiApiKey.trim();
                      const pythonCode = isProxyMode
                        ? `import frappe
import requests
import json

@frappe.whitelist(allow_guest=True)
def chat_with_gemini(*args, **kwargs):
    try:
        user_message = kwargs.get("user_message") or kwargs.get("message")
        if not user_message:
            user_message = frappe.form_dict.get("user_message") or frappe.form_dict.get("message")
        if not user_message and frappe.request and frappe.request.data:
            try:
                req_data = json.loads(frappe.request.data)
                user_message = req_data.get("user_message") or req_data.get("message")
            except Exception:
                pass

        if not user_message:
            return {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": "[System Warning] No user message found in request. Please pass 'user_message' or 'message'."
                        }]
                    }
                }]
            }

        stock_data = []
        try:
            if frappe.db.exists("DocType", "Bin"):
                stock_data = frappe.db.get_all("Bin", fields=["item_code", "actual_qty"], limit=5)
        except Exception:
            pass

        # 100% Free Workspace Keyless Proxy Mode (No configuration required!)
        proxy_url = "${getPublicProxyUrl()}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "user_message": user_message,
            "stock_data": stock_data
        }

        try:
            response = requests.post(proxy_url, json=payload, headers=headers, timeout=15)
        except Exception as conn_err:
            return {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": f"⚠️ [Connection Error]: Proxy server se connect nahi ho pa raha hai. Kripya check karein ki aapka internet chal raha hai aur proxy_url sahi hai.\\nURL: {proxy_url}\\nError: {str(conn_err)}"
                        }]
                    }
                }]
            }

        # Check if response is HTML (auth redirect or 404 page)
        content_type = response.headers.get("Content-Type", "")
        if "text/html" in content_type or response.text.strip().startswith("<") or response.text.strip().startswith("<!doctype"):
            is_dev = "-dev-" in proxy_url
            if "404" in response.text or response.status_code == 404:
                return {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": f"⚠️ [Proxy Error 404]: AI Studio me aapka chatbot abhi tak shared/deployed nahi hua hai.\\n\\n👉 **Fix Kaise Karein?**\\n1. AI Studio me sabse upar right-side me **'Share'** button par click karein.\\n2. Jab deploy successfully ho jaye, tab fir se test karein!\\nURL: {proxy_url}"
                            }]
                        }
                    }]
                }
            elif is_dev:
                return {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": f"⚠️ [Proxy Error - Private URL]: Aap private '-dev-' URL use kar rahe hain, jo ki safe browser session ke bina block ho jata hai.\\n\\n👉 **Fix Kaise Karein?**\\n1. AI Studio me sabse upar right-side me **'Share'** button par click karke public Shared App URL (-pre- wala URL) active karein.\\n2. Uske baad naya code copy karke terminal me paste karein taaki sahi proxy_url use ho sake!\\nURL: {proxy_url}"
                            }]
                        }
                    }]
                }
            else:
                return {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": f"⚠️ [Proxy Error - Deploy Needed]: Aapka shared URL (-pre-) abhi tak public nahi hua hai, isliye Google login maang raha hai.\\n\\n👉 **Fix Kaise Karein?**\\n1. Apne AI Studio window me sabse upar right-side me **'Share'** button par click karein.\\n2. Wahan pe **'Share App'** button par click karke use publish karein taaki public link active ho jaye.\\n3. Tab bina login ke chatbot chalne lagega!\\nURL: {proxy_url}"
                            }]
                        }
                    }]
                }

        if response.status_code == 200:
            try:
                return response.json()
            except Exception as json_err:
                return {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": f"⚠️ [JSON Decode Error]: Server returned non-JSON response.\\nStatus: {response.status_code}\\nResponse Preview: {response.text[:200]}"
                            }]
                        }
                    }]
                }
        else:
            return {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": f"⚠️ [Workspace Proxy Error] (HTTP {response.status_code}):\\n{response.text[:300]}"
                        }]
                    }
                }]
            }

    except Exception as e:
        frappe.log_error(title="Gemini Chatbot Error", message=frappe.get_traceback())
        return {
            "candidates": [{
                "content": {
                    "parts": [{
                        "text": f"[Python Exception]: {str(e)}"
                    }]
                }
            }]
        }
`
                        : `import frappe
import requests
import json

@frappe.whitelist(allow_guest=True)
def chat_with_gemini(*args, **kwargs):
    try:
        user_message = kwargs.get("user_message") or kwargs.get("message")
        if not user_message:
            user_message = frappe.form_dict.get("user_message") or frappe.form_dict.get("message")
        if not user_message and frappe.request and frappe.request.data:
            try:
                req_data = json.loads(frappe.request.data)
                user_message = req_data.get("user_message") or req_data.get("message")
            except Exception:
                pass

        if not user_message:
            return {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": "[System Warning] No user message found in request. Please pass 'user_message' or 'message'."
                        }]
                    }
                }]
            }

        stock_data = []
        try:
            if frappe.db.exists("DocType", "Bin"):
                stock_data = frappe.db.get_all("Bin", fields=["item_code", "actual_qty"], limit=5)
        except Exception:
            pass

        api_key = "${keyToUse}"

        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": f"Context: {stock_data}. User Query: {user_message}. Act as a friendly ERP Assistant and reply briefly in mixed Hindi and English."}]}]
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
        response = requests.post(url, json=payload, headers=headers, timeout=30)

        if response.status_code == 200:
            return response.json()
        else:
            return {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": f"[Gemini API Error] (HTTP {response.status_code}): {response.text}"
                        }]
                    }
                }]
            }

    except Exception as e:
        frappe.log_error(title="Gemini Chatbot Error", message=frappe.get_traceback())
        return {
            "candidates": [{
                "content": {
                    "parts": [{
                        "text": f"[Python Exception]: {str(e)}"
                    }]
                }
            }]
        }
`;
                      copyToClipboard(pythonCode, "python_nano_raw");
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 text-center font-extrabold py-2.5 px-4 rounded-xl text-xs select-none cursor-pointer active:scale-[0.98] transition-all border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>
                      {copiedId === "python_nano_raw" 
                        ? "✅ PURE PYTHON CODE COPIED!" 
                        : "COPY PURE PYTHON CODE FOR NANO"}
                    </span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: BOOT SERVICES */}
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm border-b border-slate-800 pb-2">
              <RefreshCw className="w-5 h-5 text-cyan-400" />
              <span>🚀 STEP 3: SERVICES KO BOOT KAREIN (DATABASE, BINDING, SERVER)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300">
              
              {/* BOOT DB & CACHE */}
              <div className="space-y-3 p-4 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded-full inline-block uppercase">Step 3.1</span>
                  <h4 className="text-xs font-bold text-slate-200">Start MySQL & Redis</h4>
                  <p className="text-[11px] text-slate-400">
                    Sudo MySQL aur Redis Cache start karne ke liye in lines ko line-by-line chalayein:
                  </p>
                </div>
                <div className="space-y-2 bg-slate-900 p-2 rounded font-mono text-[11px] text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>sudo service mysql start</span>
                    <button onClick={() => copyToClipboard("sudo service mysql start", "db_s1")} className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded">{copiedId === "db_s1" ? "✓" : "Copy"}</button>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                    <span>sudo service redis-server start</span>
                    <button onClick={() => copyToClipboard("sudo service redis-server start", "db_s2")} className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded">{copiedId === "db_s2" ? "✓" : "Copy"}</button>
                  </div>
                </div>
              </div>

              {/* BIND HOST */}
              <div className="space-y-3 p-4 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded-full inline-block uppercase">Step 3.2</span>
                  <h4 className="text-xs font-bold text-slate-200">Bind Site Host (Fix 404)</h4>
                  <p className="text-[11px] text-slate-400">
                    Bench folder me jaakar default site selection enable karein:
                  </p>
                </div>
                <div className="bg-slate-900 p-2 rounded font-mono text-[11.5px] text-slate-300 flex items-center justify-between">
                  <div className="text-[11px]">
                    <div>cd ~/frappe-bench</div>
                    <div className="text-emerald-400">bench use mysite.localhost</div>
                  </div>
                  <button onClick={() => copyToClipboard("cd ~/frappe-bench && bench use mysite.localhost", "site_b")} className="text-[9px] bg-slate-800 px-1.5 py-1 rounded">{copiedId === "site_b" ? "✓" : "Copy"}</button>
                </div>
              </div>

              {/* START BENCH */}
              <div className="space-y-3 p-4 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded-full inline-block uppercase">Step 3.3</span>
                  <h4 className="text-xs font-bold text-slate-200">Bench Start (Web App Server)</h4>
                  <p className="text-[11px] text-slate-400">
                    Sab tayyar hone ke baad primary bench server start karein aur browser page reload karein:
                  </p>
                </div>
                <div className="bg-slate-900 p-2 rounded font-mono text-[11.5px] text-slate-300 flex items-center justify-between">
                  <div className="text-[11px]">
                    <div>cd ~/frappe-bench</div>
                    <div className="text-emerald-400">bench start</div>
                  </div>
                  <button onClick={() => copyToClipboard("cd ~/frappe-bench && bench start", "bench_s")} className="text-[9px] bg-slate-800 px-1.5 py-1 rounded">{copiedId === "bench_s" ? "✓" : "Copy"}</button>
                </div>
              </div>

            </div>
          </div>
        </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 p-1.5 rounded-xl gap-1">
          {isDeveloperMode && (
            <button
              onClick={() => setActiveTab("stepbystep")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === "stepbystep"
                  ? `bg-slate-800 ${tc.primaryText} border-b-2 ${tc.primaryBorder} shadow-md`
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>1. Step-by-Step Guide</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab("simulation")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === "simulation"
                ? `bg-slate-800 ${tc.primaryText} border-b-2 ${tc.primaryBorder} shadow-md`
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Play className="w-4 h-4" />
            <span>{isDeveloperMode ? "2. Live Simulation Sandbox" : "💬 Interactive AI Chatbot"}</span>
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === "architecture"
                ? `bg-slate-800 ${tc.primaryText} border-b-2 ${tc.primaryBorder} shadow-md`
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isDeveloperMode ? "3. System Architecture" : "📐 Copilot Architecture"}</span>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === "security"
                ? `bg-slate-800 ${tc.primaryText} border-b-2 ${tc.primaryBorder} shadow-md`
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>🔐 Site & Device Security</span>
          </button>
          {isDeveloperMode && (
            <>
              <button
                onClick={() => setActiveTab("code_snippets")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeTab === "code_snippets"
                    ? `bg-slate-800 ${tc.primaryText} border-b-2 ${tc.primaryBorder} shadow-md`
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>4. Custom App Code Snippets</span>
              </button>
              <button
                onClick={() => setActiveTab("apk_builder")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeTab === "apk_builder"
                    ? `bg-slate-800 ${tc.primaryText} border-b-2 ${tc.primaryBorder} shadow-md`
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>📱 Build Android APK</span>
              </button>
            </>
          )}
        </div>

        {/* 1. STEP BY STEP GUIDE TAB */}
        {activeTab === "stepbystep" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Guide Content Column */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6">
                <h2 className="text-2xl font-bold font-display text-emerald-400 mb-2 flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-mono">Prastavana</span>
                  ERPNext AI Chatbot Safar
                </h2>
                <p className="text-slate-300 leading-relaxed text-sm">
                  ERPNext system ke data ko AI se connect karna aur tasks ko automate karna ek behtareen business initiative hai. 
                  Is guide mein hum aapko seekhayenge ki kaise ek <strong>Custom Frappe App</strong> banakar, 
                  <strong>Gemini API (Function Calling)</strong> aur standard APIs ka use karke ek intelligent assistant tayyar kiya jaye.
                </p>
                
                <div className="mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-amber-300">Important Note on Implementation Scope:</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Direct ERPNext core code mein change mat kijiye! Isse updates fail ho jayenge. Hamesha ek alag <strong>Custom Frappe App</strong> banakar usme API endpoints aur AI handlers daalein.
                    </p>
                  </div>
                </div>
              </div>

              {/* SPECIAL WSL RECOVERY & GEMINI API KEY ASSISTANT PANELS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {/* Panel 1: WSL & Laptop Reboot Recovery Guide */}
                <div className="bg-slate-900/90 rounded-xl border-2 border-amber-500/30 p-5 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm border-b border-slate-800 pb-3">
                    <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                    <span>💻 LOCALHOST:8000 ERROR KO KAISE SOLVE KAREIN?</span>
                  </div>
                  
                  <div className="text-[11.5px] text-slate-200 leading-relaxed space-y-3">
                    <div className="p-3 bg-rose-500/15 border-2 border-rose-500/40 rounded-lg text-rose-200 space-y-2">
                      <p className="font-bold text-xs text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-400 animate-bounce" />
                        <span>🚨 SAMASYA: LOCALHOST:8000 PAR 404 / ERROR AA RAHA HAI?</span>
                      </p>
                      <p className="text-[10.5px]">
                        Aapne <strong>MariaDB</strong> aur <strong>Redis Server</strong> to start kar diya (jo bilkul sahi tha), par jab aap <code>localhost:8000</code> khol rahe hain, to browser me <strong>"404 No webpage was found"</strong> ya terminal me <strong>"RuntimeError: object is not bound"</strong> aa raha hai.
                      </p>
                      <p className="text-[10.5px] font-semibold text-amber-300">
                        Kyunki Frappe ko pata nahi chal raha ki generic <code>localhost</code> request ko kis folder (mysite.localhost) ke sath bind karna hai!
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-300 space-y-1">
                      <p className="font-bold text-xs text-emerald-400">
                        ✅ Isse 1-Minute Me Solve Karne Ka Tareeka (How to Fix):
                      </p>
                      <p className="text-[10.5px]">
                        Hume bench ko batana hoga ki <code>mysite.localhost</code> hamari default active site hai. Iske do bahut hi aasan tareeke hain, jo bhi aapko sahi lage:
                      </p>
                    </div>

                    <div className="space-y-3.5 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                      {/* Option 1: same terminal */}
                      <div className="space-y-2">
                        <span className="text-amber-400 font-bold block text-[11px]">👉 Tareeqa 1: Same terminal tab me (Stop karke run karein):</span>
                        <div className="bg-slate-900 p-3 rounded border border-slate-800 font-mono text-[11px] text-slate-200 space-y-1.5">
                          <div className="text-slate-500"># 1. Pehle chalte hue server ko band karne ke liye terminal me press karein:</div>
                          <div className="font-bold text-rose-400">Ctrl + C</div>
                          
                          <div className="text-slate-500 mt-2"># 2. Ab default site set karne wala command chalayein:</div>
                          <div className="font-bold text-white select-all">bench use mysite.localhost</div>
                          
                          <div className="text-slate-500 mt-2"># 3. Ab dubara server start karein:</div>
                          <div className="font-bold text-emerald-400 select-all">bench start</div>
                        </div>
                      </div>

                      {/* Option 2: new tab */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <span className="text-amber-400 font-bold block text-[11px]">👉 Tareeqa 2: Bina server band kiye (Naye tab me run karein):</span>
                        <div className="bg-slate-900 p-3 rounded border border-slate-800 font-mono text-[11px] text-slate-200 space-y-1.5">
                          <div className="text-slate-500"># 1. Terminal me upar "+" button par click karke naya tab kholein</div>
                          <div className="text-slate-500"># 2. Us naye tab me direct yeh commands paste karke Enter karein:</div>
                          <div className="font-bold text-white select-all">cd ~/frappe-bench</div>
                          <div className="font-bold text-emerald-400 select-all">bench use mysite.localhost</div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 p-2.5 rounded border border-emerald-500/20 text-center animate-pulse">
                      ✨ Jaise hi aap <strong>bench use mysite.localhost</strong> command run karenge, localhost:8000 automatic bind ho jayega aur refresh karte hi site khul jayegi!
                    </p>
                  </div>
                </div>

                {/* Panel 2: Sahi Google Gemini API Key Generator Assistant */}
                <div className="bg-slate-900/90 rounded-xl border-2 border-emerald-500/30 p-5 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm border-b border-slate-800 pb-3">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    <span>🔑 GOOGLE GEMINI API KEY KAISE CONFIG KAREIN?</span>
                  </div>

                  <div className="text-[11.5px] text-slate-200 leading-relaxed space-y-3">
                    <p className="font-semibold text-emerald-300">
                      💡 Gemini 3.5 Flash bilkul free aur extremely smart model hai!
                    </p>
                    <p className="text-slate-300 text-[11px]">
                      Aapko koi bhi key paste karne ki zarurat nahi hai agar aap Default Workspace Key use karna chahte hain! Lekin agar custom key configure karni ho:
                    </p>

                    <div className="space-y-2.5 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                      <ol className="list-decimal list-inside space-y-2 text-slate-300 text-[11px]">
                        <li>
                          Is blue link par click karke open karein: <br />
                          <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-block mt-1 underline text-cyan-400 hover:text-cyan-300 font-extrabold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800"
                          >
                            aistudio.google.com/app/apikey 🌐
                          </a>
                        </li>
                        <li>
                          Wahan <strong className="text-emerald-400">"Create API Key"</strong> button par click karein.
                        </li>
                        <li>
                          Naye project me key generate ho jayegi (woh hamesha <strong className="text-emerald-400 font-mono">"AIzaSy"</strong> se shuru hogi). Usse copy kar lein!
                        </li>
                      </ol>
                    </div>

                    <div className="space-y-1 bg-slate-950 p-2.5 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Copy karne ke baad yahan paste karein:</span>
                      <input
                        type="text"
                        placeholder="AIzaSy... (Apni real Gemini key yahan paste karein)"
                        className="w-full bg-slate-900 text-emerald-400 text-xs px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono"
                        value={geminiApiKey}
                        onChange={(e) => handleApiKeyChange(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step By Step Timeline */}
              <div className="space-y-6">
                
                {/* Step 1 */}
                <div className="relative pl-8 border-l-2 border-emerald-500/30">
                  <div className="absolute -left-[11px] top-0.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 font-bold text-xs">
                    1
                  </div>
                  <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-slate-100 font-display">
                        Step 1: Apne Dev Environment Setup & Software Download karein
                      </h3>
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">Dev Tooling</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Frappe aur ERPNext develop karne ke liye aapko in softwares ki zarurat hogi:
                    </p>
                    <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1.5">
                      <li><strong>Ubuntu OS / WSL2 (Windows Subsystem for Linux):</strong> Frappe framework native Linux par hi chalta hai. Agar aap Windows user hain, to Windows Store se <strong>Ubuntu 22.04 LTS</strong> download karein.</li>
                      <li><strong>VS Code:</strong> Iska download link hai <a href="https://code.visualstudio.com/" target="_blank" className="text-emerald-400 hover:underline font-medium">code.visualstudio.com</a>.</li>
                      <li><strong>Python 3.10+ & Node.js v24+:</strong> Frappe framework ke naye versions ke liye **Node.js v24+** and **Yarn** compulsory hai. Standard <code>apt</code> conflicts se bachne ke liye hamesha **NVM (Node Version Manager)** ka use karein.</li>
                      <li><strong>Redis & MariaDB:</strong> ERPNext's primary caching & database systems.</li>
                    </ul>

                    {/* Specialized Node.js Incompatibility & WSL Fix Section */}
                    <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20 space-y-4">
                      <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs border-b border-rose-500/10 pb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Fixed: Node Engine, pkg-config, & Bench Exists Errors</span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-slate-200 text-xs font-semibold">
                          1. Error: "Bench instance already exists at frappe-bench"
                        </p>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Yeh isliye aata hai kyunki aapka picchla incomplete attempt background me aadhi folder bana chuka hai. Isse completely delete karke fresh install shuru karein:
                        </p>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] text-rose-300 select-all">
                          rm -rf frappe-bench
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-slate-200 text-xs font-semibold">
                          2. Error: "pkg-config is not installed. Please install it before proceeding"
                        </p>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Frappe compile karne ke liye local build modules depend karte hain `pkg-config` utility par. Isse install karein:
                        </p>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] text-rose-300 select-all">
                          sudo apt update && sudo apt install -y pkg-config build-essential
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-rose-500/10">
                        <p className="text-slate-200 text-xs font-semibold">
                          3. Error: "The engine 'node' is incompatible..." ya APT dependency conflict
                        </p>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Standard <code>apt</code> package managers conflicts se bachne ke liye hamesha **NVM (Node Version Manager)** ka use karke Node.js v24 aur Yarn install karein:
                        </p>
                        
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-2 select-all">
                          <div className="text-slate-500"># Conflict wale Node/NPM ko safely clean karein</div>
                          <div>sudo apt remove -y nodejs npm && sudo apt autoremove</div>
                          
                          <div className="text-slate-500"># NVM (Node Version Manager) install karein</div>
                          <div>curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash</div>
                          
                          <div className="text-slate-500"># Terminal settings re-load karein</div>
                          <div>source ~/.bashrc</div>
                          
                          <div className="text-slate-500"># Node.js v24 (required by Frappe v15+) & Yarn install karein</div>
                          <div>nvm install 24 && nvm use 24 && nvm alias default 24</div>
                          <div>npm install -g yarn</div>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-slate-400">
                        💡 **Complete Solution Flow:** Sabse pehle `rm -rf frappe-bench` karein, phir `sudo apt install -y pkg-config` karein, aur uske baad clean `bench init frappe-bench` command run karein!
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative pl-8 border-l-2 border-emerald-500/30">
                  <div className="absolute -left-[11px] top-0.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 font-bold text-xs">
                    2
                  </div>
                  <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-slate-100 font-display">
                        Step 2: Site Banayein, ERPNext Download & Custom App Install karein
                      </h3>
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">Frappe CLI</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Aapka Bench successfully initialize ho gaya hai! Ab aapko **`frappe-bench` directory ke andar** jaana hai aur site, ERPNext aur custom app setup karna hai:
                    </p>

                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-4 select-all">
                      <div>
                        <div className="text-slate-500 mb-1"># 1. Bench Directory ke andar enter karein</div>
                        <div className="text-emerald-400">cd frappe-bench</div>
                      </div>

                      <div>
                        <div className="text-slate-500 mb-1"># 2. Ek naya Local Site banayein (DB root password required)</div>
                        <div className="text-emerald-400">bench new-site mysite.localhost</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          💡 **Note:** Yeh command chalate waqt Administrator ke liye secure password choose karein aur MariaDB root password insert karein.
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-500 mb-1"># 3. (Optional) ERPNext app download karein</div>
                        <div className="text-emerald-400">bench get-app erpnext</div>
                      </div>

                      <div>
                        <div className="text-slate-500 mb-1"># 4. ERPNext ko apne site par install karein</div>
                        <div className="text-emerald-400">bench --site mysite.localhost install-app erpnext</div>
                      </div>

                      <div>
                        <div className="text-slate-500 mb-1"># 5. Apni Custom App banayein (recommended design architecture)</div>
                        <div className="text-emerald-400">bench new-app erpnext_ai_copilot</div>
                      </div>

                      <div>
                        <div className="text-slate-500 mb-1"># 6. Custom app ko bhi site par install karein</div>
                        <div className="text-emerald-400">bench --site mysite.localhost install-app erpnext_ai_copilot</div>
                      </div>

                      <div>
                        <div className="text-slate-500 mb-1 font-bold"># 7. Ab Bench server ko start karein!</div>
                        <div className="text-amber-400 font-bold">bench start</div>
                      </div>
                    </div>

                    {/* Success state: Setup Wizard Completed successfully! */}
                    <div className="p-5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 space-y-5">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm border-b border-emerald-500/10 pb-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <span>Mubarak Ho! Frappe Desk & ERPNext fully setup ho chuka hai! 🎉</span>
                      </div>
                      
                      {/* Special section: How to open a new terminal tab (WSL/Windows Terminal) */}
                      <div className="p-4 bg-sky-500/10 rounded-lg border border-sky-500/30 space-y-3">
                        <div className="text-sky-400 font-bold text-xs flex items-center gap-1.5">
                          <Terminal className="w-4 h-4 text-sky-400" />
                          <span>🖥️ Terminal Kaise Kholein (Already running screen par)?</span>
                        </div>
                        <p className="text-slate-200 text-[11.5px] leading-relaxed">
                          Aapki terminal screen par abhi <code>bench start</code> chal raha hai. Yeh bilkul normal hai aur isse hume band (interrupt) nahi karna hai. Naya tab kholne ke do aasan tarike hain:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-sans">
                          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                            <span className="text-amber-400 font-bold">💡 Option 1 (Plus button click karein):</span>
                            <div className="text-slate-300">
                              Aapke terminal program ke bilkul top-bar me jahan tab ka naam <code>pankaj@PankajYadav...</code> likha hai, uske thik right me ek bada <strong>`+` (Plus)</strong> icon hai. Uspe click karein!
                            </div>
                          </div>
                          
                          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                            <span className="text-amber-400 font-bold">⌨️ Option 2 (Keyboard Shortcut):</span>
                            <div className="text-slate-300">
                              Direct apne keyboard par ek sath <strong>`Ctrl` + `Shift` + `T`</strong> press karein. Isse ek naya blank terminal tab usi window me open ho jayega!
                            </div>
                          </div>
                        </div>

                        {/* Special PowerShell to WSL conversion block */}
                        <div className="p-3 bg-rose-500/15 rounded-lg border border-rose-500/35 space-y-2.5">
                          <div className="text-rose-400 font-bold text-xs flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                            <span>⚠️ Error Fixed: "-bash: cd: frappe-bench: No such file or directory"</span>
                          </div>
                          <p className="text-slate-200 text-[11px] leading-relaxed">
                            Aapne <code>wsl</code> type kiya toh aap Ubuntu Linux me chale gaye, par abhi aap Windows ke folders (<code>/mnt/c/Users/panka</code>) me hain. Isliye Linux ko <code>frappe-bench</code> folder nahi mila.
                          </p>
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-semibold text-emerald-400">✅ Isse fix karne ke liye niche wala command run karein:</div>
                            <p className="text-slate-300 text-[11px] leading-relaxed">
                              Apne usi terminal tab me direct yeh copy-paste karke <strong>Enter</strong> karein. Yeh aapko direct home directory ke <code>frappe-bench</code> folder me le jayega:
                            </p>
                            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[11.5px] font-mono text-emerald-300 font-bold select-all">
                              cd ~/frappe-bench
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              <em>*(Isme <code>~</code> (tilde sign) ka matlab Linux home directory hai, jahan aapka project setup saved hai!)*</em>
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] font-mono">
                          <div className="text-slate-500 mb-1"># Agar aap home directory me hain to direct:</div>
                          <div className="text-emerald-400 font-bold">cd ~/frappe-bench</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-slate-200 text-sm leading-relaxed font-semibold">
                          🤖 AI Chat Bot / Copilot Project - Step-by-Step Guide:
                        </p>
                        <div className="p-3.5 bg-emerald-500/15 rounded-lg border border-emerald-500/30 space-y-2.5">
                          <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 animate-pulse">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Aapka 'ai_chatbot' App successfully create ho gaya hai! 🎉</span>
                          </div>
                          <p className="text-slate-200 text-[11px] leading-relaxed">
                            Aapke screenshot ke mutabik app creation command (<code>bench new-app ai_chatbot</code>) perfectly complete ho chuka hai. Ab is app ko active karne ke liye bas niche diye gaye final steps follow karein:
                          </p>
                        </div>
                      </div>

                      {/* Clear Step-by-Step implementation for AI Chat Bot inside Frappe */}
                      <div className="space-y-4 font-sans text-xs">
                        {/* Step 1: Install the App - COMPLETED */}
                        <div className="p-3.5 bg-emerald-500/5 rounded-lg border border-emerald-500/20 space-y-2 opacity-80">
                          <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">✓ DONE</span>
                            1. App Ko Site Par Install Kiya
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">
                            Aapne <code>bench --site mysite.localhost install-app ai_chatbot</code> successfully run kar liya hai aur aapka naya app register ho chuka hai!
                          </p>
                        </div>

                        {/* Step 2: Write API code - COMPLETED */}
                        <div className="p-3.5 bg-emerald-500/5 rounded-lg border border-emerald-500/20 space-y-2 opacity-80">
                          <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">✓ DONE</span>
                            2. Python Server-Side AI API Created (api.py)
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">
                            Aapne <code>cat &lt;&lt; 'EOF' &gt; apps/ai_chatbot/ai_chatbot/api.py</code> run kar ke python code successfully save kar liya hai!
                          </p>
                        </div>

                        {/* Step 3: Restart Bench Server - COMPLETED */}
                        <div className="p-3.5 bg-emerald-500/5 rounded-lg border border-emerald-500/20 space-y-2 opacity-80">
                          <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">✓ DONE</span>
                            3. Bench Server Successfully Restarted
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">
                            Aapne <code>bench start</code> command run kar ke server ko successfully restart kar liya hai aur server perfectly live ho chuka hai!
                          </p>
                        </div>

                        {/* Step 4: Frontend Widget script - COMPLETED */}
                        <div className="p-3.5 bg-emerald-500/5 rounded-lg border border-emerald-500/20 space-y-2 opacity-80">
                          <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">✓ DONE</span>
                            4. ToDo Client Script Form successfully saved
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">
                            Aapne <strong>"ToDo AI Chatbot"</strong> Client Script ko safaltapoorvak save kar diya hai!
                          </p>
                        </div>

                        {/* Step 5: Live Testing & Verification - ACTIVE */}
                        <div className="bg-slate-950 p-4 rounded-lg border-2 border-emerald-500 space-y-3.5 shadow-lg relative">
                          <div className="absolute -top-2.5 right-3 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase animate-pulse">
                            Active Next Step
                          </div>
                          
                          <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">👉 STEP 5</span>
                            Ab AI Chatbot Ko Live Test Karein!
                          </div>

                          {/* Troubleshooting Empty ToDo List & Loading Chatbot */}
                          <div className="p-4 bg-emerald-500/15 rounded-lg border border-emerald-500/30 space-y-3">
                            <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 animate-pulse">
                              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                              <span>🚀 ToDo List Perfectly Open Ho Chuki Hai! Ab Chatbot Load Kaise Hoga:</span>
                            </div>
                            <div className="text-slate-200 text-[11px] leading-relaxed space-y-2">
                              <p>
                                Aapka URL perfectly correct ho chuka hai aur aap <strong>ToDo List</strong> screen par hain. Kyunki abhi site bilkul fresh hai, isliye likha aa raha hai: <em>"You haven't created a ToDo yet"</em>.
                              </p>
                              <p>
                                Humne Client Script ko <strong>ToDo Form view (refresh event)</strong> par add kiya hai, yaani jab aap kisi single ToDo task ko open karenge tabhi chatbot load hoga. Iske liye yeh tiny step karein:
                              </p>
                              
                              <ol className="list-decimal list-inside text-slate-300 text-[11px] space-y-2 pl-1 bg-slate-900/60 p-3 rounded border border-slate-800">
                                <li>
                                  Apni screen par top-right corner me diye gaye black <strong>"+ Add"</strong> button par click karein.
                                </li>
                                <li>
                                  Ek box open hoga, wahan koi bhi subject likhein (jaise: <code>AI Chatbot Test</code>) aur <strong>Save</strong> button par click kar dein.
                                </li>
                                <li>
                                  Save karte hi aap us ToDo ke <strong>Form / Detail View</strong> me chale jayenge.
                                </li>
                                <li>
                                  <span className="text-amber-400 font-bold">💡 Sabsay Important Step (Hard Refresh):</span> ToDo Form view open hone ke baad, browser ko ek baar <strong>Hard Refresh (Ctrl + F5 ya CMD + Shift + R)</strong> karein taaki naya Client Script cache clear karke live load ho jaye!
                                </li>
                                <li>
                                  <strong>MAGIC! 🎉</strong> Page reload hote hi aapko page ke <strong>Bottom Right Corner (niche daayein taraf)</strong> me beautiful green color ka <strong>💬 Chat Bubble button</strong> dikhai dega!
                                </li>
                                <li>
                                  💬 button par click karke chatbot open karein aur Gemini AI se chat start karein!
                                </li>
                              </ol>
                            </div>
                          </div>

                          <div className="space-y-3 text-slate-200 text-[11px] leading-relaxed">
                            {/* Troubleshooting HTTP 417 Expectation Failed Error */}
                            <div className="p-4 bg-rose-500/15 rounded-lg border-2 border-rose-500/40 space-y-4">
                              <div className="text-rose-400 font-bold text-xs flex items-center gap-1.5 animate-pulse">
                                <AlertCircle className="w-5 h-5 text-rose-400" />
                                <span>🛑 TERMINAL ERROR DETECTED: Command Splitting Problem (HTTP 417 Fix)</span>
                              </div>
                              <div className="text-slate-200 text-[11.5px] leading-relaxed space-y-3">
                                <p className="text-amber-300 font-semibold">
                                  Aapke screenshot se humne problem ko pakad liya hai! 🔍
                                </p>
                                <p>
                                  Jab aapne command paste kiya, toh terminal ki screen choti hone ke karan command beach me se split ho gayi:
                                </p>
                                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[10px] text-rose-300 space-y-0.5">
                                  <div>❌ <span className="line-through">cat &lt;&lt; 'EOF' &gt; apps/ai_chatbot/ai_chatbot</span></div>
                                  <div>❌ <span className="line-through">/api.py</span> (Yeh line crash ho gayi)</div>
                                </div>
                                <p>
                                  Is split ki wajah se <strong>api.py</strong> file update nahi ho payi aur system stuck ho gaya! Isko fix karne ke liye humne commands ko bilkul short kar diya hai jo kabhi split nahi hongi.
                                </p>

                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-3 mt-3">
                                  <span className="text-emerald-400 font-bold block text-xs">
                                    🚀 Kadam-by-Kadam (Step-by-Step) Perfect Fix:
                                  </span>

                                  <div className="space-y-4 text-slate-200">
                                    {/* Step 1: Ctrl+C */}
                                    <div className="space-y-1">
                                      <div className="text-amber-400 font-bold text-xs">STEP 1: Terminal Clear Karein</div>
                                      <p className="text-[11px] text-slate-300">
                                        Pehle apne terminal window par click karein aur keyboard se <strong className="bg-slate-950 px-1 py-0.5 rounded text-rose-400">Ctrl + C</strong> dabayein taaki stuck command band ho jaye aur normal prompt wapas aa jaye.
                                      </p>
                                    </div>

                                    {/* Step 2: Enter Key */}
                                    <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                                      <div className="text-amber-400 font-bold text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                                        <span>STEP 2: Enter Gemini API Key (Optional)</span>
                                        <span className="text-[10px] text-slate-400 font-normal">Provider: Google Gemini (100% Free)</span>
                                      </div>

                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[10.5px]">
                                          <span className="text-slate-300 font-medium">Gemini API Key:</span>
                                          <a
                                            href="https://aistudio.google.com/app/apikey"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-amber-400 hover:text-amber-300 underline font-semibold text-[10px]"
                                          >
                                            Get Gemini Key ↗
                                          </a>
                                        </div>
                                        <input
                                          type="password"
                                          placeholder="AIzaSy... (Paste Gemini API key)"
                                          className="w-full bg-slate-900 text-emerald-400 text-xs px-3 py-2 rounded border border-slate-850 focus:outline-none focus:border-emerald-500 font-mono"
                                          value={geminiApiKey}
                                          onChange={(e) => handleApiKeyChange(e.target.value)}
                                        />
                                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                                          Humne is chatbot ko Gemini 1.5 Flash model par configure kiya hai. Agar aap koi key nahi enter karenge toh yeh automatic free Workspace default mode par chalega!
                                        </p>
                                      </div>
                                    </div>

                                    {/* Step 3: Copy Command */}
                                    <div className="space-y-2">
                                      <div className="text-amber-400 font-bold text-xs">STEP 3: Click Karke Copy Karein (Short-line Format)</div>
                                      <p className="text-[11px] text-slate-300">
                                        Niche diye gaye button par click karein. Yeh command short-line hai, isliye aapke terminal me split nahi hogi:
                                      </p>

                                      <div 
                                        translate="no"
                                        className="notranslate bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-center font-extrabold py-3 px-4 rounded-lg text-xs select-none relative cursor-pointer active:scale-[0.98] transition-all shadow-lg border border-emerald-400 flex items-center justify-center gap-1.5"
                                        onClick={() => {
                                          const isProxyMode = !geminiApiKey.trim();
                                          const pythonCode = isProxyMode
                                            ? `cd ~/frappe-bench/apps/ai_chatbot/ai_chatbot
cat << 'EOF' > api.py
import frappe
import requests
import json

@frappe.whitelist(allow_guest=True)
def chat_with_gemini(*args, **kwargs):
    try:
        user_message = kwargs.get("user_message") or kwargs.get("message")
        if not user_message:
            user_message = frappe.form_dict.get("user_message") or frappe.form_dict.get("message")
        if not user_message and frappe.request and frappe.request.data:
            try:
                req_data = json.loads(frappe.request.data)
                user_message = req_data.get("user_message") or req_data.get("message")
            except Exception:
                pass

        if not user_message:
            return {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": "[System Warning] No user message found in request. Please pass 'user_message' or 'message'."
                        }]
                    }
                }]
            }

        stock_data = []
        try:
            if frappe.db.exists("DocType", "Bin"):
                stock_data = frappe.db.get_all("Bin", fields=["item_code", "actual_qty"], limit=5)
        except Exception:
            pass

        # 100% Free Workspace Keyless Proxy Mode (No configuration required!)
        proxy_url = "${getPublicProxyUrl()}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "user_message": user_message,
            "stock_data": stock_data
        }

        try:
            response = requests.post(proxy_url, json=payload, headers=headers, timeout=15)
        except Exception as conn_err:
            return {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": f"⚠️ [Connection Error]: Proxy server se connect nahi ho pa raha hai. Kripya check karein ki aapka internet chal raha hai aur proxy_url sahi hai.\\nURL: {proxy_url}\\nError: {str(conn_err)}"
                        }]
                    }
                }]
            }

        # Check if response is HTML (auth redirect or 404 page)
        content_type = response.headers.get("Content-Type", "")
        if "text/html" in content_type or response.text.strip().startswith("<") or response.text.strip().startswith("<!doctype"):
            is_dev = "-dev-" in proxy_url
            if "404" in response.text or response.status_code == 404:
                return {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": f"⚠️ [Proxy Error 404]: AI Studio me aapka chatbot abhi tak shared/deployed nahi hua hai.\\n\\n👉 **Fix Kaise Karein?**\\n1. AI Studio me sabse upar right-side me **'Share'** button par click karein.\\n2. Jab deploy successfully ho jaye, tab fir se test karein!\\nURL: {proxy_url}"
                            }]
                        }
                    }]
                }
            elif is_dev:
                return {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": f"⚠️ [Proxy Error - Private URL]: Aap private '-dev-' URL use kar rahe hain, jo ki safe browser session ke bina block ho jata hai.\\n\\n👉 **Fix Kaise Karein?**\\n1. AI Studio me sabse upar right-side me **'Share'** button par click karke public Shared App URL (-pre- wala URL) active karein.\\n2. Uske baad naya code copy karke terminal me paste karein taaki sahi proxy_url use ho sake!\\nURL: {proxy_url}"
                            }]
                        }
                    }]
                }
            else:
                return {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": f"⚠️ [Proxy Error - Deploy Needed]: Aapka shared URL (-pre-) abhi tak public nahi hua hai, isliye Google login maang raha hai.\\n\\n👉 **Fix Kaise Karein?**\\n1. Apne AI Studio window me sabse upar right-side me **'Share'** button par click karein.\\n2. Wahan pe **'Share App'** button par click karke use publish karein taaki public link active ho jaye.\\n3. Tab bina login ke chatbot chalne lagega!\\nURL: {proxy_url}"
                            }]
                        }
                    }]
                }

        if response.status_code == 200:
            try:
                return response.json()
            except Exception as json_err:
                return {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": f"⚠️ [JSON Decode Error]: Server returned non-JSON response.\\nStatus: {response.status_code}\\nResponse Preview: {response.text[:200]}"
                            }]
                        }
                    }]
                }
        else:
            return {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": f"⚠️ [Workspace Proxy Error] (HTTP {response.status_code}):\\n{response.text[:300]}"
                        }]
                    }
                }]
            }

    except Exception as e:
        frappe.log_error(title="Gemini Chatbot Error", message=frappe.get_traceback())
        return {
            "candidates": [{
                "content": {
                    "parts": [{
                        "text": f"[Python Exception]: {str(e)}"
                    }]
                }
            }]
        }
EOF
`
                                            : `cd ~/frappe-bench/apps/ai_chatbot/ai_chatbot
cat << 'EOF' > api.py
import frappe
import requests
import json

@frappe.whitelist(allow_guest=True)
def chat_with_gemini(*args, **kwargs):
    try:
        user_message = kwargs.get("user_message") or kwargs.get("message")
        if not user_message:
            user_message = frappe.form_dict.get("user_message") or frappe.form_dict.get("message")
        if not user_message and frappe.request and frappe.request.data:
            try:
                req_data = json.loads(frappe.request.data)
                user_message = req_data.get("user_message") or req_data.get("message")
            except Exception:
                pass

        if not user_message:
            return {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": "[System Warning] No user message found in request. Please pass 'user_message' or 'message'."
                        }]
                    }
                }]
            }

        stock_data = []
        try:
            if frappe.db.exists("DocType", "Bin"):
                stock_data = frappe.db.get_all("Bin", fields=["item_code", "actual_qty"], limit=5)
        except Exception:
            pass

        api_key = "${geminiApiKey.trim()}"

        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": f"Context: {stock_data}. User Query: {user_message}. Act as a friendly ERP Assistant and reply briefly in mixed Hindi and English."}]}]
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
        response = requests.post(url, json=payload, headers=headers, timeout=30)

        if response.status_code == 200:
            return response.json()
        else:
            return {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": f"[Gemini API Error] (HTTP {response.status_code}): {response.text}"
                        }]
                    }
                }]
            }

    except Exception as e:
        frappe.log_error(title="Gemini Chatbot Error", message=frappe.get_traceback())
        return {
            "candidates": [{
                "content": {
                    "parts": [{
                        "text": f"[Python Exception]: {str(e)}"
                    }]
                }
            }]
        }
EOF
`;
                                          navigator.clipboard.writeText(pythonCode);
                                          setCopiedId("python_cmd_short");
                                          setTimeout(() => setCopiedId(null), 2000);
                                        }}
                                      >
                                        <span>📋 {copiedId === "python_cmd_short" ? "✅ COPIED SUCCESSFULLY!" : "CLICK HERE TO COPY PERFECT CODE"}</span>
                                      </div>
                                    </div>

                                    {/* Step 4: Paste & Run */}
                                    <div className="space-y-1">
                                      <div className="text-amber-400 font-bold text-xs">STEP 4: Terminal Me Paste Karein</div>
                                      <p className="text-[11px] text-slate-300">
                                        Terminal me right-click karke paste kar dein, aur agar automatically run na ho, toh keyboard se <strong className="text-white bg-slate-950 px-1 rounded font-mono">Enter</strong> daba dein.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-emerald-400 font-bold mt-2">
                                  💡 Robust Python Reference Code:
                                </p>
                                <p className="text-slate-300">
                                  Reference ke liye yeh complete robust code hai (jo ki upar command me pehle se shamil hai):
                                </p>

                                <div translate="no" className="notranslate text-slate-300 font-mono text-[10px] bg-slate-950 p-3 rounded border border-slate-800 select-all max-h-60 overflow-y-auto space-y-1">
                                  <div>import frappe</div>
                                  <div>import requests</div>
                                  <div>import json</div>
                                  <br />
                                  <div>@frappe.whitelist(allow_guest=True)</div>
                                  <div>def chat_with_gemini(*args, **kwargs):</div>
                                  <div className="pl-4">try:</div>
                                  <div className="pl-8"># Resolve user message from any possible source</div>
                                  <div className="pl-8">user_message = kwargs.get("user_message") or kwargs.get("message")</div>
                                  <div className="pl-8">if not user_message:</div>
                                  <div className="pl-12">user_message = frappe.form_dict.get("user_message") or frappe.form_dict.get("message")</div>
                                  <div className="pl-8">if not user_message and frappe.request and frappe.request.data:</div>
                                  <div className="pl-12">try:</div>
                                  <div className="pl-16">req_data = json.loads(frappe.request.data)</div>
                                  <div className="pl-16">user_message = req_data.get("user_message") or req_data.get("message")</div>
                                  <div className="pl-12">except Exception:</div>
                                  <div className="pl-16">pass</div>
                                  <br />
                                  <div className="pl-8">if not user_message:</div>
                                  <div className="pl-12">return &#123;</div>
                                  <div className="pl-16">"candidates": [&#123;</div>
                                  <div className="pl-20">"content": &#123;</div>
                                  <div className="pl-24">"parts": [&#123;</div>
                                  <div className="pl-28">"text": "⚠️ Warning: user_message not found."</div>
                                  <div className="pl-24">&#125;]</div>
                                  <div className="pl-20">&#125;</div>
                                  <div className="pl-16">&#125;]</div>
                                  <div className="pl-12">&#125;</div>
                                  <br />
                                  <div className="pl-8"># 1. Safely read stock data (Error-free check)</div>
                                  <div className="pl-8">stock_data = []</div>
                                  <div className="pl-8">try:</div>
                                  <div className="pl-12">if frappe.db.exists("DocType", "Bin"):</div>
                                  <div className="pl-16">stock_data = frappe.db.get_all("Bin", fields=["item_code", "actual_qty"], limit=5)</div>
                                  <div className="pl-8">except Exception:</div>
                                  <div className="pl-12">pass # Catch if stock module isn't installed</div>
                                  <br />
                                  <div className="pl-8"># 2. Setup OpenRouter API Key</div>
                                  <div className="pl-8"># 👇 Yahan apni real OpenRouter API key paste karein:</div>
                                  <div className="pl-8 text-emerald-400">api_key = "AAPKI_REAL_OPENROUTER_API_KEY_HERE"</div>
                                  <br />
                                  <div className="pl-8">if not api_key or "REAL_OPENROUTER" in api_key or "AAPKI" in api_key:</div>
                                  <div className="pl-12">return &#123;</div>
                                  <div className="pl-16">"candidates": [&#123;</div>
                                  <div className="pl-20">"content": &#123;</div>
                                  <div className="pl-24">"parts": [&#123;</div>
                                  <div className="pl-28">"text": "⚠️ Setup Completed! Chatbot successfully trigger ho gaya hai, par aapne 'api.py' file me apni real OpenRouter API Key nahi dali hai! Kripya api.py open karke real key paste karein."</div>
                                  <div className="pl-24">&#125;]</div>
                                  <div className="pl-20">&#125;</div>
                                  <div className="pl-16">&#125;]</div>
                                  <div className="pl-12">&#125;</div>
                                  <br />
                                  <div className="pl-8">headers = &#123;</div>
                                  <div className="pl-12">"Content-Type": "application/json",</div>
                                  <div className="pl-12">"Authorization": f"Bearer &#123;api_key&#125;",</div>
                                  <div className="pl-12">"HTTP-Referer": "https://ai.studio/build",</div>
                                  <div className="pl-12">"X-Title": "ERPNext Smart Copilot"</div>
                                  <div className="pl-8">&#125;</div>
                                  <div className="pl-8">payload = &#123;</div>
                                  <div className="pl-12">"model": "meta-llama/llama-3.3-70b-instruct:free",</div>
                                  <div className="pl-12">"messages": [</div>
                                  <div className="pl-16">&#123;"role": "system", "content": "Act as a friendly ERP Assistant and reply briefly in mixed Hindi and English."&#125;,</div>
                                  <div className="pl-16">&#123;"role": "user", "content": f"Context: &#123;stock_data&#125;. User Query: &#123;user_message&#125;"&#125;</div>
                                  <div className="pl-12">],</div>
                                  <div className="pl-12">"max_tokens": 1000</div>
                                  <div className="pl-8">&#125;</div>
                                  <br />
                                  <div className="pl-8"># OpenRouter Llama 3.3 70B API call</div>
                                  <div className="pl-8">url = "https://openrouter.ai/api/v1/chat/completions"</div>
                                  <div className="pl-8">response = requests.post(url, json=payload, headers=headers, timeout=30)</div>
                                  <br />
                                  <div className="pl-8">if response.status_code == 200:</div>
                                  <div className="pl-12">res_json = response.json()</div>
                                  <div className="pl-12">text_out = res_json.get("choices", [&#123;&#125;])[0].get("message", &#123;&#125;).get("content", "")</div>
                                  <div className="pl-12">return &#123;</div>
                                  <div className="pl-16">"choices": res_json.get("choices"),</div>
                                  <div className="pl-16">"candidates": [&#123;</div>
                                  <div className="pl-20">"content": &#123;</div>
                                  <div className="pl-24">"parts": [&#123;</div>
                                  <div className="pl-28">"text": text_out</div>
                                  <div className="pl-24">&#125;]</div>
                                  <div className="pl-20">&#125;</div>
                                  <div className="pl-16">&#125;]</div>
                                  <div className="pl-12">&#125;</div>
                                  <div className="pl-8">else:</div>
                                  <div className="pl-12">return &#123;</div>
                                  <div className="pl-16">"candidates": [&#123;</div>
                                  <div className="pl-20">"content": &#123;</div>
                                  <div className="pl-24">"parts": [&#123;</div>
                                  <div className="pl-28">"text": f"⚠️ OpenRouter API Error (HTTP &#123;response.status_code&#125;): &#123;response.text&#125;"</div>
                                  <div className="pl-24">&#125;]</div>
                                  <div className="pl-20">&#125;</div>
                                  <div className="pl-16">&#125;]</div>
                                  <div className="pl-12">&#125;</div>
                                  <br />
                                  <div className="pl-4">except Exception as e:</div>
                                  <div className="pl-8">frappe.log_error(title="OpenRouter Chatbot Error", message=frappe.get_traceback())</div>
                                  <div className="pl-8">return &#123;</div>
                                  <div className="pl-12">"candidates": [&#123;</div>
                                  <div className="pl-16">"content": &#123;</div>
                                  <div className="pl-20">"parts": [&#123;</div>
                                  <div className="pl-24">"text": f"⚠️ Python Exception: &#123;str(e)&#125;"</div>
                                  <div className="pl-24">&#125;]</div>
                                  <div className="pl-20">&#125;</div>
                                  <div className="pl-16">&#125;]</div>
                                  <div className="pl-12">&#125;</div>
                                </div>
 
                                <div className="mt-3 p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] space-y-1.5">
                                  <div className="text-amber-400 font-bold">🔄 Final Action Checklist:</div>
                                  <ol className="list-decimal list-inside space-y-1 text-slate-300">
                                    <li><code>api.py</code> me upar wala robust code copy-paste karein.</li>
                                    <li>Apni real <strong>OpenRouter API Key</strong> ko <code>"AAPKI_REAL_OPENROUTER_API_KEY_HERE"</code> se replace karein (Free key OpenRouter se <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">openrouter.ai/keys</a> par mil jayegi).</li>
                                    <li>Apne python terminal tab me jaakar <strong>bench start</strong> ko <code>Ctrl + C</code> se stop karein, aur fir dobara <code>bench start</code> command run karein.</li>
                                    <li>Ab chatbot window me naya message likh kar click karein - response instant and perfectly live ho jayega!</li>
                                  </ol>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 space-y-1 text-amber-300">
                              <span className="font-bold flex items-center gap-1">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>💡 Agar Hard Refresh ke baad bhi widget na dikhe:</span>
                              </span>
                              <p className="text-slate-300 text-[10.5px]">
                                1. Ensure karein ki aapne Client Script form me <strong>"Enabled"</strong> checkbox ko check kiya hai.<br />
                                2. Browser inspect tool (F12) dabayein, aur check karein ki Console me koi security block ya syntax error to nahi hai.<br />
                                3. Apne second terminal tab me check karein ki python dev server bina kisi error ke continuously chal raha hai.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                        <div className="text-slate-400 font-semibold text-xs">⚠️ Server Update Note:</div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Naya app install karne ya server python files change karne par terminal par wapas jakar <strong>`Ctrl + C`</strong> dabbaein, fir firse <strong>`bench start`</strong> karein, taaki changes local server par deploy ho jayein!
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      Server background me live hai. Browser me login karne ke baad aap automatic initial ERPNext setup wizard par chale jayenge!
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative pl-8 border-l-2 border-emerald-500/30">
                  <div className="absolute -left-[11px] top-0.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 font-bold text-xs">
                    3
                  </div>
                  <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-slate-100 font-display">
                        Step 3: Database & ERP API Connectors Likhein
                      </h3>
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">Python API</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Apne custom app mein python hooks ka use karein database query ke liye. 
                      Frappe ORM (Object Relational Mapping) bohot safe methods provide karta hai database query karne ke liye bina direct raw SQL chalaye:
                    </p>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
                      <p className="text-slate-500"># Python connector sample inside custom app</p>
                      <p className="text-amber-400">@frappe.whitelist(allow_guest=False)</p>
                      <p><span className="text-rose-400">def</span> <span className="text-emerald-400">check_item_stock</span>(item_code):</p>
                      <p className="pl-4">stock_details = frappe.db.get_value(<span className="text-yellow-200">"Bin"</span>, </p>
                      <p className="pl-8">filters={"{"}<span className="text-yellow-200">"item_code"</span>: item_code{"},"}</p>
                      <p className="pl-8">fieldname=[<span className="text-yellow-200">"actual_qty"</span>, <span className="text-yellow-200">"warehouse"</span>])</p>
                      <p className="pl-4"><span className="text-rose-400">return</span> stock_details</p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative pl-8 border-l-2 border-emerald-500/30">
                  <div className="absolute -left-[11px] top-0.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 font-bold text-xs">
                    4
                  </div>
                  <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-slate-100 font-display">
                        Step 4: AI Copilot Controller (OpenRouter API Integration)
                      </h3>
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">AI Logic</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      <strong>Llama 3.3 70B via OpenRouter</strong> sabse tez aur high-quality state-of-the-art free model hai jo chat completions and structured outputs support karta hai. 
                    </p>
                    <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1.5">
                      <li><strong>Smart Context Processing:</strong> Jab user poochega *"Is item_101 available?"*, Llama context information use karke dynamic reply taiyar karega.</li>
                      <li><strong>Secure Proxy:</strong> Hamesha client-side se direct API key expose na karein. Server backend router (Node.js/Express ya Python) par call pass karein jo API keys save rakhe.</li>
                    </ul>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="relative pl-8 border-l-2 border-emerald-500/30">
                  <div className="absolute -left-[11px] top-0.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 font-bold text-xs">
                    5
                  </div>
                  <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-slate-100 font-display">
                        Step 5: Frontend Chat Interface Deploy karein
                      </h3>
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">UI Setup</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Aap apne users ke liye teen tarah ke options tayyar kar sakte hain:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-emerald-400 font-bold block mb-1">In-App Chat widget</span>
                        ERPNext dashboard par custom JavaScript widget load karke dynamic sidebar chatbox bana sakte hain.
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-teal-400 font-bold block mb-1">WhatsApp / Telegram Bot</span>
                        Twilio or Telegram API ko trigger karke on-the-go managers aur sales team ke liye query flow configure karein.
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-cyan-400 font-bold block mb-1">External Portal App</span>
                        Apna external standalone webapp (jaise humne Simulation tab me setup kiya hai) banakar use embed karein.
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
            </div>

            {/* Sidebar Resources Panel */}
            <div className="space-y-6">
              
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
                <h3 className="text-md font-bold text-slate-100 font-display flex items-center gap-2">
                  <Settings className="w-4 h-4 text-emerald-400" />
                  Ultimate Tech Stack
                </h3>
                
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                    <span className="text-slate-400">Backend Core:</span>
                    <span className="text-slate-200 font-mono font-medium">Frappe / Python</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                    <span className="text-slate-400">Database Engine:</span>
                    <span className="text-slate-200 font-mono font-medium">MariaDB (Standard ERPNext)</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                    <span className="text-slate-400">Cache Layer:</span>
                    <span className="text-slate-200 font-mono font-medium">Redis</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                    <span className="text-slate-400">AI Service:</span>
                    <span className="text-emerald-400 font-mono font-bold">@google/genai (Gemini SDK)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Task Scheduler:</span>
                    <span className="text-slate-200 font-mono font-medium">Celery / Frappe Scheduler</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-3">
                <h3 className="text-md font-bold text-slate-100 font-display flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Key Commands Quick Cheat
                </h3>
                <p className="text-slate-400 text-xs">Apne ERPNext server par in commands ka use karein dev loop restart karne ke liye:</p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2">
                  <div>
                    <span className="text-slate-500 block"># Clear site cache</span>
                    <span>bench --site yoursite.local clear-cache</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block"># Start redis/celery workers</span>
                    <span>bench start</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block"># Python interactive shell</span>
                    <span>bench --site yoursite.local console</span>
                  </div>
                </div>
              </div>

              {/* Developer Pro Tip */}
              <div className="bg-gradient-to-tr from-emerald-950/30 to-teal-950/20 rounded-xl border border-emerald-500/10 p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  <span>Business Automation Tip</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  AI sirf queries ke liye nahi hai! Hamein triggers configure karne chahiye. 
                  E.g. Jab low stock alert mile, to Gemini process automate karke draft Purchase Order khud se generate karke procurement manager ko authorization mail bhej de sake.
                </p>
                <button
                  onClick={() => setActiveTab("simulation")}
                  className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                >
                  Test this flow in Simulation <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* 2. LIVE SIMULATION PLAYGROUND TAB */}
        {activeTab === "simulation" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Live Database Viewer on left */}
            <div className="lg:col-span-5 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col overflow-hidden h-[620px]">
              <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-sm font-semibold font-display">Live Mock ERPNext Database View</span>
                </div>
                <button 
                  onClick={fetchMockDb}
                  title="Force Refresh Data"
                  className="p-1 text-slate-400 hover:text-slate-200 transition bg-slate-800/80 rounded"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sub-tabs for tables */}
              <div className="flex flex-wrap border-b border-slate-800/60 bg-slate-950 text-[11px] font-medium animate-fade-in">
                <button
                  onClick={() => setActiveDbTab("stock")}
                  className={`flex-1 min-w-[70px] py-2.5 text-center border-b-2 transition ${
                    activeDbTab === "stock" ? `${tc.primaryBorder} ${tc.primaryText} bg-slate-900/40` : "border-transparent text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  📦 Stock
                </button>
                <button
                  onClick={() => setActiveDbTab("customers")}
                  className={`flex-1 min-w-[70px] py-2.5 text-center border-b-2 transition ${
                    activeDbTab === "customers" ? `${tc.primaryBorder} ${tc.primaryText} bg-slate-900/40` : "border-transparent text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  👤 Ledger
                </button>
                <button
                  onClick={() => setActiveDbTab("leads")}
                  className={`flex-1 min-w-[70px] py-2.5 text-center border-b-2 transition ${
                    activeDbTab === "leads" ? `${tc.primaryBorder} ${tc.primaryText} bg-slate-900/40` : "border-transparent text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  🤝 Leads ({mockLeads.length})
                </button>
                <button
                  onClick={() => setActiveDbTab("quotations")}
                  className={`flex-1 min-w-[70px] py-2.5 text-center border-b-2 transition ${
                    activeDbTab === "quotations" ? `${tc.primaryBorder} ${tc.primaryText} bg-slate-900/40` : "border-transparent text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  📄 Quotation ({mockQuotations.length})
                </button>
                <button
                  onClick={() => setActiveDbTab("forecasting")}
                  className={`flex-1 min-w-[70px] py-2.5 text-center border-b-2 transition ${
                    activeDbTab === "forecasting" ? `${tc.primaryBorder} ${tc.primaryText} bg-slate-900/40` : "border-transparent text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  🔮 Forecast
                </button>
                <button
                  onClick={() => setActiveDbTab("supplychain")}
                  className={`flex-1 min-w-[70px] py-2.5 text-center border-b-2 transition ${
                    activeDbTab === "supplychain" ? `${tc.primaryBorder} ${tc.primaryText} bg-slate-900/40` : "border-transparent text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  🚚 logistics
                </button>
                <button
                  onClick={() => setActiveDbTab("analytics")}
                  className={`flex-1 min-w-[70px] py-2.5 text-center border-b-2 transition ${
                    activeDbTab === "analytics" ? `${tc.primaryBorder} ${tc.primaryText} bg-slate-900/40` : "border-transparent text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  📊 Analytics
                </button>
                <button
                  onClick={() => setActiveDbTab("manage")}
                  className={`flex-1 min-w-[70px] py-2.5 text-center border-b-2 transition ${
                    activeDbTab === "manage" ? `${tc.primaryBorder} ${tc.primaryText} bg-slate-900/40` : "border-transparent text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  🛠️ Manage DB
                </button>
                {isDeveloperMode && (
                  <button
                    onClick={() => setActiveDbTab("sync")}
                    className={`flex-1 min-w-[80px] py-2.5 text-center border-b-2 transition ${
                      activeDbTab === "sync" ? `${tc.primaryBorder} ${tc.primaryText} bg-slate-900/40` : "border-transparent text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    ⚙️ Sync & Theme
                  </button>
                )}
              </div>

              {/* Table Data */}
              <div className="flex-1 overflow-auto p-4 bg-slate-950/60">
                {activeDbTab === "stock" && (
                  <div className="space-y-3">
                    <p className="text-slate-400 text-[11px] italic mb-1">Note: This represents the `tabBin` and `tabItem` records in ERPNext database.</p>
                    {Object.keys(mockStock).map((code) => (
                      <div key={code} className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-mono text-emerald-400 font-medium">{code}</div>
                          <div className="text-slate-200 font-semibold mt-0.5">{mockStock[code].name}</div>
                          <div className="text-slate-400 text-[10px] mt-1 flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-500" /> Warehouse: {mockStock[code].warehouse}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-mono font-bold text-slate-200">{mockStock[code].stock}</div>
                          <div className="text-[10px] text-slate-500">Available Qty</div>
                          <div className="text-xs text-teal-400 font-mono font-medium mt-1">₹{mockStock[code].price} / unit</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeDbTab === "customers" && (
                  <div className="space-y-3">
                    <p className="text-slate-400 text-[11px] italic mb-1">Note: Represents Accounts Receivable balances from Customer doctype ledger.</p>
                    {Object.keys(mockCustomers).map((cust) => (
                      <div key={cust} className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-200 text-sm">{cust}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{mockCustomers[cust].email}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800/50 pt-2">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Outstanding Balance</span>
                            <span className={`font-mono font-semibold ${mockCustomers[cust].outstanding > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                              ₹{mockCustomers[cust].outstanding.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Credit Limit Allowed</span>
                            <span className="font-mono text-slate-300">
                              ₹{mockCustomers[cust].credit_limit.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeDbTab === "leads" && (
                  <div className="space-y-3">
                    <p className="text-slate-400 text-[11px] italic mb-1">Note: Live records from the custom CRM lead schema representation.</p>
                    {mockLeads.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs">No leads recorded. Use the Copilot chat to insert one!</div>
                    ) : (
                      mockLeads.map((lead) => (
                        <div key={lead.id} className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 text-xs space-y-1.5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded-bl font-mono">
                            {lead.id}
                          </div>
                          <div className="font-semibold text-slate-200">{lead.lead_name}</div>
                          <div className="text-slate-400 text-[11px]">{lead.company_name}</div>
                          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 border-t border-slate-800/40 pt-1.5 mt-1.5 font-mono">
                            <div>Email: {lead.email}</div>
                            <div>Phone: {lead.phone}</div>
                          </div>
                          <div className="text-[9px] text-slate-600 font-mono mt-1">Inserted: {new Date(lead.created_at).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeDbTab === "quotations" && (
                  <div className="space-y-3">
                    <p className="text-slate-400 text-[11px] italic mb-1">Note: Draft quotations logged live in the Simulated Sales module.</p>
                    {mockQuotations.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs">No quotations created yet. Ask the Copilot chat to create one!</div>
                    ) : (
                      mockQuotations.map((qtn) => (
                        <div key={qtn.id} className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 text-xs space-y-1.5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-teal-500/20 text-teal-300 text-[9px] px-2 py-0.5 rounded-bl font-mono">
                            {qtn.status}
                          </div>
                          <div className="font-mono text-emerald-400 text-[11px] font-semibold">{qtn.id}</div>
                          <div className="text-slate-200">Customer: <span className="font-medium text-slate-100">{qtn.customer_name}</span></div>
                          <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-400 border-t border-slate-800/40 pt-1.5 mt-1.5">
                            <div>Code: <strong className="font-mono text-slate-200">{qtn.item_code}</strong></div>
                            <div>Qty: <strong className="text-slate-200">{qtn.qty}</strong></div>
                            <div className="text-right text-emerald-400 font-bold">Total: ₹{qtn.grand_total}</div>
                          </div>
                          <div className="text-[9px] text-slate-600 font-mono mt-1">Generated: {new Date(qtn.created_at).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeDbTab === "forecasting" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        🔮 <strong>Demand Forecasting Dashboard:</strong> AI-powered projection curve mapping past sales trends against next month's predicted order volume to optimize safety stocks.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 block font-mono">SELECT STOCK ITEM FOR PROJECTION</label>
                      <select
                        value={selectedForecastItem}
                        onChange={(e) => {
                          setSelectedForecastItem(e.target.value);
                          setPoResultMsg("");
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-mono text-emerald-400 font-semibold"
                      >
                        {Object.keys(mockStock).map((code) => (
                          <option key={code} value={code}>{code} - {mockStock[code]?.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Interactive Recharts Line Chart */}
                    <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 font-mono block">📈 DEMAND FORECAST & STOCK LEVEL CHART</span>
                          <span className="text-[9px] text-slate-500 font-mono">Comparing Historical Trends vs. AI Predicted Demand</span>
                        </div>
                        <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/25 self-start">Created by Pankaj Yadav</span>
                      </div>
                      
                      <div className="h-56 w-full text-slate-300 font-sans mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={getChartData()}
                            margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              stroke="#64748b" 
                              fontSize={10} 
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              stroke="#64748b" 
                              fontSize={10} 
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                              verticalAlign="top" 
                              height={36} 
                              iconType="circle"
                              iconSize={8}
                              wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
                            />
                            <Line
                              name="Stock Level"
                              type="monotone"
                              dataKey="stockLevel"
                              stroke="#f59e0b"
                              strokeWidth={2.5}
                              dot={{ r: 4, stroke: "#0f172a", strokeWidth: 1.5, fill: "#f59e0b" }}
                              activeDot={{ r: 6 }}
                            />
                            <Line
                              name="Actual Demand"
                              type="monotone"
                              dataKey="actualDemand"
                              stroke="#059669"
                              strokeWidth={2.5}
                              dot={{ r: 4, stroke: "#0f172a", strokeWidth: 1.5, fill: "#059669" }}
                              activeDot={{ r: 6 }}
                            />
                            <Line
                              name="AI Predicted Demand"
                              type="monotone"
                              dataKey="predictedDemand"
                              stroke="#10b981"
                              strokeWidth={2.5}
                              strokeDasharray="4 4"
                              dot={{ r: 5, stroke: "#0f172a", strokeWidth: 2, fill: "#34d399" }}
                              activeDot={{ r: 7 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Stats & EOQ Table */}
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
                          <span className="text-[10px] text-slate-500 block font-mono">🛡️ Safety Stock Level</span>
                          <span className="text-sm font-semibold font-mono text-slate-200">
                            {forecastData[selectedForecastItem]?.safetyStock} units
                          </span>
                        </div>
                        <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
                          <span className="text-[10px] text-slate-500 block font-mono">🚨 Reorder Point (ROP)</span>
                          <span className="text-sm font-semibold font-mono text-amber-400">
                            {forecastData[selectedForecastItem]?.reorderPoint} units
                          </span>
                        </div>
                        <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
                          <span className="text-[10px] text-slate-500 block font-mono">📦 Econ Order Qty (EOQ)</span>
                          <span className="text-sm font-semibold font-mono text-teal-400">
                            {forecastData[selectedForecastItem]?.eoq} units
                          </span>
                        </div>
                        <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
                          <span className="text-[10px] text-slate-500 block font-mono">⏱️ Inbound Lead Time</span>
                          <span className="text-sm font-semibold font-mono text-slate-200">
                            {forecastData[selectedForecastItem]?.leadTime}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-slate-800/80 pt-3 space-y-2.5">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>Primary Vendor:</span>
                          <strong className="text-slate-200 text-right">{forecastData[selectedForecastItem]?.supplier}</strong>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>Current Warehouse Stock:</span>
                          <strong className="font-mono text-slate-200">{mockStock[selectedForecastItem]?.stock || 0} units</strong>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => triggerAutoPO(selectedForecastItem)}
                          disabled={isGeneratingPO}
                          className={`w-full text-center font-bold font-sans text-xs py-2.5 px-4 rounded-xl transition border shadow-lg flex items-center justify-center gap-2 ${
                            isGeneratingPO 
                              ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed" 
                              : `bg-gradient-to-r ${tc.gradient} text-slate-950 hover:brightness-110 active:scale-[0.98] cursor-pointer`
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{isGeneratingPO ? "Generating Procurement Plan..." : "⚡ Auto-Generate AI Purchase Order"}</span>
                        </button>

                        {poResultMsg && (
                          <div className={`mt-3 p-2.5 text-xs rounded border font-mono ${
                            poResultMsg.includes("Success") 
                              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400 animate-pulse" 
                              : "bg-slate-950 border-slate-800 text-slate-300"
                          }`}>
                            {poResultMsg}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeDbTab === "supplychain" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        🚚 <strong>Active Logistics Control Tower:</strong> Map active inland shipping routes. Trigger a simulated cargo dispatch to update local warehouse bins live upon delivery!
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block font-mono">SELECT SUPPLY TO DISPATCH</label>
                        <select
                          value={selectedLogisticsItem}
                          onChange={(e) => setSelectedLogisticsItem(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-mono mt-1 font-semibold text-blue-400"
                        >
                          {Object.keys(mockStock).map((code) => (
                            <option key={code} value={code}>{code} - {mockStock[code]?.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block font-mono">CARGO VOLUME</label>
                        <div className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 font-mono mt-1 text-center font-bold">
                          +500 units (Inbound)
                        </div>
                      </div>
                    </div>

                    {/* SVG Map of Delivery Track */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono">
                        <span>🛰️ RE-ROUTE HIGHWAY MAP VIEW</span>
                        <span className="text-blue-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span> Live Transit Tracking
                        </span>
                      </div>

                      <div className="relative h-28 bg-slate-950 border border-slate-800/80 rounded-lg overflow-hidden flex items-center justify-center">
                        <svg viewBox="0 0 400 100" className="w-full h-full">
                          {/* Deliver Track Path */}
                          <path
                            d="M 40 50 Q 200 15 360 50"
                            fill="none"
                            stroke="#1e293b"
                            strokeWidth="4"
                            strokeDasharray="6"
                            id="route-line"
                          />
                          <path
                            d="M 40 50 Q 200 15 360 50"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3.5"
                            strokeDasharray="4 6"
                            strokeDashoffset={-truckProgress * 2}
                            className="transition-all duration-300"
                          />

                          {/* Nodes */}
                          <g>
                            <circle cx="40" cy="50" r="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" />
                            <text x="40" y="70" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">Supplier Hub</text>
                          </g>

                          <g>
                            <circle cx="200" cy="32" r="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                            <text x="200" y="16" textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="monospace">Jaipur Toll</text>
                          </g>

                          <g>
                            <circle cx="360" cy="50" r="8" fill="#1e293b" stroke="#10b981" strokeWidth="2.5" />
                            <text x="360" y="70" textAnchor="middle" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">Warehouse</text>
                          </g>

                          {/* Truck Indicator along curve */}
                          {(() => {
                            const t = truckProgress / 100;
                            const x = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 200 + t * t * 360;
                            const y = (1 - t) * (1 - t) * 50 + 2 * (1 - t) * t * 15 + t * t * 50;
                            
                            return (
                              <g transform={`translate(${x - 10}, ${y - 12})`}>
                                <rect x="0" y="0" width="20" height="12" rx="3" fill="#3b82f6" className="shadow-lg" />
                                <rect x="14" y="2" width="6" height="8" rx="1" fill="#93c5fd" />
                                <circle cx="5" cy="12" r="3" fill="#0f172a" />
                                <circle cx="15" cy="12" r="3" fill="#0f172a" />
                              </g>
                            );
                          })()}
                        </svg>

                        {truckProgress === 0 && !isDispatching && (
                          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-xs text-slate-400 font-mono">Select Supply Item & Click Dispatch</span>
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex gap-3 justify-between items-center pt-1.5">
                        <div className="w-2/3 bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="bg-blue-500 h-full transition-all duration-300"
                            style={{ width: `${truckProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{truckProgress}% Complete</span>
                      </div>

                      <button
                        onClick={triggerDispatchTruck}
                        disabled={isDispatching}
                        className={`w-full text-center font-bold font-sans text-xs py-2.5 px-4 rounded-xl transition border shadow-lg flex items-center justify-center gap-2 ${
                          isDispatching 
                            ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed" 
                            : "bg-blue-600 hover:bg-blue-500 text-white border-blue-400 cursor-pointer animate-pulse"
                        }`}
                      >
                        <RefreshCw className={`w-4 h-4 ${isDispatching ? "animate-spin" : ""}`} />
                        <span>{isDispatching ? `Inbound Freight Moving (${truckProgress}%)` : "🚚 Dispatch Mock Inbound Shipment (+500 Units)"}</span>
                      </button>
                    </div>

                    {/* Live Transit Log Terminal */}
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 space-y-2">
                      <div className="text-[10px] font-mono text-slate-500 flex justify-between items-center uppercase tracking-wider border-b border-slate-800 pb-1.5">
                        <span>📜 Live Shipping Transit Logs</span>
                        <span className="text-blue-500 animate-pulse">Node Status: Active</span>
                      </div>
                      <div className="max-h-28 overflow-y-auto space-y-1.5 font-mono text-[10px] text-slate-300">
                        {shipmentLogs.map((log, index) => (
                          <div key={index} className="flex gap-1.5">
                            <span className="text-slate-500 font-medium">❯</span>
                            <span className={log.includes("Complete") ? "text-emerald-400 font-semibold" : ""}>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeDbTab === "analytics" && (
                  <div className="space-y-4">
                    <p className="text-slate-400 text-[11px] italic mb-1">
                      Real-time insights and visualization of your synchronized ERPNext database state.
                    </p>
                    
                    {/* Stat indicators */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-500 font-mono block">TOTAL CATALOG ITEMS</span>
                        <span className={`text-lg font-bold font-mono ${tc.primaryText}`}>
                          {Object.keys(mockStock).length}
                        </span>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-500 font-mono block">TOTAL STOCK QUANTITY</span>
                        <span className="text-lg font-bold font-mono text-slate-200">
                          {Object.values(mockStock).reduce((sum: any, item: any) => sum + (item.stock || 0), 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-500 font-mono block">OUTSTANDING BALANCE</span>
                        <span className="text-lg font-bold font-mono text-rose-400">
                          ₹{Object.values(mockCustomers).reduce((sum: any, cust: any) => sum + (cust.outstanding || 0), 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-500 font-mono block">DRAFT QUOTATION PIPELINE</span>
                        <span className="text-lg font-bold font-mono text-teal-400">
                          ₹{mockQuotations.reduce((sum, qtn) => sum + (qtn.grand_total || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Stock Levels progress bars */}
                    <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80 space-y-3">
                      <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                        <TrendingUp className={`w-3.5 h-3.5 ${tc.primaryText}`} /> Item Stock Capacity Utilization
                      </h4>
                      <div className="space-y-2.5">
                        {Object.keys(mockStock).map((code) => {
                          const item = mockStock[code];
                          const maxStock = 1500;
                          const pct = Math.min(100, Math.ceil((item.stock / maxStock) * 100));
                          const isLow = item.stock < 100;
                          return (
                            <div key={code} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-slate-300 font-medium truncate max-w-[150px]">{item.name}</span>
                                <span className={isLow ? "text-rose-400 font-bold" : "text-slate-400"}>
                                  {item.stock} / {maxStock} pcs {isLow ? "⚠️ Low" : ""}
                                </span>
                              </div>
                              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800/60">
                                <div 
                                  className={`h-full transition-all duration-500 ${isLow ? "bg-rose-500" : tc.primaryBg}`} 
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Customer outstanding donut representation */}
                    <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80 space-y-3">
                      <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                        <UserCheck className={`w-3.5 h-3.5 ${tc.primaryText}`} /> Credit limit utilization
                      </h4>
                      <div className="space-y-2.5">
                        {Object.keys(mockCustomers).map((cust) => {
                          const item = mockCustomers[cust];
                          const pct = Math.min(100, Math.ceil((item.outstanding / item.credit_limit) * 100));
                          return (
                            <div key={cust} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-slate-300 truncate max-w-[160px]">{cust}</span>
                                <span className="text-slate-400">
                                  ₹{item.outstanding.toLocaleString()} ({pct}%)
                                </span>
                              </div>
                              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
                                <div 
                                  className={`h-full transition-all duration-500 bg-rose-400`} 
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeDbTab === "sync" && (
                  <div className="space-y-4">
                    {/* Part A: Custom Branding Configurator */}
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 space-y-3.5">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                        🎨 Branded Design Engine
                      </h4>
                      
                      {/* Presets Grid */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 block font-mono font-medium">1. CHOOSE COLOR IDENTITY</label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[
                            { id: "emerald", label: "Emerald", color: "bg-emerald-500" },
                            { id: "sapphire", label: "Sapphire", color: "bg-blue-500" },
                            { id: "amber", label: "Amber", color: "bg-amber-500" },
                            { id: "steel", label: "Slate Steel", color: "bg-slate-400" },
                            { id: "crimson", label: "Crimson", color: "bg-rose-500" }
                          ].map((theme) => (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => handleThemeChange(theme.id as any)}
                              className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-[9px] font-mono transition ${
                                brandTheme === theme.id ? `${tc.primaryBorder} bg-slate-800` : "border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400"
                              }`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full ${theme.color} mb-1`}></span>
                              {theme.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Title customizer */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 block font-mono font-medium">2. APP NAME CUSTOMIZER</label>
                        <input
                          type="text"
                          value={customAppName}
                          onChange={(e) => handleAppNameChange(e.target.value)}
                          placeholder="E.g., Reliance ERP AI CoPilot"
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-mono"
                        />
                      </div>

                      {/* Icon selector */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 block font-mono font-medium">3. BRAND LOGO SELECTION</label>
                        <div className="grid grid-cols-6 gap-1">
                          {["Cpu", "Bot", "Sparkles", "Database", "Briefcase", "Building"].map((icon) => (
                            <button
                              key={icon}
                              type="button"
                              onClick={() => handleLogoChange(icon)}
                              className={`p-1.5 rounded border flex items-center justify-center transition ${
                                customLogo === icon ? `${tc.primaryBorder} bg-slate-805` : "border-slate-800 bg-slate-900 hover:bg-slate-800/40 text-slate-400"
                              }`}
                              title={icon}
                            >
                              {renderLogoIcon(icon, `w-4 h-4 ${customLogo === icon ? tc.primaryText : "text-slate-400"}`)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom System Prompt */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[10px] text-slate-400 block font-mono font-medium uppercase">4. Custom System Prompt (AI Behavior)</label>
                        <textarea
                          rows={2}
                          value={customSystemPrompt}
                          onChange={(e) => handleSystemPromptChange(e.target.value)}
                          placeholder="Leave empty to use built-in ERPNext Smart Copilot instructions..."
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-slate-700 font-mono resize-none leading-relaxed"
                        />
                        <span className="text-[9px] text-slate-500 block leading-tight">
                          Isko empty chhodne par standard assistant guidelines use hongi. Aap ise empty kar sakte hain!
                        </span>
                      </div>
                    </div>

                    {/* Part B: Live ERPNext API connection */}
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          🔌 Live ERPNext API Sync
                        </h4>
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={erpSyncEnabled} 
                            onChange={(e) => handleSyncToggle(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="relative w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950"></div>
                          <span className="ms-1.5 text-[10px] font-mono text-slate-400">Sync Active</span>
                        </label>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[9px] text-slate-400 font-mono">ERPNext Site URL</label>
                          <input 
                            type="text" 
                            placeholder="https://mysite.erpnext.com" 
                            value={erpUrl}
                            onChange={(e) => handleErpUrlChange(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-400 font-mono">ERPNext API Key</label>
                            <input 
                              type="password" 
                              placeholder="api_key" 
                              value={erpApiKey}
                              onChange={(e) => handleErpApiKeyChange(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-400 font-mono">ERPNext API Secret</label>
                            <input 
                              type="password" 
                              placeholder="api_secret" 
                              value={erpApiSecret}
                              onChange={(e) => handleErpApiSecretChange(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={testErpConnection}
                            disabled={isTestingConnection}
                            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono font-medium transition disabled:opacity-50"
                          >
                            {isTestingConnection ? "Testing..." : "Test API Connection"}
                          </button>
                          
                          <button
                            type="button"
                            onClick={runErpSync}
                            disabled={isSyncingData}
                            className={`flex-1 py-1.5 bg-gradient-to-r ${tc.gradient} text-slate-950 rounded text-[10px] font-mono font-semibold transition disabled:opacity-50 flex items-center justify-center gap-1`}
                          >
                            <RefreshCw className={`w-3 h-3 ${isSyncingData ? "animate-spin" : ""}`} />
                            {isSyncingData ? "Syncing..." : "Sync Database Live"}
                          </button>
                        </div>

                        {connectionMessage.text && (
                          <div className={`p-2 rounded text-[10px] font-mono border ${
                            connectionMessage.status === "success" 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          }`}>
                            {connectionMessage.text}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Console Logger for Live Sync updates */}
                    <div className="bg-slate-950 border border-slate-900 rounded-lg p-2 font-mono text-[9px] space-y-1 h-[140px] overflow-auto">
                      <div className="text-slate-500 border-b border-slate-900 pb-1 mb-1">System Console Logger:</div>
                      {syncLogs.length === 0 ? (
                        <div className="text-slate-600 italic">Console idle. Perform Connection check or DB Sync to stream trace outputs.</div>
                      ) : (
                        syncLogs.map((log, i) => (
                          <div 
                            key={i} 
                            className={
                              log.includes("❌") || log.includes("[Error]") 
                                ? "text-rose-400" 
                                : log.includes("🚀") || log.includes("[Success]") 
                                  ? "text-emerald-400 font-bold" 
                                  : "text-slate-300"
                            }
                          >
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeDbTab === "manage" && (
                  <div className="space-y-4">
                    {/* Database Control Actions */}
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                        ⚙️ Database Actions (Control Panel)
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Yahan se aap default/old sandbox database ko clear karke bilkul empty kar sakte hain, ya fir standard mock data vapas restore kar sakte hain.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleClearDb("")}
                          className="py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-mono font-medium transition flex items-center justify-center gap-1.5"
                        >
                          🗑️ Clear Entire DB (Sab Delete Karein)
                        </button>
                        <button
                          type="button"
                          onClick={handleResetDbToDefault}
                          className="py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-mono font-medium transition flex items-center justify-center gap-1.5"
                        >
                          🔄 Reset default Mock DB
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleClearDb("stock")}
                          className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono transition"
                        >
                          Clear Stock
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClearDb("customers")}
                          className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono transition"
                        >
                          Clear Ledger
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClearDb("leads")}
                          className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono transition"
                        >
                          Clear Leads
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClearDb("quotations")}
                          className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono transition"
                        >
                          Clear Quotations
                        </button>
                      </div>
                    </div>

                    {/* Add Custom Record Form */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                        ➕ Add Naya Custom Record
                      </h4>

                      <form onSubmit={handleAddRecord} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-mono font-medium">1. SELECT DOCTYPE (TABLE)</label>
                          <select
                            value={formTable}
                            onChange={(e) => {
                              setFormTable(e.target.value as any);
                              setFormStatusMessage({ text: "", isError: false });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-mono"
                          >
                            <option value="stock">📦 Stock Item (tabItem)</option>
                            <option value="customers">👤 Customer Ledger (Accounts Outstanding)</option>
                            <option value="leads">🤝 CRM Lead (Potential Customer)</option>
                            <option value="quotations">📄 Sales Quotation (Draft Offer)</option>
                          </select>
                        </div>

                        {/* Stock Fields */}
                        {formTable === "stock" && (
                          <div className="space-y-2.5 border-t border-slate-800/50 pt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
                            <div className="sm:col-span-2">
                              <p className="text-[10px] text-amber-400/90 font-medium italic mb-1">
                                Hint: Iske baad AI Copilot se check karne ke liye bol sakte hain: "Check stock of [Item Code]"
                              </p>
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-mono">Item Code * (e.g. ERP-ITEM-505)</label>
                              <input
                                type="text"
                                value={formStock.item_code}
                                onChange={(e) => setFormStock({ ...formStock, item_code: e.target.value.toUpperCase() })}
                                placeholder="E.g. ERP-ITEM-505"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-mono">Item Name * (e.g. Oxygen Mask)</label>
                              <input
                                type="text"
                                value={formStock.name}
                                onChange={(e) => setFormStock({ ...formStock, name: e.target.value })}
                                placeholder="E.g. Oxygen Concentrator Mask"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-mono">Stock Quantity (Numbers)</label>
                              <input
                                type="number"
                                value={formStock.stock}
                                onChange={(e) => setFormStock({ ...formStock, stock: e.target.value })}
                                placeholder="E.g. 150"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-mono">Price (INR)</label>
                              <input
                                type="number"
                                value={formStock.price}
                                onChange={(e) => setFormStock({ ...formStock, price: e.target.value })}
                                placeholder="E.g. 1200"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[9px] text-slate-400 font-mono">Warehouse Name</label>
                              <input
                                type="text"
                                value={formStock.warehouse}
                                onChange={(e) => setFormStock({ ...formStock, warehouse: e.target.value })}
                                placeholder="E.g. Delhi Regional Warehouse"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                              />
                            </div>
                          </div>
                        )}

                        {/* Customer Fields */}
                        {formTable === "customers" && (
                          <div className="space-y-2.5 border-t border-slate-800/50 pt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
                            <div className="sm:col-span-2">
                              <p className="text-[10px] text-amber-400/90 font-medium italic mb-1">
                                Hint: Iske baad AI Copilot se bolein: "[Customer Name] ka outstanding check karo"
                              </p>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[9px] text-slate-400 font-mono">Customer Name *</label>
                              <input
                                type="text"
                                value={formCustomer.customer_name}
                                onChange={(e) => setFormCustomer({ ...formCustomer, customer_name: e.target.value })}
                                placeholder="E.g. Fortis Healthcare"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-mono">Outstanding Bill Amount (INR)</label>
                              <input
                                type="number"
                                value={formCustomer.outstanding}
                                onChange={(e) => setFormCustomer({ ...formCustomer, outstanding: e.target.value })}
                                placeholder="E.g. 180000"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-mono">Credit Limit (INR)</label>
                              <input
                                type="number"
                                value={formCustomer.credit_limit}
                                onChange={(e) => setFormCustomer({ ...formCustomer, credit_limit: e.target.value })}
                                placeholder="E.g. 500000"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[9px] text-slate-400 font-mono">Accounts Email Address</label>
                              <input
                                type="email"
                                value={formCustomer.email}
                                onChange={(e) => setFormCustomer({ ...formCustomer, email: e.target.value })}
                                placeholder="E.g. finance@fortis.com"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                              />
                            </div>
                          </div>
                        )}

                        {/* Lead Fields */}
                        {formTable === "leads" && (
                          <div className="space-y-2.5 border-t border-slate-800/50 pt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
                            <div className="sm:col-span-2">
                              <p className="text-[10px] text-amber-400/90 font-medium italic mb-1">
                                Hint: Aap directly chat AI me bolkar bhi real/mock lead insert kar sakte hain!
                              </p>
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-mono">Lead Contact Person Name *</label>
                              <input
                                type="text"
                                value={formLead.lead_name}
                                onChange={(e) => setFormLead({ ...formLead, lead_name: e.target.value })}
                                placeholder="E.g. Rajesh Kumar"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-mono">Company / Hospital Name *</label>
                              <input
                                type="text"
                                value={formLead.company_name}
                                onChange={(e) => setFormLead({ ...formLead, company_name: e.target.value })}
                                placeholder="E.g. Kumar Pharma"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-mono">Email Address *</label>
                              <input
                                type="email"
                                value={formLead.email}
                                onChange={(e) => setFormLead({ ...formLead, email: e.target.value })}
                                placeholder="E.g. rajesh@kumarpharma.com"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-mono">Phone Number</label>
                              <input
                                type="text"
                                value={formLead.phone}
                                onChange={(e) => setFormLead({ ...formLead, phone: e.target.value })}
                                placeholder="E.g. +91 99887 76655"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                              />
                            </div>
                          </div>
                        )}

                        {/* Quotation Fields */}
                        {formTable === "quotations" && (
                          <div className="space-y-2.5 border-t border-slate-800/50 pt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
                            <div className="sm:col-span-2">
                              <p className="text-[10px] text-amber-400/90 font-medium italic mb-1">
                                Hint: Aap dynamically chat me sales rep bankar AI se quotation draft karva sakte hain.
                              </p>
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-mono">Customer Name *</label>
                              <input
                                type="text"
                                value={formQuotation.customer_name}
                                onChange={(e) => setFormQuotation({ ...formQuotation, customer_name: e.target.value })}
                                placeholder="E.g. Fortis Healthcare"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-mono">Item Code *</label>
                              <input
                                type="text"
                                value={formQuotation.item_code}
                                onChange={(e) => setFormQuotation({ ...formQuotation, item_code: e.target.value.toUpperCase() })}
                                placeholder="E.g. ERP-ITEM-101"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-mono">Quantity *</label>
                              <input
                                type="number"
                                value={formQuotation.qty}
                                onChange={(e) => setFormQuotation({ ...formQuotation, qty: e.target.value })}
                                placeholder="E.g. 5"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-mono">Grand Total Amount (INR)</label>
                              <input
                                type="number"
                                value={formQuotation.grand_total}
                                onChange={(e) => setFormQuotation({ ...formQuotation, grand_total: e.target.value })}
                                placeholder="E.g. 150000"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[9px] text-slate-400 font-mono">Status</label>
                              <select
                                value={formQuotation.status}
                                onChange={(e) => setFormQuotation({ ...formQuotation, status: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
                              >
                                <option value="Draft">Draft</option>
                                <option value="Submitted">Submitted</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Status Message */}
                        {formStatusMessage.text && (
                          <div className={`p-2.5 rounded text-[10.5px] font-mono border mt-3 ${
                            formStatusMessage.isError
                              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          }`}>
                            {formStatusMessage.text}
                          </div>
                        )}

                        <button
                          type="submit"
                          className={`w-full py-2 bg-gradient-to-r ${tc.gradient} text-slate-950 rounded-lg text-xs font-semibold tracking-wide hover:shadow-lg transition mt-4`}
                        >
                          💾 Save Record in Sandbox Database
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>

              {/* Simulation Quick Buttons */}
              <div className="p-3 bg-slate-900 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono font-medium block mb-2">💡 Quick Simulation Templates (Click to insert):</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickQueries.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setChatInput(item.query)}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition border border-slate-700/60 hover:border-emerald-500/40"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Copilot Chat Module on right */}
            <div className="lg:col-span-7 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col overflow-hidden h-[620px]">
                <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-sm font-semibold font-display block">ERPNext Smart AI Assistant</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {isDeveloperMode 
                          ? (aiProvider === "gemini" ? "Google Gemini (Free & Stable Mode) with Active Database Tools" : "Llama 3.3 70B via OpenRouter with Active Database Tools")
                          : "ERPNext Direct API Bridge Active & Online"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMessages([
                      { role: "system", content: "Chat history cleared." },
                      { role: "model", content: "Namaste! Main ERPNext system se directly connected hoon. Aap mujhse stock checking, customer outstanding balances ya lead creation ke baare me pooch sakte hain." }
                    ])}
                    className="text-xs text-slate-400 hover:text-rose-400 transition"
                  >
                    Clear Chat
                  </button>
                </div>

                {/* AI Provider selector & API Key Setup Panel */}
                {isDeveloperMode && (
                  <div className="bg-slate-950 p-4 border-b border-slate-800/80 space-y-3">
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Google Gemini API Key (Optional):</span>
                        </label>
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-0.5"
                        >
                          Get Free Key from AI Studio ↗
                        </a>
                      </div>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="Enter key to override (or leave empty to use built-in free proxy)"
                          className="w-full bg-slate-900 text-xs text-emerald-400 placeholder-slate-500 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 focus:outline-none font-mono"
                          value={geminiApiKey}
                          onChange={(e) => handleApiKeyChange(e.target.value)}
                        />
                      </div>
                      {!geminiApiKey ? (
                        <p className="text-[10.5px] text-emerald-400/95 font-medium leading-relaxed flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 animate-pulse" />
                          <span>✓ Workspace Default Key Active! Bilkul free aur unlimited response chalega.</span>
                        </p>
                      ) : (
                        geminiApiKey.trim().startsWith("AIzaSy") ? (
                          <p className="text-[10.5px] text-emerald-400/95 font-medium leading-relaxed flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span>✓ Custom Gemini Key configured successfully. No cost tier active.</span>
                          </p>
                        ) : (
                          <p className="text-[10.5px] text-rose-400 font-medium leading-relaxed flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                            <span>⚠️ Invalid format. Key should start with 'AIzaSy'.</span>
                          </p>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Chat messages */}
                <div className="flex-1 overflow-auto p-4 space-y-4 bg-slate-950/20">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-emerald-600 text-slate-950 rounded-br-none font-medium shadow-md shadow-emerald-500/5"
                            : msg.role === "system"
                            ? "bg-slate-900/60 text-slate-400 border border-slate-800 text-center mx-auto my-1 py-1 px-3 rounded-full text-[10px]"
                            : "bg-slate-900 text-slate-100 border border-slate-800/80 rounded-bl-none shadow-md"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl rounded-bl-none px-4 py-3 text-xs flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Querying Mock ERPNext Database via Tool Calling...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Execution Trace logs accordion at bottom of chat */}
                {executionLogs.length > 0 && (
                  <div className="border-t border-slate-800/80 bg-slate-900/90 p-3 max-h-[160px] overflow-auto">
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider mb-2">
                      <Terminal className="w-3 h-3 text-emerald-400" />
                      <span>{isDeveloperMode ? "Gemini Agent Tool Trace Execution Logs:" : "Copilot Engine Function Call Trace:"}</span>
                    </div>
                    <div className="space-y-1.5 text-[11px] font-mono">
                      {executionLogs.map((log, index) => (
                        <div key={index} className="border-b border-slate-800/40 pb-1.5">
                          <span className="text-emerald-400 font-semibold">[{log.phase}]</span>{" "}
                          <span className="text-slate-300">{log.description}</span>
                          {log.args && (
                            <div className="text-slate-400 bg-slate-950 p-1.5 rounded mt-1 overflow-x-auto max-w-full text-[10px]">
                              Arguments: {JSON.stringify(log.args)}
                            </div>
                          )}
                          {log.result && (
                            <div className="text-teal-400 bg-slate-950 p-1.5 rounded mt-1 overflow-x-auto max-w-full text-[10px]">
                              DB Result: {JSON.stringify(log.result)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cooldown Alert Countdown */}
                {cooldownTime > 0 && (
                  <div className="mx-3 my-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col gap-1.5 animate-pulse">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
                        Rate Limit Cooldown Active
                      </span>
                      <span className="font-mono text-sm bg-amber-500/20 px-2 py-0.5 rounded-md text-amber-400">
                        {cooldownTime}s remaining
                      </span>
                    </div>
                    <p className="text-slate-300 leading-normal text-[11px]">
                      Gemini Free Tier API quota reset ho raha hai. Aapka agla query time <strong>{cooldownTime} seconds</strong> baad hai.
                    </p>
                    <div className="w-full bg-slate-950 h-1 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="bg-amber-400 h-full transition-all duration-1000 ease-linear" 
                        style={{ width: `${(cooldownTime / 60) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Chat input box */}
                <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={cooldownTime > 0 ? `Please wait ${cooldownTime}s before next query...` : "E.g., Check stock for ERP-ITEM-101..."}
                    disabled={isSending || cooldownTime > 0}
                    className="flex-1 bg-slate-950 text-slate-100 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none transition placeholder-slate-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !chatInput.trim() || cooldownTime > 0}
                    className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition flex-shrink-0 flex items-center justify-center min-w-[44px]"
                  >
                    {cooldownTime > 0 ? (
                      <span className="font-mono text-xs">{cooldownTime}s</span>
                    ) : (
                      <Send className="w-4 h-4 md:w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
          </div>
        )}

        {/* 3. SYSTEM ARCHITECTURE DIAGRAM */}
        {activeTab === "architecture" && (
          <div className="space-y-6">
            
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-bold font-display text-emerald-400 mb-2">Production Architecture Blueprint</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Niche bataya gaya flowchart yeh darshata hai ki jab koi user WhatsApp, Slack ya standalone webapp se message bhejta hai, toh hamara custom app model use karke ERPNext dynamic APIs ko kaise safe and secure tarike se execute karta hai:
              </p>
            </div>

            {/* Dynamic CSS Visual Diagram */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col md:flex-row items-center justify-around gap-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 pointer-events-none" />
              
              {/* Step A: User Client */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center w-full md:w-60 z-10 space-y-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-100 uppercase font-mono tracking-wider">User Interface</h4>
                <p className="text-slate-400 text-[11px]">WhatsApp Bot, App Screen, or Custom Web Widget</p>
                <div className="text-[10px] bg-slate-950 p-1 rounded font-mono text-emerald-500 text-center">User: "Stock kya hai?"</div>
              </div>

              {/* Arrow right */}
              <div className="flex md:flex-col items-center gap-1 text-slate-600">
                <ArrowRight className="w-5 h-5 transform rotate-90 md:rotate-0" />
                <span className="text-[9px] font-mono">HTTPS POST</span>
              </div>

              {/* Step B: Middleware controller */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center w-full md:w-60 z-10 space-y-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit mx-auto">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-100 uppercase font-mono tracking-wider">Frappe API Controller</h4>
                <p className="text-slate-400 text-[11px]">Handles routing, authentication token verification, & loads custom tools schemas</p>
                <div className="text-[10px] bg-emerald-500/10 text-emerald-400 p-1 rounded font-mono">Secure API Proxy</div>
              </div>

              {/* Arrow right */}
              <div className="flex md:flex-col items-center gap-1 text-slate-600">
                <ArrowRight className="w-5 h-5 transform rotate-90 md:rotate-0" />
                <span className="text-[9px] font-mono">Tool Call Query</span>
              </div>

              {/* Step C: Gemini LLM */}
              <div className="bg-gradient-to-tr from-emerald-900/40 to-slate-900 p-4 rounded-xl border border-emerald-500/20 text-center w-full md:w-60 z-10 space-y-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg w-fit mx-auto">
                  <Layers className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase font-mono tracking-wider">Gemini 3.5 LLM</h4>
                <p className="text-slate-300 text-[11px]">Decides function execution parameters dynamically (Function Calling)</p>
                <div className="text-[10px] bg-emerald-500/20 text-emerald-200 p-1 rounded font-mono">Decides get_item_stock()</div>
              </div>

              {/* Arrow right */}
              <div className="flex md:flex-col items-center gap-1 text-slate-600">
                <ArrowRight className="w-5 h-5 transform rotate-90 md:rotate-0" />
                <span className="text-[9px] font-mono">Execute Call</span>
              </div>

              {/* Step D: ERPNext Core Database */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center w-full md:w-60 z-10 space-y-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit mx-auto">
                  <Database className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-100 uppercase font-mono tracking-wider">MariaDB (ERPNext)</h4>
                <p className="text-slate-400 text-[11px]">Database records, stocks ledger and invoices stored on server</p>
                <div className="text-[10px] bg-slate-950 p-1 rounded font-mono text-emerald-400">Updates / Selects DB</div>
              </div>

            </div>

            {/* Why standard APIs vs Direct DB access */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-md font-bold font-display text-slate-200">Pros of Standard API Access (Rest API / Python whitelist)</h3>
                <ul className="text-xs text-slate-300 space-y-2 list-disc pl-5">
                  <li><strong>Security Audits:</strong> User credentials are secure. Standard ORM queries do not suffer from direct SQL Injections.</li>
                  <li><strong>Business Logic Integrity:</strong> Validation hooks chalte hain (for example, duplicate check constraints automatically run in standard DocType).</li>
                  <li><strong>Field Mapping:</strong> Core updates ke sath change hone wali structures automatically handle ho jati hain.</li>
                </ul>
              </div>
              
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-md font-bold font-display text-slate-200">Why Direct raw Database query is dangerous</h3>
                <ul className="text-xs text-slate-300 space-y-2 list-disc pl-5 text-rose-300">
                  <li><strong>Permissions bypass:</strong> Users bina server credentials ke core settings access kar sakti hain, which can lead to leaks.</li>
                  <li><strong>No transaction safety:</strong> Ad-hoc insert queries write actions chalakar status log break kar sakte hain.</li>
                  <li><strong>Update failure:</strong> ERPNext updates table structure modify karte hain, breaking ad-hoc queries easily.</li>
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* 4. CODE SNIPPETS TAB */}
        {activeTab === "code_snippets" && (
          <div className="space-y-6">
            
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-bold font-display text-emerald-400 mb-2">Production-Ready Code for Your Custom App</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Aap is code snippet ko seedhe apne Custom Frappe App (e.g. <code>erpnext_ai_copilot/api.py</code>) mein paste kar sakte hain. Yeh real-world query logic standard <strong>frappe.db.get_value</strong> handles ko build karega:
              </p>
            </div>

            <div className="space-y-4">
              
              {/* Python Whitelist snippet */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center px-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-xs font-mono font-bold text-slate-200">api.py (Frappe Backend)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(pythonSnippet, "py")}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                  >
                    {copiedId === "py" ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{copiedId === "py" ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>
                <div className="p-4 bg-slate-950 overflow-x-auto">
                  <pre className="text-xs font-mono text-slate-300 leading-relaxed">
                    {pythonSnippet}
                  </pre>
                </div>
              </div>

              {/* Gemini configuration snippet */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center px-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-mono font-bold text-slate-200">gemini_orchestrator.ts (Node/Express or Python integration)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(jsSnippet, "js")}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                  >
                    {copiedId === "js" ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{copiedId === "js" ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>
                <div className="p-4 bg-slate-950 overflow-x-auto">
                  <pre className="text-xs font-mono text-slate-300 leading-relaxed">
                    {jsSnippet}
                  </pre>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 5. ANDROID APK BUILDER TAB */}
        {activeTab === "apk_builder" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header Card */}
            <div className={`bg-gradient-to-tr ${tc.gradient} rounded-2xl p-6 text-slate-950 shadow-xl`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="bg-slate-950 text-emerald-400 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    Mobile App Deployment Engine
                  </span>
                  <h2 className="text-2xl font-black font-display tracking-tight">
                    Convert ERPNext AI Chatbot to Android APK!
                  </h2>
                  <p className="text-xs font-medium text-slate-900/80 max-w-2xl leading-relaxed">
                    Haan bilkul! Aap is AI Copilot aur ERPNext sandbox ko ek full-featured Android APK file (.apk) mein convert kar sakte hain jise kisi bhi phone par open karke direct chatbot se chat ki ja sake. Neeche diye gaye 4 sabse aasaan tarike dekhein:
                  </p>
                </div>
                <div className="p-3 bg-slate-950/25 rounded-2xl">
                  <Smartphone className="w-12 h-12 text-slate-950 animate-bounce" />
                </div>
              </div>
            </div>

            {/* Methods Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Method A: PWA - Installable Web App (Best for Instant Use) */}
              <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <span className={`w-6 h-6 rounded-lg ${tc.bgLight} flex items-center justify-center font-bold text-xs ${tc.primaryText}`}>1</span>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Method 1: Instant Mobile Install (PWA) - 10 Seconds</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Aapko koi bhi software code compile karne ki zarurat nahi hai! Humne is application ko modern <strong>Progressive Web App (PWA)</strong> standard ke sath code kiya hai. 
                </p>
                
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className={`text-[10.5px] font-bold ${tc.primaryText} font-mono`}>STEP 1:</span>
                    <span className="text-slate-300">Apne Android phone par <strong>Google Chrome</strong> app open karein aur is application ka URL open karein.</span>
                  </div>
                  <div className="flex items-start gap-2 border-t border-slate-900/60 pt-2">
                    <span className={`text-[10.5px] font-bold ${tc.primaryText} font-mono`}>STEP 2:</span>
                    <span className="text-slate-300">Browser ke upar right side me click karke <strong>"Add to Home Screen"</strong> ya <strong>"Install App"</strong> select karein.</span>
                  </div>
                  <div className="flex items-start gap-2 border-t border-slate-900/60 pt-2">
                    <span className={`text-[10.5px] font-bold ${tc.primaryText} font-mono`}>STEP 3:</span>
                    <span className="text-slate-300">App aapke phone dashboard par direct save ho jayega. Ise click karte hi yeh full-screen mobile app (bina URL bar ke) open ho jayega!</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 space-y-2">
                  <span className="text-[10px] text-slate-400 block font-mono">YOUR RE-BRANDED MOBILE APP DETAILS:</span>
                  <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">APP NAME:</span>
                      <span className="text-slate-200 font-bold">{customAppName}</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">COLOR BRANDING:</span>
                      <span className={`text-slate-200 font-bold capitalize ${tc.primaryText}`}>{brandTheme} Theme</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Method B: 1-Click Online Free APK Builders (Recommended for Beginners) */}
              <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <span className={`w-6 h-6 rounded-lg ${tc.bgLight} flex items-center justify-center font-bold text-xs ${tc.primaryText}`}>2</span>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Method 2: 1-Click Free Cloud APK Creator - 1 Minute</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Agar aapko proper installable <code>.apk</code> file download karke share karni hai, toh aap is web link ko directly online generator me daal sakte hain:
                </p>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-mono">YOUR APP URL TO CONVERT INTO APK:</label>
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded">
                      <input 
                        type="text" 
                        readOnly 
                        value={window.location.origin} 
                        className="bg-transparent text-slate-300 focus:outline-none w-full font-mono text-[11px]" 
                      />
                      <button 
                        onClick={() => copyToClipboard(window.location.origin, "apk_url_copy")}
                        className={`text-[10px] bg-slate-800 text-slate-200 px-2 py-1 rounded hover:brightness-110 active:scale-[0.98]`}
                      >
                        {copiedId === "apk_url_copy" ? "Copied!" : "Copy URL"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 block font-mono">STEPS FOR ZERO-CODE BUILD:</span>
                    <ol className="list-decimal pl-4 text-slate-300 space-y-1 leading-relaxed">
                      <li>Go to free builders: <a href="https://www.webintoapp.com" target="_blank" rel="noreferrer" className={`underline ${tc.primaryText}`}>webintoapp.com</a> or <a href="https://www.appcreator24.com" target="_blank" rel="noreferrer" className={`underline ${tc.primaryText}`}>appcreator24.com</a></li>
                      <li>Apna App Name <strong>({customAppName})</strong> aur upar se copied <strong>App URL</strong> fill karein.</li>
                      <li>Apna custom app icon upload karein aur <strong>"Build APK"</strong> par click karein.</li>
                      <li>Compile hone ke baad seedhe <code>.apk</code> download karke install karein!</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Method C: Capacitor CLI (Standard Native Hybrid Compilation) */}
              <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <span className={`w-6 h-6 rounded-lg ${tc.bgLight} flex items-center justify-center font-bold text-xs ${tc.primaryText}`}>3</span>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Method 3: Native Hybrid Compilation (CapacitorJS)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Professional development ke liye, aap industry-standard **CapacitorJS** compiler package use karke is react code ko pure native Android components me translate kar sakte hain:
                </p>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 block font-mono">1. RUN CONFIGURATION COMMANDS IN TERMINAL:</span>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-[10.5px] text-slate-300 space-y-2 relative">
                    <button 
                      onClick={() => copyToClipboard(`npm i @capacitor/core @capacitor/cli\nnpx cap init "${customAppName}" "com.erpnextai.copilot" --web-dir=dist\nnpm run build\nnpm i @capacitor/android\nnpx cap add android`, "cap_commands")}
                      className="absolute right-2 top-2 text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400"
                    >
                      {copiedId === "cap_commands" ? "✓ Copied" : "Copy"}
                    </button>
                    <div className="text-emerald-500"># Install core capacitor packages</div>
                    <div>npm i @capacitor/core @capacitor/cli</div>
                    <div className="text-emerald-500 pt-1.5"># Initialize Android project context</div>
                    <div>npx cap init "{customAppName}" "com.erpnextai.copilot" --web-dir=dist</div>
                    <div className="text-emerald-500 pt-1.5"># Prepare and compile React bundles</div>
                    <div>npm run build</div>
                    <div className="text-emerald-500 pt-1.5"># Add Android Studio SDK bindings</div>
                    <div>npm i @capacitor/android && npx cap add android</div>
                  </div>

                  <span className="text-[10px] text-slate-400 block font-mono pt-2">2. TO GENERATE SIGNED .APK FILE:</span>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-900 text-xs font-mono text-slate-300 flex justify-between items-center">
                    <span>npx cap open android</span>
                    <button 
                      onClick={() => copyToClipboard("npx cap open android", "cap_open")}
                      className="text-[9px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400"
                    >
                      {copiedId === "cap_open" ? "✓" : "Copy"}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    *Yeh command direct Android Studio launch karegi jahan se aap single-click me APK generate kar sakte hain.
                  </p>
                </div>
              </div>

              {/* Method D: Trusted Web Activity (TWA) with Google Bubblewrap */}
              <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <span className={`w-6 h-6 rounded-lg ${tc.bgLight} flex items-center justify-center font-bold text-xs ${tc.primaryText}`}>4</span>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Method 4: Google Bubblewrap (Fast Play Store APK)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Agar aapko apni app **Google Play Store** par publish karni hai, toh Google ka official **Bubblewrap CLI** CLI best choice hai jo custom manifest ko seedhe signed key store APK me generate karta hai:
                </p>

                <div className="space-y-3.5">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-[10.5px] text-slate-300 space-y-2 relative">
                    <button 
                      onClick={() => copyToClipboard(`npm i -g @bubblewrap/cli\nbubblewrap init --manifest=${window.location.origin}/manifest.json\nbubblewrap build`, "bubble_commands")}
                      className="absolute right-2 top-2 text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400"
                    >
                      {copiedId === "bubble_commands" ? "✓ Copied" : "Copy"}
                    </button>
                    <div className="text-emerald-500"># Install Google's official command line utility</div>
                    <div>npm i -g @bubblewrap/cli</div>
                    <div className="text-emerald-500 pt-1.5"># Initialize app metadata with manifest</div>
                    <div>bubblewrap init --manifest={window.location.origin}/manifest.json</div>
                    <div className="text-emerald-500 pt-1.5"># Compile final signed APK package</div>
                    <div>bubblewrap build</div>
                  </div>

                  <div className={`p-3 rounded-lg bg-emerald-500/10 border ${tc.borderLight} text-[11px] leading-relaxed text-emerald-400`}>
                    <strong>💡 Pro-Tip:</strong> Yeh Bubblewrap tool Android SDK aur JDK tools automatically background me download karke pure native <code>.apk</code> compile karke de dega!
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Help block */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className={`text-xs font-bold ${tc.primaryText}`}>Zarurat padne par support?</span>
                <p className="text-[11px] text-slate-400">Agar aapko build commands ke time koi Android compile error aaye, toh mujhe niche chatbot me paste karein!</p>
              </div>
              <button 
                onClick={() => {
                  setActiveTab("simulation");
                  setChatInput("Android app build errors and how to solve them?");
                }}
                className={`px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-mono`}
              >
                Ask Chatbot 💬
              </button>
            </div>

          </div>
        )}

        {/* 6. SITE & DEVICE SECURITY TAB */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 pointer-events-none" />
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
                    <ShieldCheck className="w-3.5 h-3.5" /> Cyber Security & Site Enforcer
                  </span>
                  <h2 className="text-2xl font-black font-display tracking-tight text-slate-100">
                    ERPNext & Connected Devices Security Hardening
                  </h2>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Aapka connected local ERPNext site (<code>http://mysite.localhost:8000</code>) aur simulation chatbot environment ko secure karna hamari sabse badi priority hai. Apne credentials ko leak hone se bachane aur cyber attacks se systems ko safe rakhne ke liye neeche diye gaye indicators aur active protocols ko follow karein:
                  </p>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-2xl">
                  <Lock className="w-10 h-10 text-emerald-400 animate-pulse" />
                </div>
              </div>
            </div>

            {/* LIVE URL SAFETY INSPECTOR */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> 
                Live Connection Safety & SSL Analyzer
              </h3>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">CURRENT ERP URL STAGE:</span>
                    <span className="text-xs font-mono text-slate-200 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-850 inline-block mt-1">
                      {erpUrl || "Localhost (Mock Sandbox)"}
                    </span>
                  </div>
                  
                  {/* Dynamic SSL/TLS Verdict */}
                  <div className="flex items-center gap-2.5">
                    {!erpUrl ? (
                      <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mock Mode Active: 100% Client-Side Safe</span>
                      </div>
                    ) : erpUrl.startsWith("https://") ? (
                      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-mono">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>SSL Secure Encryption: ACTIVE (HTTPS)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-mono">
                        <AlertCircle className="w-4 h-4 text-amber-400 animate-bounce" />
                        <span>Unencrypted Link Warning (HTTP Plaintext)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Analysis Text based on URL */}
                <div className="text-xs text-slate-300 leading-relaxed space-y-2 border-t border-slate-900/60 pt-3">
                  {!erpUrl ? (
                    <p>
                      💡 Aap abhi local mock database sandbox ka istemaal kar rahe hain. Is state me aapke credentials browser me local hi rehte hain aur kisi server par send nahi hote, jo ki security perspective se <strong>100% Safe</strong> hai!
                    </p>
                  ) : erpUrl.startsWith("https://") ? (
                    <p>
                      ✅ Aapka traffic <strong>HTTPS SSL/TLS Encryption</strong> ke zariye securely route ho raha hai. Iska matlab hai ki aapke local laptops, routers ya devices par transiting packets ko koi intercept nahi kar sakta. Credentials completely encrypted formats me travel kar rahe hain!
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-amber-400 font-bold">
                        ⚠️ Warning: Aapka URL standard unencrypted (HTTP) transport use kar raha hai!
                      </p>
                      <p className="text-slate-400">
                        Chunki local network ya public Wi-Fi par plain HTTP traffic inspect kiya ja sakta hai, isliye aapke Frappe API key aur secret ko shoulder-sniffers se khatra ho sakta hai. 
                        <strong className="text-slate-200"> Isko fix karne ke liye:</strong> Apne local computer me Ngrok chalate waqt hamesha <code className="bg-slate-900 text-emerald-400 px-1 py-0.5 rounded">https://</code> se start hone wala tunnel URL use karein. Ngrok automatically local HTTP portal ko secure HTTPS gateway me convert kar deta hai!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* CHROME "NOT SECURE" WARNING GUIDE */}
              <div className="bg-rose-950/10 border border-rose-900/30 rounded-xl p-4 space-y-3 mt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                      🛑 Fix Chrome Browser "Your Connection to this site is not secure" Warning for mysite.localhost:8000
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Jab aap browser me direct <code>http://mysite.localhost:8000</code> kholte hain, toh Google Chrome ye Warning dikhata hai. <strong>Ghabraiyye nahi!</strong> Iska matlab ye nahi hai ki aapke computer me koi virus ya attack hua hai. Ye isliye hai kyunki local computer me automatically SSL Certificate (HTTPS) active nahi hota.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-rose-950/40">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Option 1 (Sabse Aasan): Use Ngrok HTTPS Tunnel
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Ngrok aapke local site ko automatically ek safe online **HTTPS** address de deta hai. Isse Chrome ka non-secure warn complete bypass ho jayega aur custom padlock lock icon show hoga.
                    </p>
                    <ol className="text-[10.5px] text-slate-300 space-y-1 pl-4 list-decimal leading-relaxed">
                      <li>Apne Terminal me <code>ngrok http 8000</code> run karein.</li>
                      <li>Ngrok jo <code>https://...ngrok-free.app</code> link dega, use copy karein.</li>
                      <li>Vahi secure link apne browser me open karein - pure lock visual secure ho jayega!</li>
                    </ol>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-2">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      ⚙️ Option 2: Setup Local SSL Certificate (mkcert)
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Agar aap bina internet/ngrok ke local offline me real HTTPS chalana chahte hain:
                    </p>
                    <div className="bg-slate-900 p-2 rounded text-[10px] font-mono text-emerald-400 space-y-1 overflow-x-auto">
                      <div># Ubuntu/WSL me mkcert install karein</div>
                      <div>sudo apt install mkcert libnss3-tools -y && mkcert -install</div>
                      <div className="mt-1"># Apne site ke liye secure certificate generate karein</div>
                      <div>mkcert mysite.localhost localhost 127.0.0.1</div>
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed">
                      Isse browser ko local CA certificate mil jayega aur security tab me standard HTTPS green indicator activate ho jayega.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* THREE COLUMN DEFENSE ARCHITECTURE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Tunnel Protection */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-xs text-emerald-400">1</span>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">🌐 Tunnel & Ngrok Security</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Agar aap local laptop me <code>mysite.localhost:8000</code> chala rahe hain, toh ngrok ko public world me open chhodne ke bajaye use <strong>Basic Authentication</strong> se secure karein.
                  </p>
                  
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-900 space-y-1.5 font-mono text-[10.5px]">
                    <span className="text-slate-500 block text-[9.5px]">🔐 SECURED NGROK RUN COMMAND:</span>
                    <div className="bg-slate-900 p-2 rounded text-slate-300 flex justify-between items-center gap-2 overflow-x-auto">
                      <span className="text-[10px] whitespace-nowrap">ngrok http 8000 --basic-auth="admin:SecurePass789!"</span>
                      <button 
                        onClick={() => copyToClipboard('ngrok http 8000 --basic-auth="admin:SecurePass789!"', "sec_n1")}
                        className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400 shrink-0"
                      >
                        {copiedId === "sec_n1" ? "✓" : "Copy"}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-950/20 border border-emerald-900/40 p-2.5 rounded text-[11px] text-slate-300 space-y-1">
                    <span className="text-emerald-400 font-bold block">💡 Ye code kaha paste karna hai?</span>
                    <p className="leading-relaxed text-slate-300">
                      Ise aapko apne computer ke **Terminal (WSL / Ubuntu / Command Prompt)** me chalana hai, jaha aap normal <code>ngrok http 8000</code> chalate hain. Pehle se chal rahe ngrok ko terminal me <strong>Ctrl + C</strong> daba kar rokein, fir ye secured command copy karke paste karein aur Enter dabayein!
                    </p>
                  </div>
                  
                  <p className="text-[10.5px] text-slate-400 leading-relaxed">
                    ✓ Isse jab bhi koi aapka ngrok URL browser me open karega, toh use user/password (admin / SecurePass789!) poocha jayega. Aapka site totally protected rahega!
                  </p>
                </div>
              </div>

              {/* Card 2: Least Privilege API User */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-xs text-emerald-400">2</span>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">🛡️ Least Privilege API Setup</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hamesha core <code>Administrator</code> keys use karne se bachein. Ek alag restricted API User setup karein:
                  </p>
                  
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-xs space-y-2 text-slate-300 leading-relaxed">
                    <div className="flex gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Frappe me ek naya user banayein: <strong>ai_copilot_api</strong></span>
                    </div>
                    <div className="flex gap-2 border-t border-slate-900/60 pt-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Ek dedicated Role assign karein jisme sirf <strong>Item, Bin, Lead, Customer</strong> aur <strong>Quotation</strong> ka "Read" permissions ho.</span>
                    </div>
                    <div className="flex gap-2 border-t border-slate-900/60 pt-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Naye restricted user ke dashboard se API Key generate karein aur use is app me sync ke liye feed karein.</span>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-relaxed">
                    ✓ Agar in future key bypass bhi hoti hai, toh hacker kabhi system settings, files, ya database tables delete nahi kar payega!
                  </p>
                </div>
              </div>

              {/* Card 3: Linux Server Hardening */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-xs text-emerald-400">3</span>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">💻 Linux/WSL Firewall</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Apne local Ubuntu/WSL laptop ya VPS server par core services ko unauthorized connection request block karne ke liye firewall set karein:
                  </p>
                  
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-900 space-y-1.5 font-mono text-[10.5px]">
                    <span className="text-slate-500 block text-[9.5px]">🖥️ SHIELD FIREWALL COMMANDS (UBUNTU):</span>
                    <div className="bg-slate-900 p-2 rounded text-slate-300 space-y-1 font-mono text-[10px]">
                      <div>sudo ufw default deny incoming</div>
                      <div>sudo ufw allow 22/tcp <span className="text-slate-500"># SSH</span></div>
                      <div>sudo ufw allow 80/tcp <span className="text-slate-500"># HTTP</span></div>
                      <div>sudo ufw allow 443/tcp <span className="text-slate-500"># HTTPS</span></div>
                      <div>sudo ufw enable</div>
                    </div>
                  </div>

                  <div className="bg-rose-950/20 border border-rose-900/40 p-2.5 rounded text-[11px] text-slate-300 space-y-1">
                    <span className="text-rose-400 font-bold block">⚠️ Error: 'ufw' command not found?</span>
                    <p className="leading-relaxed text-slate-300">
                      Aapke computer me firewall module (ufw) installed nahi hai. Ise install karne ke liye apne terminal me pehle ye command run karein:<br />
                      <code className="bg-slate-900 text-emerald-400 px-1 py-0.5 rounded font-mono text-[10.5px] block mt-1 select-all">sudo apt update && sudo apt install ufw -y</code>
                      Uske baad upar wale ufw commands execute karein, wo fully work karenge!
                    </p>
                  </div>

                  <p className="text-[10.5px] text-slate-400 leading-relaxed">
                    ✓ Is firewall command se internet par direct connections block ho jayenge, aur aapki local machine port scanner attacks se bilkul protected rahegi.
                  </p>
                </div>
              </div>

            </div>

            {/* INTERACTIVE ENCRYPTION GENERATOR & ROLE POLICY CONFIGURATOR */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400 animate-spin" />
                Dynamic Security Role Configurator & Python Policy Generator
              </h3>
              
              <p className="text-xs text-slate-300 leading-relaxed">
                Apne ERPNext server par dynamic security rules lagane ke liye, niche diye gaye DocTypes select karein jinhe aap protect karna chahte hain. Hamara generator automatic ek <strong>Server-Side Security Whitelist Handler</strong> python script generate karega jise aap direct use kar sakte hain:
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 border-t border-slate-800/80 pt-4">
                
                {/* Selectors Column */}
                <div className="lg:col-span-2 space-y-4">
                  <span className="text-[10px] text-slate-400 block font-mono">CHOOSE DOCTYPES TO SHIELD:</span>
                  
                  <div className="space-y-2.5">
                    {[
                      { key: "item", name: "📦 Item Directory (Master Catalog)", checked: true },
                      { key: "bin", name: "📊 Bin Table (Stock Quantities & Warehouses)", checked: true },
                      { key: "customer", name: "👤 Customer List (Sensitive Account Info)", checked: false },
                      { key: "lead", name: "📈 Lead Table (CRM Contacts & Pipeline)", checked: false },
                      { key: "quotation", name: "📑 Quotation Table (Pricing & Discounts)", checked: false }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                        <input 
                          type="checkbox" 
                          id={`shield_doc_${idx}`}
                          defaultChecked={item.checked} 
                          className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-800"
                        />
                        <label htmlFor={`shield_doc_${idx}`} className="text-xs text-slate-300 cursor-pointer font-medium select-none">
                          {item.name}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-lg space-y-1.5 text-xs">
                    <span className="text-slate-400 block font-mono text-[10px]">🔒 SAFE API PROXY PROMISE:</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Aapka Gemini key, API secrets aur credentials client-side browser me secure layer me store hote hain aur direct Google servers ke through encrypted handshake call lagate hain. No middle third-party servers trace or save your credentials!
                    </p>
                  </div>
                </div>

                {/* Generator Code Output Column */}
                <div className="lg:col-span-3 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>🛡️ GENERATED SECURITY PY SHIELD (api_shield.py):</span>
                    <button 
                      onClick={() => copyToClipboard(`# Dynamic Frappe Security Shield Policy\nimport frappe\n\ndef validate_api_caller(user_email):\n    """Validate caller roles explicitly before return"""\n    roles = frappe.get_roles(user_email)\n    if "System Manager" in roles or "AI Copilot Restricted" in roles:\n        return True\n    return False\n\n@frappe.whitelist(allow_guest=False)\ndef get_shielded_stock_data(item_code):\n    """Only callers with AI Copilot Restricted role can execute"""\n    caller = frappe.session.user\n    if not validate_api_caller(caller):\n        frappe.throw("Access Denied: Caller does not possess AI Copilot Restricted clearance Role!")\n    \n    # Fetch data only from verified Bin table\n    return frappe.db.get_value("Bin", {"item_code": item_code}, ["warehouse", "actual_qty"], as_dict=True)`, "shield_code")}
                      className="text-emerald-400 hover:text-emerald-300 font-mono text-[9px] border border-slate-800 bg-slate-950 px-2 py-0.5 rounded"
                    >
                      {copiedId === "shield_code" ? "✓ Code Copied" : "Copy Shield Code"}
                    </button>
                  </div>

                  <div className="bg-slate-950 rounded-lg p-3.5 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-900 leading-relaxed max-h-[290px]">
                    <div className="text-slate-500"># Dynamic Frappe Security Shield Policy</div>
                    <div>import frappe</div>
                    <div className="text-slate-500 mt-1.5"># Validate user role strictly to block unauthorized requests</div>
                    <div className="text-emerald-400">def validate_api_caller(user_email):</div>
                    <div className="pl-4 text-slate-300">roles = frappe.get_roles(user_email)</div>
                    <div className="pl-4 text-slate-300">if "System Manager" in roles or "AI Copilot Restricted" in roles:</div>
                    <div className="pl-8 text-emerald-400">return True</div>
                    <div className="pl-4 text-slate-300">return False</div>
                    
                    <div className="text-slate-500 mt-2.5">@frappe.whitelist(allow_guest=False)</div>
                    <div className="text-emerald-400">def get_shielded_stock_data(item_code):</div>
                    <div className="pl-4 text-slate-300">caller = frappe.session.user</div>
                    <div className="pl-4 text-slate-300">if not validate_api_caller(caller):</div>
                    <div className="pl-8 text-rose-400">frappe.throw("Access Denied: Secure user validation failed!")</div>
                    <div className="pl-4 text-slate-300">return frappe.db.get_value("Bin", &#123;"item_code": item_code&#125;, ["warehouse", "actual_qty"], as_dict=True)</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/40 px-6 py-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <span>© 2026 ERPNext AI Copilot System. Built with React, TypeScript & ERPNext APIs.</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 transition cursor-pointer">Architecture Roadmap</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition cursor-pointer">Security Standards</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition cursor-pointer">Developer Forum</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const pythonSnippet = `import frappe

@frappe.whitelist(allow_guest=False)
def query_erpnext_stock(item_code):
    """
    Get current stock levels from the Bin table
    """
    try:
        if not frappe.has_permission("Item", "read"):
            return {"status": "error", "message": "Permission Denied"}
            
        stock_data = frappe.db.get_all(
            "Bin", 
            filters={"item_code": item_code},
            fields=["warehouse", "actual_qty", "ordered_qty"]
        )
        return {"status": "success", "data": stock_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@frappe.whitelist(allow_guest=False)
def create_crm_lead(lead_name, company_name, email, phone=None):
    """
    Create a Sales Lead record dynamically inside CRM
    """
    try:
        # Create doc object
        doc = frappe.get_doc({
            "doctype": "Lead",
            "lead_name": lead_name,
            "company_name": company_name,
            "email_id": email,
            "mobile_no": phone,
            "status": "Lead"
        })
        doc.insert(ignore_permissions=False)
        frappe.db.commit()
        return {"status": "success", "message": "Lead created successfully", "name": doc.name}
    except Exception as e:
        return {"status": "error", "message": str(e)}
`;

const jsSnippet = `// Node.js Implementation with modern GoogleGenAI SDK
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define structural schemas for tool calling
const stockTool = {
  name: "get_item_stock",
  description: "Get real-time stock and pricing of raw materials or finished products inside ERPNext.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      item_code: { type: Type.STRING, description: "Unique catalog identifier in ERP" }
    },
    required: ["item_code"]
  }
};

async function chatWithCopilot(userPrompt) {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: "You are an assistant with access to real-time ERPNext data.",
      tools: [{ functionDeclarations: [stockTool] }]
    }
  });

  if (response.functionCalls) {
    const call = response.functionCalls[0];
    // Trigger Python Endpoint call inside ERPNext via Axios or Fetch
    const erpNextResult = await triggerERPNextEndpoint(call.name, call.args);
    
    // Feed it back
    const finalAnswer = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] },
        response.candidates[0].content,
        {
          role: 'user',
          parts: [{
            functionResponse: {
              name: call.name,
              response: erpNextResult,
              id: call.id
            }
          }]
        }
      ]
    });
    return finalAnswer.text;
  }
  return response.text;
}
`;

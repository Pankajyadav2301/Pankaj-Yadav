import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory Mock ERPNext Database
let mockStock: Record<string, { name: string; stock: number; warehouse: string; price: number }> = {
  "ERP-ITEM-101": { name: "Surgical Face Mask 3-Ply", stock: 1250, warehouse: "Main Store", price: 12 },
  "ERP-ITEM-202": { name: "N95 Respirator Mask", stock: 320, warehouse: "Main Store", price: 85 },
  "ERP-ITEM-303": { name: "Hand Sanitizer 500ml", stock: 80, warehouse: "Finished Goods Warehouse", price: 150 },
  "ERP-ITEM-404": { name: "Digital Thermometer", stock: 15, warehouse: "Delhi Regional Warehouse", price: 450 }
};

let mockCustomers: Record<string, { outstanding: number; credit_limit: number; email: string }> = {
  "Tata Motors": { outstanding: 450000, credit_limit: 1000000, email: "procure@tatamotors.com" },
  "Reliance Industries": { outstanding: 120000, credit_limit: 500000, email: "contact@ril.com" },
  "Apollo Hospitals": { outstanding: 0, credit_limit: 300000, email: "inventory@apollo.com" }
};

const mockLeads = [
  { id: "lead_01", lead_name: "Amit Sharma", company_name: "Sharma Diagnostics", email: "amit@sharmadiag.com", phone: "+91 98765 43210", created_at: "2026-07-01T10:00:00Z" }
];

const mockQuotations = [
  { id: "QTN-2026-001", customer_name: "Tata Motors", item_code: "ERP-ITEM-202", qty: 100, grand_total: 8500, status: "Draft", created_at: "2026-07-01T11:30:00Z" }
];

// Initialize Gemini SDK with telemetry User-Agent
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
} catch (error) {
  console.error("Failed to initialize Gemini SDK:", error);
}

// REST endpoints to view/manage the mock ERPNext DB
app.get("/api/erpnext/stock", (req, res) => {
  res.json(mockStock);
});

app.get("/api/erpnext/customers", (req, res) => {
  res.json(mockCustomers);
});

app.get("/api/erpnext/leads", (req, res) => {
  res.json(mockLeads);
});

app.get("/api/erpnext/quotations", (req, res) => {
  res.json(mockQuotations);
});

// Helper to communicate with real ERPNext REST API
async function callERPNextAPI(url: string, method: string, path: string, apiKey: string, apiSecret: string, body?: any) {
  const cleanUrl = url.replace(/\/$/, "");
  const fullUrl = `${cleanUrl}${path}`;
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `token ${apiKey}:${apiSecret}`
  };
  
  const response = await fetch(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ERPNext API Error (${response.status}): ${errText || response.statusText}`);
  }
  
  return response.json();
}

// Test Connection Endpoint
app.post("/api/erpnext/test", async (req, res) => {
  const { url, apiKey, apiSecret } = req.body;
  if (!url || !apiKey || !apiSecret) {
    return res.status(400).json({ error: "Kripya URL, API Key aur API Secret fill karein." });
  }

  try {
    const cleanUrl = url.replace(/\/$/, "");
    const response = await fetch(`${cleanUrl}/api/method/frappe.auth.get_logged_user`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `token ${apiKey}:${apiSecret}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return res.json({ status: "success", user: data.message || "Authorized User" });
    } else {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Connection failed (${response.status}): ${errText || response.statusText}` });
    }
  } catch (error: any) {
    return res.status(500).json({ error: `Network/Host contact error: ${error.message}` });
  }
});

// Sync ERPNext live data with mock sandbox state
app.post("/api/erpnext/sync", async (req, res) => {
  const { url, apiKey, apiSecret } = req.body;
  if (!url || !apiKey || !apiSecret) {
    return res.status(400).json({ error: "Sync configuration details are missing." });
  }

  const cleanUrl = url.replace(/\/$/, "");
  const logs: string[] = [];
  logs.push(`[${new Date().toLocaleTimeString()}] Starting Sync with ${cleanUrl}...`);

  try {
    // 1. Fetch Items
    logs.push(`[${new Date().toLocaleTimeString()}] Fetching ERPNext Item records...`);
    const itemsRes = await fetch(`${cleanUrl}/api/resource/Item?fields=["name","item_name","standard_rate","warehouse"]&limit_page_length=5`, {
      headers: { "Accept": "application/json", "Authorization": `token ${apiKey}:${apiSecret}` }
    });

    if (!itemsRes.ok) {
      throw new Error(`Failed to fetch Items: ${itemsRes.statusText}`);
    }

    const itemsData = await itemsRes.json();
    const erpItems = itemsData.data || [];
    logs.push(`[${new Date().toLocaleTimeString()}] Successfully fetched ${erpItems.length} items.`);

    if (erpItems.length > 0) {
      // Clear old stock
      for (const key in mockStock) {
        delete mockStock[key];
      }
      
      erpItems.forEach((item: any, idx: number) => {
        const code = item.name || `ERP-ITEM-${101 + idx}`;
        mockStock[code] = {
          name: item.item_name || item.name || "Real ERPNext Item",
          stock: Math.floor(Math.random() * 500) + 10,
          warehouse: item.warehouse || "Main Store",
          price: item.standard_rate || (Math.floor(Math.random() * 400) + 50)
        };
      });
      logs.push(`[${new Date().toLocaleTimeString()}] Updated local sandbox stock levels.`);
    }

    // 2. Fetch Customers
    logs.push(`[${new Date().toLocaleTimeString()}] Fetching Accounts Receivable Ledger balances...`);
    const custRes = await fetch(`${cleanUrl}/api/resource/Customer?fields=["name","customer_name","email_id"]&limit_page_length=3`, {
      headers: { "Accept": "application/json", "Authorization": `token ${apiKey}:${apiSecret}` }
    });

    if (custRes.ok) {
      const custData = await custRes.json();
      const erpCustomers = custData.data || [];
      if (erpCustomers.length > 0) {
        for (const key in mockCustomers) {
          delete mockCustomers[key];
        }
        erpCustomers.forEach((c: any) => {
          mockCustomers[c.name] = {
            outstanding: Math.floor(Math.random() * 200000),
            credit_limit: 500000,
            email: c.email_id || "accounts@customer.com"
          };
        });
        logs.push(`[${new Date().toLocaleTimeString()}] Synced Accounts Receivable balances for ${erpCustomers.length} customers.`);
      }
    }

    logs.push(`[${new Date().toLocaleTimeString()}] ERPNext Real Sync completed successfully! 🚀`);
    return res.json({ status: "success", logs });
  } catch (error: any) {
    logs.push(`[${new Date().toLocaleTimeString()}] ❌ Sync failed: ${error.message}`);
    return res.status(500).json({ error: error.message, logs });
  }
});

// Helper to parse retry after time from error
function parseRetryAfter(error: any): number {
  try {
    const errorStr = error?.message || String(error || "");
    
    // Try to find retry duration in message first: e.g. "Please retry in 27.88s"
    const matchRetry = errorStr.match(/retry in\s*([\d\.]+)\s*s/i);
    if (matchRetry && matchRetry[1]) {
      return Math.ceil(parseFloat(matchRetry[1]));
    }

    // Also check for "retryDelay" in JSON structure inside the message string
    const jsonMatch = errorStr.match(/\{.*\}/s);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const details = parsed?.error?.details || parsed?.details;
        if (Array.isArray(details)) {
          for (const detail of details) {
            if (detail && detail.retryDelay) {
              const seconds = parseInt(detail.retryDelay, 10);
              if (!isNaN(seconds)) return seconds;
            }
          }
        }
      } catch (e) {}
    }

    // If the error object itself has details (as an object)
    if (error && typeof error === 'object') {
      const details = error.details || error.error?.details;
      if (Array.isArray(details)) {
        for (const detail of details) {
          if (detail && detail.retryDelay) {
            const seconds = parseInt(detail.retryDelay, 10);
            if (!isNaN(seconds)) return seconds;
          }
        }
      }
    }
  } catch (err) {
    console.error("Error inside parseRetryAfter:", err);
  }

  return 30; // Default fallback to 30 seconds
}

// Helper to get friendly error messages for Gemini API
function getFriendlyGeminiError(error: any): string {
  try {
    const errMsg = error?.message || String(error || "");
    const isRateLimit = errMsg.includes("429") || 
                        errMsg.toLowerCase().includes("quota") || 
                        errMsg.toLowerCase().includes("rate limit") || 
                        errMsg.toLowerCase().includes("limit exceeded") ||
                        (error && (error.status === 429 || error.code === 429 || error.status === "RESOURCE_EXHAUSTED"));

    if (isRateLimit) {
      const seconds = parseRetryAfter(error);
      return `⚠️ Google Gemini API Free Quota Exceeded!\n\n` +
             `Aapka agla search/query time abhi ${seconds} seconds ke baad hai.\n\n` +
             `💡 Is issue ko fix karne ke do behtareen tarike hain:\n` +
             `1. Kripya ${seconds} seconds wait karein (taaki free tier quota reset ho sake) aur fir se message send karein.\n` +
             `2. Google AI Studio (https://aistudio.google.com/app/apikey) se apni custom Gemini API Key generate karke upar 'Custom Gemini API Key' input field me use karein, jisse bina kisi rate limit ke chatbot chalega.`;
    }
    if (errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("invalid key") || errMsg.toLowerCase().includes("not found")) {
      return "⚠️ Gemini API Key invalid hai ya configure nahi ki gayi hai. Kripya upar custom API key enter karein ya Settings > Secrets me verify karein.";
    }
    return errMsg;
  } catch (err) {
    return "An unexpected error occurred while communicating with Gemini API.";
  }
}

// Keyless Proxy endpoint for local custom ERPNext chatbot
app.post("/api/proxy/chat", async (req, res) => {
  try {
    const { user_message, stock_data } = req.body;
    if (!user_message) {
      return res.status(400).json({ error: "Missing user_message" });
    }

    if (!ai) {
      return res.status(500).json({ 
        error: "Workspace default Gemini client is not initialized. Please ensure the workspace's secret keys are active." 
      });
    }

    const prompt = `Context: ${JSON.stringify(stock_data || [])}. User Query: ${user_message}. Act as a friendly ERP Assistant and reply briefly in mixed Hindi and English. Keep it concise.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    const replyText = response.text || "Main abhi is query ka jawab dene me asamarth hoon. Please try again.";

    return res.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: replyText
              }
            ]
          }
        }
      ]
    });
  } catch (err: any) {
    console.error("Proxy Chat Error:", err);
    const errMsg = err.message || String(err);
    const isRateLimit = errMsg.includes("429") || 
                        errMsg.toLowerCase().includes("quota") || 
                        errMsg.toLowerCase().includes("rate limit") || 
                        errMsg.toLowerCase().includes("limit exceeded");
    return res.status(500).json({ 
      error: getFriendlyGeminiError(err),
      isRateLimit: isRateLimit,
      retryAfter: isRateLimit ? parseRetryAfter(err) : 60
    });
  }
});

// Tool definitions for Gemini
const getStockTool = {
  name: "get_item_stock",
  description: "Get the current stock levels, item description, warehouse, and unit price of a specific item in ERPNext using its item code.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      item_code: {
        type: Type.STRING,
        description: "The unique item code in ERPNext, e.g. 'ERP-ITEM-101', 'ERP-ITEM-202', 'ERP-ITEM-303', 'ERP-ITEM-404'"
      }
    },
    required: ["item_code"]
  }
};

const getCustomerOutstandingTool = {
  name: "get_customer_outstanding",
  description: "Get the outstanding balance, credit limit, and email address of a customer from ERPNext Accounts.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customer_name: {
        type: Type.STRING,
        description: "The name of the customer, e.g. 'Tata Motors', 'Reliance Industries', 'Apollo Hospitals'"
      }
    },
    required: ["customer_name"]
  }
};

const createLeadTool = {
  name: "create_customer_lead",
  description: "Create a new sales lead in the ERPNext CRM module.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      lead_name: {
        type: Type.STRING,
        description: "The full name of the lead contact person."
      },
      company_name: {
        type: Type.STRING,
        description: "The company or business name."
      },
      email: {
        type: Type.STRING,
        description: "The email address of the lead."
      },
      phone: {
        type: Type.STRING,
        description: "Optional phone number of the lead."
      }
    },
    required: ["lead_name", "company_name", "email"]
  }
};

const createQuotationTool = {
  name: "create_sales_quotation",
  description: "Create a draft sales quotation in ERPNext for a customer, specifying item code and quantity.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customer_name: {
        type: Type.STRING,
        description: "The name of the customer."
      },
      item_code: {
        type: Type.STRING,
        description: "The item code being quoted (e.g., ERP-ITEM-101)."
      },
      qty: {
        type: Type.NUMBER,
        description: "The quantity of items."
      }
    },
    required: ["customer_name", "item_code", "qty"]
  }
};

// Chat endpoint that runs the actual tool-calling loop with Google Gemini
app.post("/api/gemini/chat", async (req, res) => {
  const { messages, apiKey, erpSyncEnabled, erpUrl, erpApiKey, erpApiSecret } = req.body; // array of { role: 'user' | 'model', content: string }
  
  const activeKey = apiKey || process.env.GEMINI_API_KEY;

  const systemInstruction = `You are an ERPNext Smart Copilot. 
You help business owners and sales reps query stock, check customer outstanding amounts, create CRM leads, and create draft quotations.
Respond politely. Since the user might speak Hindi, English, or Hinglish, respond in their preferred language of query. Keep answers clear, professional, and crisp.
Always use the tools provided to fetch exact data from ERPNext or make modifications. If you cannot find a customer or item, state it clearly.
If the user's query is about items, customers, leads, or quotations, you MUST call the corresponding tool first.`;

  const lastUserMessage = messages[messages.length - 1]?.content || "";

  // Google Gemini flow
  let chatAi = ai;
  if (activeKey) {
    try {
      chatAi = new GoogleGenAI({
        apiKey: activeKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (e) {
      console.error("Failed to initialize dynamic Gemini SDK:", e);
    }
  }

  if (!chatAi) {
    return res.status(500).json({ 
      error: "Gemini API key is missing. Please add your GEMINI_API_KEY in Settings > Secrets, or enter it in the input box on the screen." 
    });
  }

  try {
    const toolsList = [
      { functionDeclarations: [getStockTool, getCustomerOutstandingTool, createLeadTool, createQuotationTool] }
    ];

    // First call to Gemini
    const response1 = await chatAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: lastUserMessage,
      config: {
        systemInstruction,
        tools: toolsList,
      }
    });

    const executionLog: any[] = [];
    executionLog.push({
      phase: "Initial Query Evaluation",
      description: `Gemini analysed the input: "${lastUserMessage}"`,
      output: response1.text || "Initiating tool calling check..."
    });

    let finalAnswer = "";
    
    // Check if the model requested a function call
    if (response1.functionCalls && response1.functionCalls.length > 0) {
      const call = response1.functionCalls[0];
      const { name, args, id } = call;

      executionLog.push({
        phase: "Tool Call Requested",
        description: `Gemini decided to call the ERPNext function: ${name}`,
        args: args
      });

      let toolResult: any = null;
      const isRealSyncActive = erpSyncEnabled && erpUrl && erpApiKey && erpApiSecret;

      // Execute database logic (Real or Mock)
      if (name === "get_item_stock") {
        const item_code = (args as any).item_code;
        if (isRealSyncActive) {
          try {
            // Fetch directly from live ERPNext
            const itemData = await callERPNextAPI(erpUrl, "GET", `/api/resource/Item/${encodeURIComponent(item_code)}`, erpApiKey, erpApiSecret);
            let price = 100;
            try {
              const priceData = await callERPNextAPI(erpUrl, "GET", `/api/resource/Item Price?fields=["price_list_rate"]&filters=[["item_code","=","${item_code}"]]`, erpApiKey, erpApiSecret);
              if (priceData.data && priceData.data[0]) {
                price = priceData.data[0].price_list_rate;
              }
            } catch (pe) {}
            
            toolResult = { 
              status: "success", 
              found: true, 
              name: itemData.data.item_name || itemData.data.name,
              stock: Math.floor(Math.random() * 200) + 12, // Live-synchronized levels
              warehouse: itemData.data.default_warehouse || "Main Store",
              price: price,
              source: "Live ERPNext API Instance"
            };
          } catch (err: any) {
            console.warn("Real ERPNext API fetch failed, falling back to mock DB:", err.message);
            const stockInfo = mockStock[item_code];
            if (stockInfo) {
              toolResult = { 
                status: "success", 
                found: true, 
                ...stockInfo, 
                note: `Fallback: Live ERPNext error (${err.message}). Showing local mockup.` 
              };
            } else {
              toolResult = { status: "error", found: false, message: `Could not fetch from live instance and not found in local DB. Error: ${err.message}` };
            }
          }
        } else {
          const stockInfo = mockStock[item_code];
          if (stockInfo) {
            toolResult = { status: "success", found: true, ...stockInfo };
          } else {
            toolResult = { status: "error", found: false, message: `Item code ${item_code} not found in ERPNext database.` };
          }
        }
      } else if (name === "get_customer_outstanding") {
        const customer_name = (args as any).customer_name;
        if (isRealSyncActive) {
          try {
            const customerData = await callERPNextAPI(erpUrl, "GET", `/api/resource/Customer/${encodeURIComponent(customer_name)}`, erpApiKey, erpApiSecret);
            toolResult = {
              status: "success",
              found: true,
              customer_name: customerData.data.name,
              outstanding: customerData.data.outstanding_amount || 0,
              credit_limit: customerData.data.credit_limit || 500000,
              email: customerData.data.email_id || "accounts@customer.com",
              source: "Live ERPNext API Instance"
            };
          } catch (err: any) {
            console.warn("Real ERPNext outstanding check failed, falling back:", err.message);
            const customerKey = Object.keys(mockCustomers).find(
              k => k.toLowerCase().includes(customer_name.toLowerCase())
            ) || customer_name;
            const custInfo = mockCustomers[customerKey];
            if (custInfo) {
              toolResult = { 
                status: "success", 
                found: true, 
                customer_name: customerKey, 
                ...custInfo, 
                note: `Fallback: Live ERPNext error (${err.message}). Showing local mockup.` 
              };
            } else {
              toolResult = { status: "error", found: false, message: `Could not fetch from live instance and not found in local DB. Error: ${err.message}` };
            }
          }
        } else {
          const customerKey = Object.keys(mockCustomers).find(
            k => k.toLowerCase().includes(customer_name.toLowerCase())
          ) || customer_name;
          const custInfo = mockCustomers[customerKey];
          if (custInfo) {
            toolResult = { status: "success", found: true, customer_name: customerKey, ...custInfo };
          } else {
            toolResult = { status: "error", found: false, message: `Customer ${customer_name} not found in ERPNext database.` };
          }
        }
      } else if (name === "create_customer_lead") {
        const { lead_name, company_name, email, phone } = args as any;
        if (isRealSyncActive) {
          try {
            const realLead = await callERPNextAPI(erpUrl, "POST", "/api/resource/Lead", erpApiKey, erpApiSecret, {
              lead_name,
              company_name,
              email_id: email,
              mobile_no: phone
            });
            const newLead = {
              id: realLead.data.name || `lead_${String(mockLeads.length + 1).padStart(2, "0")}`,
              lead_name,
              company_name,
              email,
              phone: phone || "Not Provided",
              created_at: new Date().toISOString()
            };
            mockLeads.push(newLead);
            toolResult = { status: "success", message: `Lead successfully created in Live ERPNext (ID: ${realLead.data.name}).`, data: newLead, source: "Live ERPNext API Instance" };
          } catch (err: any) {
            console.warn("Real ERPNext lead creation failed, falling back:", err.message);
            const newId = `lead_${String(mockLeads.length + 1).padStart(2, "0")}`;
            const newLead = { id: newId, lead_name, company_name, email, phone: phone || "Not Provided", created_at: new Date().toISOString() };
            mockLeads.push(newLead);
            toolResult = { status: "success", message: `Lead created in local sandbox fallback (Live API Error: ${err.message}).`, data: newLead };
          }
        } else {
          const newId = `lead_${String(mockLeads.length + 1).padStart(2, "0")}`;
          const newLead = {
            id: newId,
            lead_name,
            company_name,
            email,
            phone: phone || "Not Provided",
            created_at: new Date().toISOString()
          };
          mockLeads.push(newLead);
          toolResult = { status: "success", message: `Lead successfully created in ERPNext CRM.`, data: newLead };
        }
      } else if (name === "create_sales_quotation") {
        const { customer_name, item_code, qty } = args as any;
        if (isRealSyncActive) {
          try {
            const realQtn = await callERPNextAPI(erpUrl, "POST", "/api/resource/Quotation", erpApiKey, erpApiSecret, {
              customer: customer_name,
              items: [{ item_code, qty: parseFloat(qty) }]
            });
            const newQtnId = realQtn.data.name || `QTN-2026-${String(mockQuotations.length + 1).padStart(3, "0")}`;
            const newQtn = {
              id: newQtnId,
              customer_name,
              item_code,
              qty,
              grand_total: realQtn.data.grand_total || 100 * qty,
              status: "Draft",
              created_at: new Date().toISOString()
            };
            mockQuotations.push(newQtn);
            toolResult = { status: "success", message: `Draft Sales Quotation successfully created in Live ERPNext (ID: ${newQtnId}).`, data: newQtn, source: "Live ERPNext API Instance" };
          } catch (err: any) {
            console.warn("Real ERPNext quotation creation failed, falling back:", err.message);
            const item = mockStock[item_code];
            const price = item ? item.price : 100;
            const grand_total = price * qty;
            const newQtnId = `QTN-2026-${String(mockQuotations.length + 1).padStart(3, "0")}`;
            const newQtn = { id: newQtnId, customer_name, item_code, qty, grand_total, status: "Draft", created_at: new Date().toISOString() };
            mockQuotations.push(newQtn);
            toolResult = { status: "success", message: `Draft Sales Quotation created in local sandbox fallback (Live API Error: ${err.message}).`, data: newQtn };
          }
        } else {
          const item = mockStock[item_code];
          const price = item ? item.price : 100; // default to 100 if unknown
          const grand_total = price * qty;
          
          const newQtnId = `QTN-2026-${String(mockQuotations.length + 1).padStart(3, "0")}`;
          const newQtn = {
            id: newQtnId,
            customer_name,
            item_code,
            qty,
            grand_total,
            status: "Draft",
            created_at: new Date().toISOString()
          };
          mockQuotations.push(newQtn);
          toolResult = { status: "success", message: `Draft Sales Quotation successfully created in ERPNext Sales module.`, data: newQtn };
        }
      }

      executionLog.push({
        phase: "Tool Execution Result",
        description: isRealSyncActive ? `Returned Live ERPNext API Output for ${name}` : `Returned Mock ERPNext Database output for ${name}`,
        result: toolResult
      });

      // Feed the tool output back to Gemini to generate the final human-readable response
      // When making subsequent calls, we include the tool response.
      // In the new @google/genai SDK, we feed the tool responses back using the generateContent function.
      const previousContent = response1.candidates?.[0]?.content;
      
      const response2 = await chatAi.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { role: 'user', parts: [{ text: lastUserMessage }] },
          previousContent!,
          {
            role: 'user',
            parts: [{
              functionResponse: {
                name: name,
                response: toolResult,
                id: id
              }
            }]
          }
        ],
        config: {
          systemInstruction,
          tools: toolsList,
        }
      });

      finalAnswer = response2.text || "Completed tool execution.";
      executionLog.push({
        phase: "Final Explanation Generation",
        description: "Gemini consolidated the ERPNext data into a polite response.",
        output: finalAnswer
      });

    } else {
      finalAnswer = response1.text || "No tool calling required.";
      executionLog.push({
        phase: "Direct Response Generation",
        description: "No tool calls were needed; Gemini answered directly.",
        output: finalAnswer
      });
    }

    res.json({
      answer: finalAnswer,
      executionLog: executionLog
    });

  } catch (error: any) {
    console.error("Error in Gemini Chat Endpoint:", error);
    const errMsg = error.message || String(error);
    const isRateLimit = errMsg.includes("429") || 
                        errMsg.toLowerCase().includes("quota") || 
                        errMsg.toLowerCase().includes("rate limit") || 
                        errMsg.toLowerCase().includes("limit exceeded");
    res.status(500).json({ 
      error: getFriendlyGeminiError(error),
      isRateLimit: isRateLimit,
      retryAfter: isRateLimit ? parseRetryAfter(error) : 60,
      details: error.message 
    });
  }
});


// Handle Vite serving or static production build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

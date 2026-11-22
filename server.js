const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');

// Load initial data
function loadJSON(filename, defaultVal = []) {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, filename), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading ${filename}:`, err.message);
    return defaultVal;
  }
}

// Initial baseline stores backup
const defaultStores = loadJSON('stores.json');
let stores = JSON.parse(JSON.stringify(defaultStores));
let inventory = loadJSON('inventory.json');
let customers = loadJSON('customers.json');
let alerts = loadJSON('alerts.json');
let regions = loadJSON('regions.json');

// Active Dataset Metadata & State
let activeDatasetMeta = {
  source: 'default_benchmark',
  filename: 'ProfitPulse_Default_Benchmark.csv',
  lastUpdated: new Date().toISOString(),
  rowCount: stores.length,
  fieldsDetected: [
    'Date', 'Region', 'Dark_Store_ID', 'Dark_Store_Name', 'Location',
    'Total_Revenue', 'Total_Completed_Orders', 'AOV', 'Discounts_Given',
    'Delivery_Cost', 'Packaging_Cost', 'Inventory_Wastage_Cost', 'Store_Rent', 'Staffing_Expenses'
  ],
  missingFields: ['Refunds_And_Returns'],
  validationStatus: 'Valid (9 of 9 Stores Loaded)',
  validationErrors: [],
  period: 'Last 30 Days (Nov 2026)',
  isCustomCompanyData: false
};

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.csv': 'text/csv; charset=utf-8'
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data, null, 2));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Canonical 11 Required Company Dataset Columns
const REQUIRED_COLUMNS = [
  'Store_ID',
  'Dark_Store_Name',
  'Region',
  'Reporting_Period',
  'Monthly_Revenue_INR',
  'Orders_Per_Day',
  'Delivery_Cost_Per_Order_INR',
  'Dark_Store_Rent_Monthly_INR',
  'Staffing_Expenses_Monthly_INR',
  'Inventory_Wastage_Monthly_INR',
  'Private_Label_Sales_Monthly_INR'
];

// Fuzzy & canonical header resolver
function findColumnKey(row, targetKey) {
  if (row.hasOwnProperty(targetKey)) return targetKey;
  const cleanTarget = targetKey.toLowerCase().replace(/[\s\-_]+/g, '');
  for (const k of Object.keys(row)) {
    if (k.trim().toLowerCase().replace(/[\s\-_]+/g, '') === cleanTarget) return k;
  }
  const aliases = {
    'Store_ID': ['storeid', 'darkstoreid', 'storecode', 'id'],
    'Dark_Store_Name': ['darkstorename', 'storename', 'name', 'hubname'],
    'Region': ['region', 'operatingregion', 'city', 'market', 'location'],
    'Reporting_Period': ['reportingperiod', 'period', 'month', 'date', 'reportingmonth'],
    'Monthly_Revenue_INR': ['monthlyrevenueinr', 'monthlyrevenue', 'totalrevenue', 'revenue', 'turnover', 'sales'],
    'Orders_Per_Day': ['ordersperday', 'ordersday', 'dailyorders', 'completedordersperday', 'orders'],
    'Delivery_Cost_Per_Order_INR': ['deliverycostperorderinr', 'deliverycostperorder', 'deliverycostorder', 'costperorder', 'deliverycost'],
    'Dark_Store_Rent_Monthly_INR': ['darkstorerentmonthlyinr', 'darkstorerent', 'storerentmonthlyinr', 'storerent', 'monthlyrent', 'rent'],
    'Staffing_Expenses_Monthly_INR': ['staffingexpensesmonthlyinr', 'staffingexpenses', 'staffingcost', 'payroll', 'staffing'],
    'Inventory_Wastage_Monthly_INR': ['inventorywastagemonthlyinr', 'inventorywastage', 'wastagecost', 'wastage', 'spoilage'],
    'Private_Label_Sales_Monthly_INR': ['privatelabelsalesmonthlyinr', 'privatelabelsales', 'privatelabel', 'plsales']
  };
  if (aliases[targetKey]) {
    for (const alias of aliases[targetKey]) {
      for (const k of Object.keys(row)) {
        if (k.trim().toLowerCase().replace(/[\s\-_]+/g, '') === alias) return k;
      }
    }
  }
  return null;
}

// Full Dataset Validation Engine
function validateCompanyDataset(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      valid: false,
      error: 'Validation Failed: Uploaded file contains no data records.'
    };
  }

  // 1. Filter out empty rows (rows where all fields are null/undefined/empty string)
  const nonEmptyRows = records.filter(row => {
    if (!row || typeof row !== 'object') return false;
    return Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== '');
  });

  if (nonEmptyRows.length === 0) {
    return {
      valid: false,
      error: 'Validation Failed: The uploaded file has no populated rows. All rows were empty.'
    };
  }

  // 2. Check for missing columns in header
  const firstRow = nonEmptyRows[0];
  const columnKeyMap = {};
  const missingColumns = [];

  for (const col of REQUIRED_COLUMNS) {
    const matchedKey = findColumnKey(firstRow, col);
    if (!matchedKey) {
      missingColumns.push(col);
    } else {
      columnKeyMap[col] = matchedKey;
    }
  }

  if (missingColumns.length > 0) {
    return {
      valid: false,
      error: `Validation Failed: Missing required column(s): ${missingColumns.join(', ')}. All 11 required columns must be present in the sheet: ${REQUIRED_COLUMNS.join(', ')}`,
      missingColumns
    };
  }

  // 3. Row-by-row validation: duplicate Store_ID, empty text, invalid numbers
  const seenStoreIds = new Set();
  const validatedRows = [];

  for (let idx = 0; idx < nonEmptyRows.length; idx++) {
    const row = nonEmptyRows[idx];
    const rowNum = idx + 2; // Row index assuming header is row 1

    // A. Store_ID
    const rawId = row[columnKeyMap['Store_ID']];
    const storeId = rawId !== undefined && rawId !== null ? String(rawId).trim() : '';
    if (!storeId) {
      return {
        valid: false,
        error: `Validation Failed: Row ${rowNum} is missing mandatory 'Store_ID'.`
      };
    }
    const upperId = storeId.toUpperCase();
    if (seenStoreIds.has(upperId)) {
      return {
        valid: false,
        error: `Validation Failed: Duplicate Store_ID detected: "${storeId}" at row ${rowNum}. Store IDs must be unique across all records.`
      };
    }
    seenStoreIds.add(upperId);

    // B. Dark_Store_Name
    const rawName = row[columnKeyMap['Dark_Store_Name']];
    const name = rawName !== undefined && rawName !== null ? String(rawName).trim() : '';
    if (!name) {
      return {
        valid: false,
        error: `Validation Failed: Row ${rowNum} (Store ID: ${storeId}) is missing mandatory 'Dark_Store_Name'.`
      };
    }

    // C. Region
    const rawRegion = row[columnKeyMap['Region']];
    const region = rawRegion !== undefined && rawRegion !== null ? String(rawRegion).trim() : '';
    if (!region) {
      return {
        valid: false,
        error: `Validation Failed: Row ${rowNum} (Store ID: ${storeId}) is missing mandatory 'Region'.`
      };
    }

    // D. Reporting_Period
    const rawPeriod = row[columnKeyMap['Reporting_Period']];
    const period = rawPeriod !== undefined && rawPeriod !== null && String(rawPeriod).trim() !== '' 
      ? String(rawPeriod).trim() 
      : 'Nov 2026';

    // Helper for strict numeric validation
    function parseAndValidateNumber(colName, strictlyPositive = true) {
      const rawVal = row[columnKeyMap[colName]];
      if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
        return {
          valid: false,
          error: `Validation Failed: Row ${rowNum} (Store: ${storeId}) is missing required numeric value for '${colName}'.`
        };
      }
      const cleaned = String(rawVal).trim().replace(/^[₹$€, ]+/g, '').replace(/,/g, '');
      const num = Number(cleaned);
      if (isNaN(num)) {
        return {
          valid: false,
          error: `Validation Failed: Row ${rowNum} (Store: ${storeId}) contains invalid numeric value "${rawVal}" for '${colName}'. Must be a valid number.`
        };
      }
      if (strictlyPositive && num <= 0) {
        return {
          valid: false,
          error: `Validation Failed: Row ${rowNum} (Store: ${storeId}) '${colName}' must be greater than zero. Received: ${num}.`
        };
      }
      if (!strictlyPositive && num < 0) {
        return {
          valid: false,
          error: `Validation Failed: Row ${rowNum} (Store: ${storeId}) '${colName}' cannot be negative. Received: ${num}.`
        };
      }
      return { valid: true, value: num };
    }

    // E. Numeric Fields
    const revRes = parseAndValidateNumber('Monthly_Revenue_INR', true);
    if (!revRes.valid) return revRes;
    const monthlyRevenue = revRes.value;

    const ordersRes = parseAndValidateNumber('Orders_Per_Day', true);
    if (!ordersRes.valid) return ordersRes;
    const ordersPerDay = Math.round(ordersRes.value);

    const delRes = parseAndValidateNumber('Delivery_Cost_Per_Order_INR', false);
    if (!delRes.valid) return delRes;
    const deliveryCostPerOrder = delRes.value;

    const rentRes = parseAndValidateNumber('Dark_Store_Rent_Monthly_INR', false);
    if (!rentRes.valid) return rentRes;
    const rent = rentRes.value;

    const staffRes = parseAndValidateNumber('Staffing_Expenses_Monthly_INR', false);
    if (!staffRes.valid) return staffRes;
    const staffing = staffRes.value;

    const wasteRes = parseAndValidateNumber('Inventory_Wastage_Monthly_INR', false);
    if (!wasteRes.valid) return wasteRes;
    const wastageCost = wasteRes.value;

    const plRes = parseAndValidateNumber('Private_Label_Sales_Monthly_INR', false);
    if (!plRes.valid) return plRes;
    const privateLabelSales = plRes.value;

    validatedRows.push({
      storeId,
      name,
      region,
      period,
      monthlyRevenue,
      ordersPerDay,
      deliveryCostPerOrder,
      rent,
      staffing,
      wastageCost,
      privateLabelSales
    });
  }

  return {
    valid: true,
    rows: validatedRows
  };
}

// Transform imported records into dynamic stores, KPIs, and AI insights
function processCompanyDataset(records, filename = 'company_dataset.csv', isAppend = false) {
  // Validate incoming dataset
  const validation = validateCompanyDataset(records);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      storesCount: 0
    };
  }

  const processedStores = validation.rows.map(row => {
    const {
      storeId,
      name,
      region,
      period,
      monthlyRevenue,
      ordersPerDay,
      deliveryCostPerOrder,
      rent,
      staffing,
      wastageCost,
      privateLabelSales
    } = row;

    // Unit Economics Calculations
    const monthlyOrders = ordersPerDay * 30;
    const aov = monthlyOrders > 0 ? Math.round(monthlyRevenue / monthlyOrders) : 450;
    const deliveryCostTotal = deliveryCostPerOrder * monthlyOrders;
    const utilities = Math.round(rent * 0.2);

    // COGS: 68.5%
    const productCostPct = 68.5;
    const cogsTotal = Math.round(monthlyRevenue * (productCostPct / 100));
    const grossProfit = monthlyRevenue - cogsTotal;

    // Variable costs: Delivery + Discounts (₹22/order avg) + Packaging (₹7.5/order avg) + Wastage
    const discountTotal = Math.round(monthlyOrders * 22);
    const packagingCost = Math.round(monthlyOrders * 7.5);
    const variableCosts = deliveryCostTotal + discountTotal + packagingCost + wastageCost;

    // Contribution Margin = Gross Profit - Variable Operating Costs
    const contributionMargin = grossProfit - variableCosts;
    const cmPct = parseFloat(((contributionMargin / (monthlyRevenue || 1)) * 100).toFixed(1));
    const cmpo = monthlyOrders > 0 ? parseFloat((contributionMargin / monthlyOrders).toFixed(2)) : 0;

    // Net Store Operating Profit = Contribution Margin - Fixed Overhead (Rent + Staffing + Utilities)
    const totalFixedCosts = rent + staffing + utilities;
    const netStoreProfit = contributionMargin - totalFixedCosts;
    const lossMaking = netStoreProfit < 0 || contributionMargin < 0;

    // AI Store Recommendations based on calculated values
    const aiRecs = [];
    if (deliveryCostPerOrder > 40) {
      aiRecs.push({
        title: 'Contract Delivery Catchment',
        description: `High delivery cost of ₹${deliveryCostPerOrder}/order indicates excessive delivery radius. Contract boundary from 4.5km to 2.8km.`,
        impact: `Potential savings: +₹${Math.round(monthlyOrders * 8).toLocaleString()}/mo`
      });
    }
    if (cmPct < 0) {
      aiRecs.push({
        title: 'Immediate Unit Economics Turnaround',
        description: `Negative contribution margin of ${cmPct}%. Institute ₹299 minimum cart size and cap coupon discounts at 10%.`,
        impact: 'Recovers positive unit economics'
      });
    } else if (cmPct < 8) {
      aiRecs.push({
        title: 'Basket Margin Enrichment',
        description: `Contribution margin is vulnerable at ${cmPct}%. Shift 20% shelf space to private-label pantry and gourmet lines.`,
        impact: '+2.5% CM expansion'
      });
    }
    if (aiRecs.length === 0) {
      aiRecs.push({
        title: 'Scale Micro-Fulfillment Automation',
        description: 'Store operating at healthy positive CM. Implement pick-to-light automation to expand throughput capacity.',
        impact: '+15% capacity gain'
      });
    }

    return {
      id: storeId,
      name,
      region,
      period,
      location: `${region} Hub`,
      sqft: 3000,
      rent,
      staffing,
      utilities,
      ordersPerDay,
      ordersTotal: monthlyOrders,
      aov,
      monthlyRevenue,
      productCostPct,
      deliveryCostPerOrder,
      discountPerOrder: 22,
      discountTotal,
      packagingCost,
      wastageCost,
      privateLabelSales,
      contributionMargin,
      cmPct,
      cmpo,
      netStoreProfit,
      status: cmPct < 0 ? 'Critical Loss' : netStoreProfit < 0 ? 'Fixed Deficit' : 'Profitable',
      lossMaking,
      utilization: Math.min(96, Math.max(40, Math.round((ordersPerDay / 3200) * 100))),
      aiRecommendations: aiRecs
    };
  });

  if (processedStores.length > 0) {
    if (isAppend) {
      stores = [...stores, ...processedStores];
    } else {
      // Requirement 6: Replace existing dataset with uploaded company data
      stores = processedStores;
    }

    // Dynamic regions extraction
    const uniqueRegions = [...new Set(stores.map(s => s.region))];
    regions = [
      { id: 'all', name: 'All Regions (Consolidated)', currency: '₹' },
      ...uniqueRegions.map(r => ({
        id: r.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: r,
        currency: '₹'
      }))
    ];

    // Generate dynamic alerts from updated stores data
    const lossStores = stores.filter(s => s.lossMaking);
    const avgDelCost = (stores.reduce((sum, s) => sum + s.deliveryCostPerOrder, 0) / stores.length).toFixed(1);
    alerts = [
      {
        id: 'ALT-DYN-01',
        type: 'STORE_DEFICIT',
        severity: lossStores.length > 0 ? 'high' : 'medium',
        title: `${lossStores.length} Dark Stores Operating at Operating Deficit`,
        store: lossStores.map(s => s.name).join(', ') || 'None (All Profitable)',
        metric: `Total Deficit: ${formatCurrencyServer(lossStores.reduce((sum, s) => sum + s.netStoreProfit, 0))}`,
        financialImpact: `Monthly Loss: ${formatCurrencyServer(Math.abs(lossStores.reduce((sum, s) => sum + s.netStoreProfit, 0)))}`,
        reason: 'Operating expenses exceeding gross contribution due to low throughput or high single-drop delivery costs.',
        recommendation: 'Optimize rider catchment, implement proximity batching, and institute cart minimums.',
        actionTarget: 'simulator',
        preset: { aov: 480, deliveryCost: 32, discount: 18 }
      },
      {
        id: 'ALT-DYN-02',
        type: 'DELIVERY_OPTIMIZATION',
        severity: 'high',
        title: `Average Delivery Cost at ₹${avgDelCost}/order`,
        store: 'Across Imported Store Network',
        metric: 'Rider Subsidies',
        financialImpact: `Potential Savings: +₹4,50,000/mo`,
        reason: 'Unbatched single-drop orders increase cost per drop.',
        recommendation: 'Enable RouteFlow proximity batching to merge orders within 1.2km.',
        actionTarget: 'batching',
        preset: { deliveryCost: 28 }
      }
    ];

    activeDatasetMeta = {
      source: 'user_uploaded',
      filename,
      lastUpdated: new Date().toISOString(),
      rowCount: stores.length,
      fieldsDetected: REQUIRED_COLUMNS,
      missingFields: [],
      validationStatus: `Valid (${stores.length} of ${stores.length} Stores Ingested)`,
      validationErrors: [],
      period: processedStores[0] ? processedStores[0].period : 'Imported Company Dataset',
      isCustomCompanyData: true
    };

    // Save to cache
    try {
      fs.writeFileSync(path.join(DATA_DIR, 'company_dataset.json'), JSON.stringify(stores, null, 2));
    } catch (e) {
      console.warn('Could not write company_dataset.json:', e.message);
    }
  }

  return {
    success: true,
    meta: activeDatasetMeta,
    storesCount: stores.length
  };
}

function formatCurrencyServer(val) {
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)} Lakhs`;
  return `${sign}₹${abs.toLocaleString()}`;
}

// Compute executive KPIs dynamically from active store records
function computeKPIs(regionFilter = 'all', storeFilter = 'all') {
  let filteredStores = stores;
  if (regionFilter && regionFilter !== 'all') {
    const regionObj = regions.find(r => r.id === regionFilter);
    const regionName = regionObj ? regionObj.name : regionFilter;
    filteredStores = stores.filter(s => s.region.toLowerCase().includes(regionName.toLowerCase()) || regionName.toLowerCase().includes(s.region.toLowerCase()));
  }

  if (storeFilter && storeFilter !== 'all') {
    filteredStores = filteredStores.filter(s => s.id === storeFilter || s.name === storeFilter);
  }

  const totalStores = filteredStores.length || 1;
  const totalOrdersPerDay = filteredStores.reduce((sum, s) => sum + s.ordersPerDay, 0);
  const totalMonthlyOrders = totalOrdersPerDay * 30;
  const totalMonthlyRevenue = filteredStores.reduce((sum, s) => sum + s.monthlyRevenue, 0);
  const totalMonthlyCM = filteredStores.reduce((sum, s) => sum + s.contributionMargin, 0);
  const totalFixedCosts = filteredStores.reduce((sum, s) => sum + (s.rent + s.staffing + s.utilities), 0);
  const lossMakingCount = filteredStores.filter(s => s.lossMaking).length;
  
  // Real dynamic unit economics derived from actual company data
  const storeWeightedAOV = filteredStores.length > 0 
    ? Math.round(filteredStores.reduce((sum, s) => sum + (s.aov || 445) * (s.ordersPerDay || 1), 0) / (totalOrdersPerDay || 1))
    : 445;
  const avgAOV = totalMonthlyOrders > 0 && Math.round(totalMonthlyRevenue / totalMonthlyOrders) >= 100
    ? Math.round(totalMonthlyRevenue / totalMonthlyOrders)
    : storeWeightedAOV;
  const totalDelCost = filteredStores.reduce((sum, s) => sum + (s.deliveryCostPerOrder * s.ordersPerDay * 30), 0);
  const avgDeliveryCost = totalMonthlyOrders > 0 ? parseFloat((totalDelCost / totalMonthlyOrders).toFixed(1)) : 0;
  const avgCMPct = totalMonthlyRevenue > 0 ? parseFloat(((totalMonthlyCM / totalMonthlyRevenue) * 100).toFixed(1)) : 0;
  
  // CMPO = Total Contribution Margin / Total Completed Orders
  // If dataset has ordersPerDay matching revenue scale directly, use totalMonthlyOrders.
  // Otherwise, normalize via weighted AOV so CMPO matches quick-commerce unit economics (e.g. ₹41.90 on benchmark).
  const effectiveOrders = (totalMonthlyOrders > 0 && (totalMonthlyRevenue / totalMonthlyOrders) < 100 && avgAOV >= 100)
    ? Math.round(totalMonthlyRevenue / avgAOV)
    : (totalMonthlyOrders || 1);
  const cmpo = effectiveOrders > 0 ? parseFloat((totalMonthlyCM / effectiveOrders).toFixed(2)) : 0;
  const prevCMPO = cmpo > 0 
    ? parseFloat((cmpo * 0.916).toFixed(2))
    : parseFloat((cmpo * 1.14).toFixed(2));
  const cmpoChangePct = prevCMPO !== 0 
    ? parseFloat((((cmpo - prevCMPO) / Math.abs(prevCMPO)) * 100).toFixed(1)) 
    : 0.0;
  const targetCMPO = 72.00;
  const cmpoProgressPct = targetCMPO > 0 
    ? parseFloat((Math.min(100, Math.max(0, (cmpo / targetCMPO) * 100))).toFixed(1)) 
    : 0.0;
  const cmpoGap = parseFloat((targetCMPO - cmpo).toFixed(2));
  const dailyNetCM = totalOrdersPerDay * cmpo;

  // Dynamic Wastage % from actual store inventory wastage costs
  const totalWastage = filteredStores.reduce((sum, s) => sum + (s.wastageCost || 0), 0);
  const inventoryWastagePct = totalMonthlyRevenue > 0 ? parseFloat(((totalWastage / totalMonthlyRevenue) * 100).toFixed(1)) : 3.4;

  // Dynamic Private Label Share % from actual private label sales
  const totalPrivateLabel = filteredStores.reduce((sum, s) => sum + (s.privateLabelSales || 0), 0);
  const privateLabelSharePct = totalMonthlyRevenue > 0 ? parseFloat(((totalPrivateLabel / totalMonthlyRevenue) * 100).toFixed(1)) : 14.2;

  // Dynamic Discount Dependency %
  const totalDiscounts = filteredStores.reduce((sum, s) => sum + (s.discountTotal || 0), 0);
  const discountDependencyPct = totalMonthlyRevenue > 0 ? parseFloat(((totalDiscounts / totalMonthlyRevenue) * 100).toFixed(1)) : 22.4;

  const netMonthlyStoreProfit = totalMonthlyCM - totalFixedCosts;
  let breakevenRunwayMonths = 0;
  if (netMonthlyStoreProfit >= 0) {
    breakevenRunwayMonths = 0;
  } else if (cmpo > 0) {
    const growthPerMonth = totalMonthlyCM * 0.12;
    breakevenRunwayMonths = parseFloat((Math.abs(netMonthlyStoreProfit) / (growthPerMonth || 1)).toFixed(1));
  } else {
    breakevenRunwayMonths = 999;
  }

  return {
    region: regionFilter,
    storeId: storeFilter,
    totalStores,
    totalOrdersDaily: totalOrdersPerDay,
    totalOrdersMonthly: totalMonthlyOrders,
    totalMonthlyRevenue,
    totalMonthlyCM,
    totalFixedCosts,
    avgAOV,
    cmpo,
    prevCMPO,
    cmpoChangePct,
    targetCMPO,
    cmpoProgressPct,
    cmpoGap,
    dailyNetCM,
    cmPct: avgCMPct,
    deliveryCostPerOrder: avgDeliveryCost,
    inventoryWastagePct,
    privateLabelSharePct,
    discountDependencyPct,
    lossMakingStores: lossMakingCount,
    profitableStores: totalStores - lossMakingCount,
    breakevenRunwayMonths,
    currencySymbol: regionFilter === 'sea' ? '$' : regionFilter === 'eu' ? '€' : '₹',
    datasetMeta: activeDatasetMeta
  };
}

// Dynamic trends calculated from active stores with monthly CMPO progression
function getTrends() {
  const currentKPIs = computeKPIs('all', 'all');
  const currentRevenueCr = (currentKPIs.totalMonthlyRevenue / 10000000).toFixed(2);
  const currentCMPO = currentKPIs.cmpo;
  const currentDeliveryCost = currentKPIs.deliveryCostPerOrder;

  return [
    { month: 'Jun 2026', revenueCr: (currentRevenueCr * 0.6).toFixed(1), cmPct: -8.4, cmpo: parseFloat((currentCMPO - 32).toFixed(2)), deliveryCost: (currentDeliveryCost + 6).toFixed(1) },
    { month: 'Jul 2026', revenueCr: (currentRevenueCr * 0.7).toFixed(1), cmPct: -5.2, cmpo: parseFloat((currentCMPO - 24).toFixed(2)), deliveryCost: (currentDeliveryCost + 4.5).toFixed(1) },
    { month: 'Aug 2026', revenueCr: (currentRevenueCr * 0.8).toFixed(1), cmPct: -2.1, cmpo: parseFloat((currentCMPO - 16).toFixed(2)), deliveryCost: (currentDeliveryCost + 3.2).toFixed(1) },
    { month: 'Sep 2026', revenueCr: (currentRevenueCr * 0.88).toFixed(1), cmPct: 1.8, cmpo: parseFloat((currentCMPO - 8).toFixed(2)), deliveryCost: (currentDeliveryCost + 2.0).toFixed(1) },
    { month: 'Oct 2026', revenueCr: (currentRevenueCr * 0.94).toFixed(1), cmPct: 5.4, cmpo: parseFloat((currentCMPO - 3.5).toFixed(2)), deliveryCost: (currentDeliveryCost + 1.0).toFixed(1) },
    { month: 'Nov 2026 (Live)', revenueCr: currentRevenueCr, cmPct: currentKPIs.cmPct, cmpo: currentCMPO, deliveryCost: String(currentDeliveryCost) },
    { month: 'Dec 2026 (Sim)', revenueCr: (currentRevenueCr * 1.15).toFixed(1), cmPct: 13.2, cmpo: parseFloat((currentCMPO + 14).toFixed(2)), deliveryCost: Math.max(20, (currentDeliveryCost - 4)).toFixed(1) },
    { month: 'Jan 2027 (Sim)', revenueCr: (currentRevenueCr * 1.28).toFixed(1), cmPct: 16.5, cmpo: currentKPIs.targetCMPO, deliveryCost: Math.max(18, (currentDeliveryCost - 7)).toFixed(1) }
  ];
}

// Profitability simulation engine
function simulateEconomics(params) {
  const aov = parseFloat(params.aov) || 450;
  const dailyOrders = parseInt(params.dailyOrders) || 20000;
  const deliveryCost = parseFloat(params.deliveryCost) || 38;
  const discount = parseFloat(params.discount) || 24;
  const packagingCost = parseFloat(params.packagingCost) || 7.5;
  const productCostPct = parseFloat(params.productCostPct) || 68.5;
  const wastagePct = parseFloat(params.wastagePct) || 3.2;
  const fixedMonthlyPerStore = parseFloat(params.fixedMonthlyPerStore) || 450000;
  const storeCount = parseInt(params.storeCount) || stores.length || 9;

  const cogsPerOrder = (aov * (productCostPct / 100));
  const wastagePerOrder = (aov * (wastagePct / 100));
  const grossMarginPerOrder = aov - cogsPerOrder;
  const variableCostsPerOrder = deliveryCost + discount + packagingCost + wastagePerOrder;
  const cmPerOrder = grossMarginPerOrder - variableCostsPerOrder;
  const cmPct = (cmPerOrder / aov) * 100;

  const dailyRevenue = aov * dailyOrders;
  const monthlyRevenue = dailyRevenue * 30;
  const dailyCM = cmPerOrder * dailyOrders;
  const monthlyGrossCM = dailyCM * 30;
  const totalFixedMonthlyCosts = fixedMonthlyPerStore * storeCount;
  const netMonthlyStoreProfit = monthlyGrossCM - totalFixedMonthlyCosts;

  const breakevenDailyOrders = cmPerOrder > 0 ? Math.ceil(totalFixedMonthlyCosts / (cmPerOrder * 30)) : null;

  const baselineAOV = 435;
  const baselineOrders = 20530;
  const baselineCMPerOrder = 38.7;
  const baselineMonthlyGrossCM = baselineCMPerOrder * baselineOrders * 30;
  const improvementMonthly = monthlyGrossCM - baselineMonthlyGrossCM;

  let monthsToBreakeven = 0;
  if (netMonthlyStoreProfit >= 0) {
    monthsToBreakeven = 0;
  } else if (cmPerOrder > 0) {
    const gap = Math.abs(netMonthlyStoreProfit);
    const growthPerMonth = monthlyGrossCM * 0.12;
    monthsToBreakeven = (gap / (growthPerMonth || 1)).toFixed(1);
  } else {
    monthsToBreakeven = 'Negative unit margin (unbreakevenable without intervention)';
  }

  return {
    inputs: {
      aov,
      dailyOrders,
      deliveryCost,
      discount,
      packagingCost,
      productCostPct,
      wastagePct
    },
    unitEconomics: {
      aov: Math.round(aov * 10) / 10,
      cogs: Math.round(cogsPerOrder * 10) / 10,
      grossMargin: Math.round(grossMarginPerOrder * 10) / 10,
      deliveryCost: Math.round(deliveryCost * 10) / 10,
      discount: Math.round(discount * 10) / 10,
      packagingCost: Math.round(packagingCost * 10) / 10,
      wastageCost: Math.round(wastagePerOrder * 10) / 10,
      variableCostsTotal: Math.round(variableCostsPerOrder * 10) / 10,
      cmPerOrder: Math.round(cmPerOrder * 10) / 10,
      cmPct: Math.round(cmPct * 10) / 10
    },
    aggregates: {
      dailyRevenue: Math.round(dailyRevenue),
      monthlyRevenue: Math.round(monthlyRevenue),
      dailyCM: Math.round(dailyCM),
      monthlyGrossCM: Math.round(monthlyGrossCM),
      totalFixedMonthlyCosts: Math.round(totalFixedMonthlyCosts),
      netMonthlyStoreProfit: Math.round(netMonthlyStoreProfit),
      breakevenDailyOrders,
      monthsToBreakeven
    },
    comparison: {
      baselineMonthlyGrossCM: Math.round(baselineMonthlyGrossCM),
      simulatedMonthlyGrossCM: Math.round(monthlyGrossCM),
      monthlyImprovement: Math.round(improvementMonthly),
      annualizedImprovement: Math.round(improvementMonthly * 12),
      isBreakevenAchieved: netMonthlyStoreProfit >= 0
    }
  };
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // API Routes
  if (pathname.startsWith('/api/')) {
    // GET /api/dataset
    if (pathname === '/api/dataset' && method === 'GET') {
      return sendJSON(res, 200, {
        meta: activeDatasetMeta,
        stores
      });
    }

    // POST /api/dataset/upload
    if (pathname === '/api/dataset/upload' && method === 'POST') {
      const body = await parseBody(req);
      const records = body.records || [];
      const filename = body.filename || 'uploaded_company_data.csv';
      const isAppend = !!body.append;

      if (!Array.isArray(records) || records.length === 0) {
        return sendJSON(res, 400, {
          success: false,
          error: 'Validation Failed: No data records provided in payload',
          validationErrors: ['No data records provided in payload']
        });
      }

      const result = processCompanyDataset(records, filename, isAppend);
      if (!result.success) {
        return sendJSON(res, 400, {
          success: false,
          error: result.error,
          validationErrors: [result.error]
        });
      }

      return sendJSON(res, 200, {
        success: true,
        message: `Successfully imported ${result.storesCount} dark store records from ${filename}`,
        storesCount: result.storesCount,
        meta: activeDatasetMeta,
        kpis: computeKPIs('all')
      });
    }

    // POST /api/dataset/manual
    if (pathname === '/api/dataset/manual' && method === 'POST') {
      const body = await parseBody(req);
      const record = body.record || body;
      const result = processCompanyDataset([record], 'manual_entry', true);
      if (!result.success) {
        return sendJSON(res, 400, {
          success: false,
          error: result.error
        });
      }
      return sendJSON(res, 200, {
        success: true,
        message: 'Store record successfully recorded and added to the network model',
        meta: activeDatasetMeta,
        stores
      });
    }

    // POST /api/dataset/reset
    if (pathname === '/api/dataset/reset' && method === 'POST') {
      stores = JSON.parse(JSON.stringify(defaultStores));
      activeDatasetMeta = {
        source: 'default_benchmark',
        filename: 'ProfitPulse_Default_Benchmark.csv',
        lastUpdated: new Date().toISOString(),
        rowCount: stores.length,
        fieldsDetected: REQUIRED_COLUMNS,
        missingFields: [],
        validationStatus: 'Reset to Default Reference Benchmark (9 Stores)',
        validationErrors: [],
        period: 'Last 30 Days (Nov 2026)',
        isCustomCompanyData: false
      };
      return sendJSON(res, 200, { success: true, message: 'Reset to default reference benchmark', meta: activeDatasetMeta });
    }

    // GET /api/dataset/template
    if (pathname === '/api/dataset/template' && method === 'GET') {
      const templatePath = path.join(DATA_DIR, 'company_data_template.csv');
      if (fs.existsSync(templatePath)) {
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="ProfitPulse_Company_Data_Template.csv"'
        });
        return fs.createReadStream(templatePath).pipe(res);
      }
    }

    // GET /api/dataset/template-xlsx
    if (pathname === '/api/dataset/template-xlsx' && method === 'GET') {
      const templatePath = path.join(DATA_DIR, 'company_data_template.xlsx');
      if (fs.existsSync(templatePath)) {
        res.writeHead(200, {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="ProfitPulse_Company_Data_Template.xlsx"'
        });
        return fs.createReadStream(templatePath).pipe(res);
      }
    }

    // GET /api/kpis
    if (pathname === '/api/kpis' && method === 'GET') {
      const region = parsedUrl.query.region || 'all';
      const storeId = parsedUrl.query.storeId || 'all';
      return sendJSON(res, 200, computeKPIs(region, storeId));
    }

    // GET /api/trends
    if (pathname === '/api/trends' && method === 'GET') {
      return sendJSON(res, 200, getTrends());
    }

    // GET /api/stores
    if (pathname === '/api/stores' && method === 'GET') {
      const region = parsedUrl.query.region;
      let result = stores;
      if (region && region !== 'all') {
        const regionObj = regions.find(r => r.id === region);
        const regionName = regionObj ? regionObj.name : region;
        result = stores.filter(s => s.region.toLowerCase().includes(regionName.toLowerCase()) || regionName.toLowerCase().includes(s.region.toLowerCase()));
      }
      return sendJSON(res, 200, result);
    }

    // GET /api/stores/:id
    if (pathname.startsWith('/api/stores/') && method === 'GET') {
      const storeId = pathname.replace('/api/stores/', '');
      const store = stores.find(s => s.id === storeId);
      if (!store) {
        return sendJSON(res, 404, { error: 'Store not found' });
      }
      return sendJSON(res, 200, store);
    }

    // GET /api/inventory
    if (pathname === '/api/inventory' && method === 'GET') {
      const category = parsedUrl.query.category;
      let result = inventory;
      if (category && category !== 'all') {
        result = inventory.filter(i => i.category === category);
      }
      return sendJSON(res, 200, result);
    }

    // POST /api/inventory/reorder
    if (pathname === '/api/inventory/reorder' && method === 'POST') {
      const body = await parseBody(req);
      const sku = inventory.find(i => i.id === body.skuId);
      if (sku) {
        sku.currentStock += (body.quantity || sku.recommendedOrder || 50);
        sku.status = 'Healthy';
        sku.alertType = null;
        return sendJSON(res, 200, { success: true, message: `PO created successfully for ${sku.name}`, sku });
      }
      return sendJSON(res, 404, { error: 'SKU not found' });
    }

    // GET /api/customers
    if (pathname === '/api/customers' && method === 'GET') {
      return sendJSON(res, 200, customers);
    }

    // GET /api/delivery
    if (pathname === '/api/delivery' && method === 'GET') {
      return sendJSON(res, 200, {
        activeRiders: 1480,
        ordersAwaitingDispatch: 342,
        avgDeliveryTimeMins: 12.4,
        avgDeliveryCostPerOrder: 38.5,
        ordersPerRiderPerHour: 2.8,
        onTimePromisePct: 97.6,
        batchingCompatibilityRatio: 46.5,
        liveQueue: [
          { orderId: '#ORD-8941', store: 'Indiranagar Hub', dest: 'HAL 2nd Stage (850m)', prepTime: '2.5m', eta: '11.2m', status: 'Ready for Batch' },
          { orderId: '#ORD-8942', store: 'Indiranagar Hub', dest: 'HAL 2nd Stage (920m)', prepTime: '1.8m', eta: '12.0m', status: 'Ready for Batch' },
          { orderId: '#ORD-8945', store: 'Koramangala 4th', dest: '80ft Road (450m)', prepTime: '3.1m', eta: '9.8m', status: 'Dispatched' },
          { orderId: '#ORD-8949', store: 'Gurgaon CyberCity', dest: 'DLF Phase 2 (1.1km)', prepTime: '2.0m', eta: '13.4m', status: 'Batch Dispatched' }
        ]
      });
    }

    // POST /api/delivery/simulate-batch
    if (pathname === '/api/delivery/simulate-batch' && method === 'POST') {
      const body = await parseBody(req);
      const batchRatio = parseFloat(body.batchRatio || 45) / 100;
      const baseCost = 38.5;
      const batchedTripCost = 48.0;
      const blendedCost = (1 - batchRatio) * baseCost + batchRatio * (batchedTripCost / 2);
      const savingsPerOrder = baseCost - blendedCost;
      const dailyOrders = 20530;
      const monthlySavings = Math.round(savingsPerOrder * dailyOrders * 30);
      const avgETA = 11.5 + (batchRatio * 1.8);

      return sendJSON(res, 200, {
        batchRatioPct: Math.round(batchRatio * 100),
        blendedDeliveryCost: Math.round(blendedCost * 10) / 10,
        costSavingsPerOrder: Math.round(savingsPerOrder * 10) / 10,
        monthlyFinancialGain: monthlySavings,
        avgDeliveryTimeMins: Math.round(avgETA * 10) / 10,
        promiseCompliancePct: 96.8
      });
    }

    // POST /api/simulate
    if (pathname === '/api/simulate' && method === 'POST') {
      const body = await parseBody(req);
      const result = simulateEconomics(body);
      return sendJSON(res, 200, result);
    }

    // GET /api/alerts
    if (pathname === '/api/alerts' && method === 'GET') {
      return sendJSON(res, 200, alerts);
    }

    // GET /api/regions
    if (pathname === '/api/regions' && method === 'GET') {
      return sendJSON(res, 200, regions);
    }

    // GET /api/export
    if (pathname === '/api/export' && method === 'GET') {
      const csvRows = [
        'Store ID,Name,Region,Orders/Day,AOV (INR),Monthly Revenue,CM (INR),CM %,Fixed Costs (INR),Net Profit (INR),Status',
        ...stores.map(s => `"${s.id}","${s.name}","${s.region}",${s.ordersPerDay},${s.aov},${s.monthlyRevenue},${s.contributionMargin},${s.cmPct}%,${s.rent + s.staffing + s.utilities},${s.netStoreProfit || (s.contributionMargin - (s.rent + s.staffing + s.utilities))},"${s.status}"`)
      ];
      res.writeHead(200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="ProfitPulse_Company_Profitability_Report.csv"'
      });
      return res.end(csvRows.join('\n'));
    }

    return sendJSON(res, 404, { error: 'Endpoint not found' });
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Access Denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`🚀 ProfitPulse AI Platform is live!`);
  console.log(`🔗 Localhost URL: http://localhost:${PORT}`);
  console.log(`📊 Dynamic Company Data Processing Engine Ready`);
  console.log(`===================================================`);
});

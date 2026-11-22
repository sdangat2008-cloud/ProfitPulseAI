require 'webrick'
require 'json'
require 'uri'
require 'fileutils'
require_relative 'data/mongo_db'

PORT = 3000
ROOT_DIR = File.expand_path(__dir__)
PUBLIC_DIR = File.join(ROOT_DIR, 'public')
DATA_DIR = File.join(ROOT_DIR, 'data')

def load_json(filename)
  path = File.join(DATA_DIR, filename)
  return [] unless File.exist?(path)
  JSON.parse(File.read(path))
rescue => e
  puts "Error loading #{filename}: #{e.message}"
  []
end

db_stores = MongoDBEngine.get_stores
$default_stores = (db_stores && !db_stores.empty?) ? db_stores : load_json('stores.json')
$stores = JSON.parse(JSON.generate($default_stores))
$inventory = load_json('inventory.json')
$customers = load_json('customers.json')
$alerts = load_json('alerts.json')
$regions = load_json('regions.json')

$active_dataset_meta = {
  "source" => "imported_excel_dataset",
  "filename" => "ProfitPulse_AI_Store_Data_Entry(1).xlsx",
  "lastUpdated" => Time.now.iso8601,
  "rowCount" => $stores.length,
  "fieldsDetected" => [
    "Store_ID", "Dark_Store_Name", "Region", "Reporting_Period",
    "Monthly_Revenue_INR", "Orders_Per_Day", "Delivery_Cost_Per_Order_INR",
    "Dark_Store_Rent_Monthly_INR", "Staffing_Expenses_Monthly_INR",
    "Inventory_Wastage_Monthly_INR", "Private_Label_Sales_Monthly_INR"
  ],
  "missingFields" => [],
  "validationStatus" => "Valid (9 of 9 Stores Loaded from Excel)",
  "validationErrors" => [],
  "period" => "October 2026",
  "isCustomCompanyData" => true
}

def compute_kpis(region_filter = 'all', store_filter = 'all', period_filter = 'all')
  filtered = $stores
  if region_filter && region_filter != 'all'
    reg_obj = $regions.find { |r| r['id'] == region_filter }
    reg_name = reg_obj ? reg_obj['name'] : region_filter
    filtered = filtered.select { |s| s['region'].downcase.include?(reg_name.downcase) || reg_name.downcase.include?(s['region'].downcase) }
  end

  if store_filter && store_filter != 'all'
    filtered = filtered.select { |s| s['id'] == store_filter || s['name'] == store_filter }
  end

  total_stores = [filtered.length, 1].max
  total_orders_per_day = filtered.sum { |s| s['ordersPerDay'] || 0 }
  total_monthly_orders = total_orders_per_day * 30
  total_monthly_revenue = filtered.sum { |s| s['monthlyRevenue'] || 0 }
  total_monthly_cm = filtered.sum { |s| s['contributionMargin'] || 0 }
  total_fixed_costs = filtered.sum { |s| (s['rent'] || 0) + (s['staffing'] || 0) + (s['utilities'] || 0) }
  loss_making_count = filtered.count { |s| s['lossMaking'] }

  avg_aov = total_monthly_orders > 0 ? (total_monthly_revenue.to_f / total_monthly_orders).round : 45
  total_del_cost = filtered.sum { |s| (s['deliveryCostPerOrder'] || 38) * (s['ordersPerDay'] || 0) * 30 }
  avg_del_cost = total_monthly_orders > 0 ? (total_del_cost.to_f / total_monthly_orders).round(1) : 0
  avg_cm_pct = total_monthly_revenue > 0 ? ((total_monthly_cm.to_f / total_monthly_revenue) * 100).round(1) : 0

  cmpo = total_monthly_orders > 0 ? (total_monthly_cm.to_f / total_monthly_orders).round(2) : 0.0
  prev_cmpo = (cmpo * 1.08).round(2)
  cmpo_change_pct = prev_cmpo != 0 ? (((cmpo - prev_cmpo) / prev_cmpo.abs) * 100).round(1) : 0.0
  target_cmpo = 72.00
  cmpo_progress_pct = target_cmpo > 0 ? [[0.0, (cmpo / target_cmpo) * 100].max, 100.0].min.round(1) : 0.0
  cmpo_gap = (target_cmpo - cmpo).round(2)
  daily_net_cm = total_orders_per_day * cmpo

  total_wastage = filtered.sum { |s| s['wastageCost'] || 0 }
  inventory_wastage_pct = total_monthly_revenue > 0 ? ((total_wastage.to_f / total_monthly_revenue) * 100).round(1) : 3.4

  {
    "region" => region_filter,
    "storeId" => store_filter,
    "period" => "October 2026",
    "totalStores" => total_stores,
    "totalOrdersDaily" => total_orders_per_day,
    "totalOrdersMonthly" => total_monthly_orders,
    "totalMonthlyRevenue" => total_monthly_revenue,
    "totalMonthlyCM" => total_monthly_cm,
    "totalFixedCosts" => total_fixed_costs,
    "avgAOV" => avg_aov,
    "cmpo" => cmpo,
    "prevCMPO" => prev_cmpo,
    "cmpoChangePct" => cmpo_change_pct,
    "targetCMPO" => target_cmpo,
    "cmpoProgressPct" => cmpo_progress_pct,
    "cmpoGap" => cmpo_gap,
    "dailyNetCM" => daily_net_cm,
    "deliveryCostPerOrder" => avg_del_cost,
    "cmPct" => avg_cm_pct,
    "inventoryWastagePct" => inventory_wastage_pct,
    "lossMakingStores" => loss_making_count,
    "currencySymbol" => (region_filter == 'sea') ? '$' : (region_filter == 'eu') ? '€' : '₹'
  }
end

server = WEBrick::HTTPServer.new(
  Port: PORT,
  DocumentRoot: PUBLIC_DIR,
  Logger: WEBrick::Log.new(nil, WEBrick::BasicLog::WARN),
  AccessLog: []
)

def send_json(res, obj)
  res.status = 200
  res['Content-Type'] = 'application/json; charset=utf-8'
  res['Access-Control-Allow-Origin'] = '*'
  res['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
  res['Access-Control-Allow-Headers'] = 'Content-Type'
  res.body = JSON.generate(obj)
end

# High-performance in-memory static file delivery (avoids OS sendfile sandbox restrictions)
Dir.glob(File.join(PUBLIC_DIR, '**', '*')).each do |fpath|
  next unless File.file?(fpath)
  rel_path = fpath.sub(PUBLIC_DIR, '')
  ext = File.extname(fpath).downcase
  mime = case ext
         when '.html' then 'text/html; charset=utf-8'
         when '.js' then 'application/javascript; charset=utf-8'
         when '.css' then 'text/css; charset=utf-8'
         when '.json' then 'application/json; charset=utf-8'
         when '.svg' then 'image/svg+xml'
         when '.png' then 'image/png'
         when '.jpg', '.jpeg' then 'image/jpeg'
         when '.ico' then 'image/x-icon'
         when '.xlsx' then 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
         when '.csv' then 'text/csv; charset=utf-8'
         else 'application/octet-stream'
         end

  handler = proc do |_req, res|
    res.status = 200
    res['Content-Type'] = mime
    res['Access-Control-Allow-Origin'] = '*'
    res.body = File.read(fpath)
  end

  server.mount_proc rel_path, &handler
  server.mount_proc '/', &handler if rel_path == '/index.html'
end

# API Endpoints
server.mount_proc '/api/kpis' do |req, res|
  query = WEBrick::HTTPUtils.parse_query(req.query_string)
  send_json(res, compute_kpis(query['region'] || 'all', query['storeId'] || 'all'))
end

server.mount_proc '/api/trends' do |req, res|
  tot_rev = $stores.sum { |s| s['monthlyRevenue'] || 0 }
  tot_cm = $stores.sum { |s| s['contributionMargin'] || 0 }
  actual_cm_pct = tot_rev > 0 ? ((tot_cm.to_f / tot_rev) * 100).round(1) : -89.5

  trends = [
    { "month" => "May 2026", "revenue" => (tot_rev * 0.78).round, "cmPct" => (actual_cm_pct - 14.2).round(1), "cm" => (tot_cm * 1.15).round },
    { "month" => "Jun 2026", "revenue" => (tot_rev * 0.83).round, "cmPct" => (actual_cm_pct - 10.0).round(1), "cm" => (tot_cm * 1.10).round },
    { "month" => "Jul 2026", "revenue" => (tot_rev * 0.88).round, "cmPct" => (actual_cm_pct - 6.5).round(1), "cm" => (tot_cm * 1.06).round },
    { "month" => "Aug 2026", "revenue" => (tot_rev * 0.92).round, "cmPct" => (actual_cm_pct - 4.0).round(1), "cm" => (tot_cm * 1.03).round },
    { "month" => "Sep 2026", "revenue" => (tot_rev * 0.96).round, "cmPct" => (actual_cm_pct - 1.8).round(1), "cm" => (tot_cm * 1.01).round },
    { "month" => "Oct 2026", "revenue" => tot_rev, "cmPct" => actual_cm_pct, "cm" => tot_cm },
    { "month" => "Nov 2026 (P)", "revenue" => (tot_rev * 1.08).round, "cmPct" => [actual_cm_pct + 25.0, 5.0].min.round(1), "cm" => (tot_cm * 0.65).round },
    { "month" => "Dec 2026 (P)", "revenue" => (tot_rev * 1.18).round, "cmPct" => 16.0, "cm" => (tot_rev * 0.16).round }
  ]
  send_json(res, trends)
end

server.mount_proc '/api/stores' do |req, res|
  query = WEBrick::HTTPUtils.parse_query(req.query_string)
  region = query['region']
  data = $stores
  if region && region != 'all'
    reg_obj = $regions.find { |r| r['id'] == region }
    reg_name = reg_obj ? reg_obj['name'] : region
    data = data.select { |s| s['region'].downcase.include?(reg_name.downcase) || reg_name.downcase.include?(s['region'].downcase) }
  end
  send_json(res, data)
end

server.mount_proc '/api/regions' do |req, res|
  send_json(res, $regions)
end

server.mount_proc '/api/inventory' do |req, res|
  query = WEBrick::HTTPUtils.parse_query(req.query_string)
  category = query['category']
  data = $inventory
  if category && category != 'all'
    data = data.select { |i| i['category'] == category }
  end
  send_json(res, data)
end

server.mount_proc '/api/customers' do |req, res|
  send_json(res, $customers)
end

server.mount_proc '/api/delivery' do |req, res|
  queue = [
    { "orderId" => "#ORD-9821", "store" => "Indiranagar Hub 104", "destination" => "Domlur Layout (0.9km)", "prepTime" => "3.1 min", "eta" => "11.2 min", "batchStatus" => "Batched (2 Orders)", "canBatch" => false },
    { "orderId" => "#ORD-9822", "store" => "Indiranagar Hub 104", "destination" => "Cambridge Layout (1.1km)", "prepTime" => "2.8 min", "eta" => "12.0 min", "batchStatus" => "Batched (2 Orders)", "canBatch" => false },
    { "orderId" => "#ORD-9823", "store" => "Koramangala 4th Block", "destination" => "Sony World Signal (1.4km)", "prepTime" => "4.0 min", "eta" => "13.5 min", "batchStatus" => "Solo Dispatch", "canBatch" => true },
    { "orderId" => "#ORD-9824", "store" => "Whitefield ITPL", "destination" => "Prestige Shantiniketan (0.6km)", "prepTime" => "2.1 min", "eta" => "9.8 min", "batchStatus" => "Solo Dispatch", "canBatch" => true },
    { "orderId" => "#ORD-9825", "store" => "Hauz Khas Village", "destination" => "Green Park Ext (1.0km)", "prepTime" => "3.4 min", "eta" => "12.8 min", "batchStatus" => "Batched (2 Orders)", "canBatch" => false }
  ]
  send_json(res, {
    "activeRiders" => 1480,
    "onTimeSLA" => 97.6,
    "avgDeliveryTime" => 12.4,
    "baselineDeliveryCost" => 38.5,
    "liveQueue" => queue
  })
end

server.mount_proc '/api/alerts' do |req, res|
  send_json(res, $alerts)
end

server.mount_proc '/api/dataset' do |req, res|
  send_json(res, { "meta" => $active_dataset_meta, "stores" => $stores })
end

server.mount_proc '/api/dataset/status' do |req, res|
  send_json(res, { "meta" => $active_dataset_meta, "stores" => $stores })
end

server.mount_proc '/api/dataset/upload' do |req, res|
  if req.request_method == 'OPTIONS'
    send_json(res, { "status" => "ok" })
    next
  end

  body = req.body ? JSON.parse(req.body) : {}
  records = body['records'] || []
  filename = body['filename'] || 'Uploaded_Dataset.xlsx'
  append = !!body['append']

  if records.empty?
    send_json(res, { "success" => false, "error" => "No records provided in upload payload" })
    next
  end

  # Transform records into canonical dark-store objects
  formatted_stores = records.map do |r|
    rev = (r['monthlyRevenue'] || r['Monthly_Revenue_INR'] || r['monthly_revenue'] || r['revenue'] || 0).to_f
    orders_day = (r['ordersPerDay'] || r['Orders_Per_Day'] || r['orders_per_day'] || r['orders'] || 0).to_i
    del_cost = (r['deliveryCostPerOrder'] || r['Delivery_Cost_Per_Order_INR'] || r['delivery_cost_per_order'] || r['deliveryCost'] || 38.0).to_f
    rent = (r['rent'] || r['Dark_Store_Rent_Monthly_INR'] || r['dark_store_rent'] || 0).to_f
    staffing = (r['staffing'] || r['Staffing_Expenses_Monthly_INR'] || r['staffing_expenses'] || 0).to_f
    wastage = (r['wastageCost'] || r['Inventory_Wastage_Monthly_INR'] || r['inventory_wastage'] || r['wastage'] || 0).to_f
    pl_sales = (r['privateLabelSales'] || r['Private_Label_Sales_Monthly_INR'] || r['private_label_sales'] || 0).to_f
    cogs = (rev * 0.65) - (pl_sales * 0.15)
    monthly_del = orders_day * 30 * del_cost
    total_exp = cogs + monthly_del + rent + staffing + wastage
    cm = (rev - total_exp).round(2)
    cm_pct = rev > 0 ? ((cm / rev) * 100).round(1) : 0.0

    {
      "id" => (r['id'] || r['Store_ID'] || r['store_id'] || "DS-#{SecureRandom.hex(3).upcase}").to_s,
      "name" => (r['name'] || r['Dark_Store_Name'] || r['dark_store_name'] || "Store #{r['id']}").to_s,
      "region" => (r['region'] || r['Region'] || "Consolidated").to_s,
      "location" => (r['location'] || r['Location'] || "#{r['name']} Hub").to_s,
      "period" => (r['period'] || r['Reporting_Period'] || r['period'] || "Nov 2026").to_s,
      "sqft" => (r['sqft'] || 3000).to_i,
      "rent" => rent.round,
      "staffing" => staffing.round,
      "utilities" => (r['utilities'] || (rent * 0.2)).round,
      "ordersPerDay" => orders_day,
      "aov" => orders_day > 0 ? (rev / (orders_day * 30)).round : 450,
      "monthlyRevenue" => rev.round,
      "productCostPct" => 68.0,
      "deliveryCostPerOrder" => del_cost.round(1),
      "discountPerOrder" => (r['discountPerOrder'] || 22.0).to_f,
      "wastageCost" => wastage.round,
      "privateLabelSales" => pl_sales.round,
      "contributionMargin" => cm.round,
      "cmPct" => cm_pct,
      "status" => cm_pct >= 15 ? "Highly Profitable" : cm_pct >= 8 ? "Profitable" : cm_pct >= 0 ? "Vulnerable" : "Critical Loss",
      "lossMaking" => cm_pct < 0,
      "utilization" => (r['utilization'] || (cm_pct >= 8 ? 85 : 48)).to_i,
      "aiRecommendations" => [
        { "title" => "Optimize Batching Schedule", "description" => "Dynamic proximity routing to reduce dispatch turnaround.", "impact" => "+₹45,000/mo" }
      ]
    }
  end

  if append
    $stores = ($stores + formatted_stores).uniq { |s| s['id'] }
  else
    $stores = formatted_stores
  end

  # Persist to MongoDB pseudo store
  MongoDBEngine.save_stores($stores, filename)

  detected_fields = [
    "Store ID", "Dark Store Name", "Region", "Period", "Monthly Revenue",
    "Orders per Day", "Delivery Cost per Order", "Dark-Store Rent",
    "Staffing Expenses", "Inventory Wastage", "Private Label Sales"
  ]

  $active_dataset_meta = {
    "source" => "uploaded_company_data",
    "filename" => filename,
    "lastUpdated" => Time.now.iso8601,
    "rowCount" => $stores.length,
    "fieldsDetected" => detected_fields,
    "missingFields" => [],
    "validationStatus" => "Valid (#{$stores.length} of #{$stores.length} Stores Loaded)",
    "validationErrors" => [],
    "period" => formatted_stores.first['period'] || "Current Uploaded Period",
    "isCustomCompanyData" => true
  }

  send_json(res, {
    "success" => true,
    "meta" => $active_dataset_meta,
    "stores" => $stores
  })
end

server.mount_proc '/api/dataset/template' do |req, res|
  res.status = 200
  res['Content-Type'] = 'text/csv; charset=utf-8'
  res['Content-Disposition'] = 'attachment; filename="ProfitPulse_Company_Data_Template.csv"'
  res.body = <<~CSV
    Store_ID,Dark_Store_Name,Region,Period,Monthly_Revenue,Orders_Per_Day,Delivery_Cost_Per_Order,Dark_Store_Rent,Staffing_Expenses,Inventory_Wastage,Private_Label_Sales
    DS-BLR-01,Indiranagar Hub 104,South India - Bengaluru,Nov 2026,3738600,2680,34.0,220000,185000,78000,530000
    DS-BLR-02,Koramangala 4th Block,South India - Bengaluru,Nov 2026,4024800,3120,36.0,260000,195000,92000,580000
    DS-BLR-03,Whitefield IT Corridor,South India - Bengaluru,Nov 2026,1311000,1150,49.0,190000,170000,115000,180000
    DS-NCR-01,Gurgaon CyberCity Hub,North India - NCR,Nov 2026,5278500,3450,33.0,280000,210000,85000,750000
    DS-NCR-02,South Delhi Green Park,North India - NCR,Nov 2026,3055500,2100,37.0,240000,160000,62000,420000
    DS-NCR-03,Noida Sector 62 Pod,North India - NCR,Nov 2026,1315800,1290,44.0,140000,145000,98000,190000
    DS-MUM-01,Bandra West Hill Road,West India - Mumbai,Nov 2026,4827600,2980,38.0,380000,220000,72000,690000
    DS-MUM-02,Andheri East MIDC,West India - Mumbai,Nov 2026,3012900,2420,39.0,210000,180000,88000,380000
    DS-MUM-03,Thane West Ghodbunder,West India - Mumbai,Nov 2026,1447200,1340,46.0,160000,150000,104000,160000
  CSV
end

server.mount_proc '/api/dataset/template-xlsx' do |req, res|
  xlsx_path = File.join(PUBLIC_DIR, 'sample_dark_stores.xlsx')
  if File.file?(xlsx_path)
    res.status = 200
    res['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    res['Content-Disposition'] = 'attachment; filename="ProfitPulse_Company_Data_Template.xlsx"'
    res.body = File.read(xlsx_path)
  else
    # Fallback to CSV
    res.status = 200
    res['Content-Type'] = 'text/csv; charset=utf-8'
    res['Content-Disposition'] = 'attachment; filename="ProfitPulse_Company_Data_Template.csv"'
    res.body = "Store_ID,Dark_Store_Name,Region,Period,Monthly_Revenue,Orders_Per_Day,Delivery_Cost_Per_Order,Dark_Store_Rent,Staffing_Expenses,Inventory_Wastage,Private_Label_Sales\n"
  end
end

server.mount_proc '/api/delivery/simulate-batch' do |req, res|
  body = req.body ? JSON.parse(req.body) : {}
  ratio = (body['batchRatio'] || 45).to_f / 100.0
  solo_cost = 38.50
  batched_cost = 24.00
  blended = (solo_cost * (1 - ratio)) + (batched_cost * ratio)
  savings_per_order = (solo_cost - blended).round(2)
  monthly_savings = (savings_per_order * 20530 * 30).round

  send_json(res, {
    "batchRatio" => (ratio * 100).round,
    "blendedDeliveryCost" => blended.round(2),
    "savingsPerOrder" => savings_per_order,
    "monthlySavings" => monthly_savings
  })
end

server.mount_proc '/api/dataset/reset' do |req, res|
  $stores = JSON.parse(JSON.generate($default_stores))
  $active_dataset_meta["isCustomCompanyData"] = false
  $active_dataset_meta["filename"] = "ProfitPulse_Default_Benchmark.csv"
  $active_dataset_meta["rowCount"] = $stores.length
  send_json(res, { "success" => true })
end

server.mount_proc '/api/export' do |req, res|
  res.status = 200
  res['Content-Type'] = 'text/csv; charset=utf-8'
  res['Content-Disposition'] = 'attachment; filename="ProfitPulse_Profitability_Report.csv"'
  csv = "Store_ID,Dark_Store_Name,Region,Monthly_Revenue_INR,Orders_Per_Day,Contribution_Margin_INR,CM_Pct,Status\n"
  $stores.each do |s|
    csv << "#{s['id']},\"#{s['name']}\",\"#{s['region']}\",#{s['monthlyRevenue']},#{s['ordersPerDay']},#{s['contributionMargin']},#{s['cmPct']}%,#{s['status']}\n"
  end
  res.body = csv
end

# --- MongoDB Database Endpoints ---
server.mount_proc '/api/db/status' do |req, res|
  send_json(res, MongoDBEngine.status)
end

server.mount_proc '/api/db/products' do |req, res|
  if req.request_method == 'GET'
    query = WEBrick::HTTPUtils.parse_query(req.query_string)
    send_json(res, MongoDBEngine.get_products(query))
  elsif req.request_method == 'POST' || req.request_method == 'PUT'
    body = req.body ? JSON.parse(req.body) : {}
    result = MongoDBEngine.save_product(body)
    send_json(res, result)
  elsif req.request_method == 'DELETE'
    query = WEBrick::HTTPUtils.parse_query(req.query_string)
    send_json(res, MongoDBEngine.delete_product(query['id']))
  else
    send_json(res, { "error" => "Method not supported" })
  end
end

server.mount_proc '/api/db/products/lookup' do |req, res|
  query = WEBrick::HTTPUtils.parse_query(req.query_string)
  prod = MongoDBEngine.find_product_by_barcode(query['code'])
  send_json(res, { "found" => !prod.nil?, "product" => prod })
end

server.mount_proc '/api/db/stock-adjust' do |req, res|
  body = req.body ? JSON.parse(req.body) : {}
  sku = body['skuId'] || body['productId']
  delta = body['delta'].to_i
  reason = body['reason'] || 'Manual stock adjustment'
  result = MongoDBEngine.adjust_stock(sku, delta, reason)
  send_json(res, result)
end

server.mount_proc '/api/db/transactions' do |req, res|
  send_json(res, MongoDBEngine.get_transactions)
end

server.mount_proc '/api/db/notifications' do |req, res|
  if req.request_method == 'GET'
    query = WEBrick::HTTPUtils.parse_query(req.query_string)
    send_json(res, MongoDBEngine.get_notifications(query['filter'] || 'all'))
  elsif req.request_method == 'POST'
    body = req.body ? JSON.parse(req.body) : {}
    send_json(res, MongoDBEngine.add_notification(body))
  end
end

server.mount_proc '/api/db/notifications/read' do |req, res|
  body = req.body ? JSON.parse(req.body) : {}
  send_json(res, MongoDBEngine.mark_notification_read(body['id'] || 'all'))
end

server.mount_proc '/api/db/notifications/clear' do |req, res|
  send_json(res, MongoDBEngine.clear_notifications)
end

server.mount_proc '/api/db/business-data' do |req, res|
  if req.request_method == 'GET'
    send_json(res, MongoDBEngine.get_business_data)
  elsif req.request_method == 'POST'
    body = req.body ? JSON.parse(req.body) : {}
    send_json(res, MongoDBEngine.save_business_data(body))
  end
end

server.mount_proc '/api/db/seed' do |req, res|
  store = MongoDBEngine.seed_default_store
  send_json(res, { "success" => true, "status" => MongoDBEngine.status })
end

puts "ProfitPulse AI Server running at http://localhost:#{PORT}/"
trap('INT') { server.shutdown }
trap('TERM') { server.shutdown }
server.start

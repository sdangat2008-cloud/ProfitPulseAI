# ProfitPulse AI – MongoDB Document Database & Pseudo Data Engine
require 'json'
require 'fileutils'
require 'time'
require 'securerandom'

module MongoDBEngine
  DATA_FILE = File.expand_path(File.join(__dir__, 'mongodb_store.json'))
  MONGO_URI = "mongodb+srv://Admin1:Test123@cluster0.tzti0i8.mongodb.net/profitpulse?retryWrites=true&w=majority"
  CLUSTER = "cluster0.tzti0i8.mongodb.net"
  DATABASE_NAME = "profitpulse"

  @lock = Mutex.new

  def self.load_store
    if File.exist?(DATA_FILE)
      JSON.parse(File.read(DATA_FILE))
    else
      seed_default_store
    end
  rescue => e
    puts "[MongoDBEngine] Error loading store: #{e.message}. Re-seeding."
    seed_default_store
  end

  def self.save_store(data)
    @lock.synchronize do
      File.write(DATA_FILE, JSON.pretty_generate(data))
    end
  end

  def self.seed_default_store
    now = Time.now.iso8601
    store = {
      "_meta" => {
        "mongoUri" => MONGO_URI,
        "maskedUri" => "mongodb+srv://Admin1:••••••••@#{CLUSTER}/#{DATABASE_NAME}",
        "cluster" => CLUSTER,
        "database" => DATABASE_NAME,
        "status" => "connected",
        "mode" => "MongoDB Atlas Active",
        "lastSyncedAt" => now,
        "createdAt" => now
      },
      "products" => [
        {
          "_id" => "prod_" + SecureRandom.hex(6),
          "id" => "SKU-MLK-01",
          "barcode" => "8901030383741",
          "name" => "Amul Taaza Homogenised Toned Milk 1L",
          "category" => "Dairy & Milk",
          "availableQuantity" => 420,
          "minThreshold" => 150,
          "unitPrice" => 72.0,
          "purchaseCost" => 61.2,
          "supplier" => "Amul Cooperative Direct",
          "expiryDays" => 3,
          "lastUpdated" => "Today, 08:30 AM",
          "createdAt" => now
        },
        {
          "_id" => "prod_" + SecureRandom.hex(6),
          "id" => "SKU-BER-02",
          "barcode" => "8901262010052",
          "name" => "Fresh Organic Blueberries 125g",
          "category" => "Fresh Produce",
          "availableQuantity" => 24,
          "minThreshold" => 35,
          "unitPrice" => 240.0,
          "purchaseCost" => 160.0,
          "supplier" => "BerryFresh Imports Ltd",
          "expiryDays" => 2,
          "lastUpdated" => "Today, 09:15 AM",
          "createdAt" => now
        },
        {
          "_id" => "prod_" + SecureRandom.hex(6),
          "id" => "SKU-AVO-03",
          "barcode" => "8901491101824",
          "name" => "Hass Avocados (Twin Pack)",
          "category" => "Fresh Produce",
          "availableQuantity" => 18,
          "minThreshold" => 25,
          "unitPrice" => 280.0,
          "purchaseCost" => 195.0,
          "supplier" => "NatureFresh Agri Imports",
          "expiryDays" => 2,
          "lastUpdated" => "Today, 09:40 AM",
          "createdAt" => now
        },
        {
          "_id" => "prod_" + SecureRandom.hex(6),
          "id" => "SKU-SNK-04",
          "barcode" => "8901058852335",
          "name" => "Lay's Gourmet Vintage Cheese 55g",
          "category" => "Snacks & Munchies",
          "availableQuantity" => 580,
          "minThreshold" => 100,
          "unitPrice" => 50.0,
          "purchaseCost" => 39.0,
          "supplier" => "PepsiCo India Holdings",
          "expiryDays" => 90,
          "lastUpdated" => "Today, 10:00 AM",
          "createdAt" => now
        },
        {
          "_id" => "prod_" + SecureRandom.hex(6),
          "id" => "SKU-EGG-05",
          "barcode" => "8901112233445",
          "name" => "Farm Fresh Brown Eggs (Pack of 6)",
          "category" => "Meat & Eggs",
          "availableQuantity" => 115,
          "minThreshold" => 40,
          "unitPrice" => 95.0,
          "purchaseCost" => 72.0,
          "supplier" => "Keggfarms Direct Hub",
          "expiryDays" => 12,
          "lastUpdated" => "Today, 07:45 AM",
          "createdAt" => now
        },
        {
          "_id" => "prod_" + SecureRandom.hex(6),
          "id" => "SKU-BEV-06",
          "barcode" => "8901765432198",
          "name" => "Coca-Cola Zero Sugar 300ml Can",
          "category" => "Beverages",
          "availableQuantity" => 310,
          "minThreshold" => 80,
          "unitPrice" => 40.0,
          "purchaseCost" => 28.5,
          "supplier" => "Hindustan Coca-Cola Beverages",
          "expiryDays" => 120,
          "lastUpdated" => "Today, 10:20 AM",
          "createdAt" => now
        },
        {
          "_id" => "prod_" + SecureRandom.hex(6),
          "id" => "SKU-PAN-07",
          "barcode" => "8901030554412",
          "name" => "Aashirvaad Shudh Chakki Atta 5kg",
          "category" => "Pantry Essentials",
          "availableQuantity" => 85,
          "minThreshold" => 30,
          "unitPrice" => 315.0,
          "purchaseCost" => 260.0,
          "supplier" => "ITC Limited Distribution",
          "expiryDays" => 180,
          "lastUpdated" => "Yesterday, 06:10 PM",
          "createdAt" => now
        },
        {
          "_id" => "prod_" + SecureRandom.hex(6),
          "id" => "SKU-YOG-08",
          "barcode" => "8901662981014",
          "name" => "Epigamia Greek Yogurt Strawberry 120g",
          "category" => "Dairy & Milk",
          "availableQuantity" => 42,
          "minThreshold" => 60,
          "unitPrice" => 65.0,
          "purchaseCost" => 48.0,
          "supplier" => "Drums Food International",
          "expiryDays" => 4,
          "lastUpdated" => "Today, 08:00 AM",
          "createdAt" => now
        }
      ],
      "inventory_transactions" => [
        {
          "_id" => "tx_" + SecureRandom.hex(6),
          "id" => "tx-1",
          "timestamp" => "08:15:20 AM",
          "sku" => "SKU-MLK-01",
          "productName" => "Amul Taaza Homogenised Toned Milk 1L",
          "change" => "+250",
          "resultingStock" => 420,
          "opType" => "INWARD_RECEIPT",
          "reason" => "Central Hub Transfer PO-9812",
          "createdAt" => now
        },
        {
          "_id" => "tx_" + SecureRandom.hex(6),
          "id" => "tx-2",
          "timestamp" => "09:30:45 AM",
          "sku" => "SKU-AVO-03",
          "productName" => "Hass Avocados (Twin Pack)",
          "change" => "-8",
          "resultingStock" => 18,
          "opType" => "DISPATCH_FULFILLMENT",
          "reason" => "Customer Quick-Commerce Orders",
          "createdAt" => now
        },
        {
          "_id" => "tx_" + SecureRandom.hex(6),
          "id" => "tx-3",
          "timestamp" => "09:55:10 AM",
          "sku" => "SKU-BER-02",
          "productName" => "Fresh Organic Blueberries 125g",
          "change" => "-5",
          "resultingStock" => 24,
          "opType" => "BARCODE_SCAN",
          "reason" => "Rider Bagging & Order Dispatch",
          "createdAt" => now
        }
      ],
      "notifications" => [
        {
          "_id" => "notif_" + SecureRandom.hex(6),
          "id" => "notif-1",
          "title" => "Low Stock Alert: Hass Avocados (Twin Pack)",
          "message" => "Current stock is 18 units, below minimum threshold of 25. Morning replenishment recommended.",
          "severity" => "critical",
          "category" => "inventory",
          "timestamp" => (Time.now - 600).iso8601,
          "read" => false,
          "skuId" => "SKU-AVO-03"
        },
        {
          "_id" => "notif_" + SecureRandom.hex(6),
          "id" => "notif-2",
          "title" => "Perishable Expiry Warning: Blueberries",
          "message" => "24 units of Fresh Organic Blueberries have 2 days left. Flash discount or bundle recommended.",
          "severity" => "warning",
          "category" => "inventory",
          "timestamp" => (Time.now - 1920).iso8601,
          "read" => false,
          "skuId" => "SKU-BER-02"
        },
        {
          "_id" => "notif_" + SecureRandom.hex(6),
          "id" => "notif-3",
          "title" => "High Delivery Cost Inefficiency Detected",
          "message" => "East Delhi dark-store delivery cost averaged ₹42.80/order today (+11% above ₹38.50 target).",
          "severity" => "warning",
          "category" => "business",
          "timestamp" => (Time.now - 3900).iso8601,
          "read" => false
        },
        {
          "_id" => "notif_" + SecureRandom.hex(6),
          "id" => "notif-4",
          "title" => "Inventory Inbound Verified",
          "message" => "Amul Taaza Milk received 250 units from central distribution. Inward scan verified.",
          "severity" => "success",
          "category" => "inventory",
          "timestamp" => (Time.now - 8400).iso8601,
          "read" => true,
          "skuId" => "SKU-MLK-01"
        }
      ],
      "business_data" => {
        "_id" => "biz_" + SecureRandom.hex(6),
        "revenue" => 31850000.0,
        "orders" => 68400,
        "deliveryCost" => 2480000.0,
        "rent" => 245000.0,
        "staffing" => 195000.0,
        "wastage" => 82000.0,
        "privateLabel" => 580000.0,
        "isDemo" => true,
        "calculatedCM" => 8232500.0,
        "calculatedCMPO" => 120.36,
        "calculatedCMPct" => 25.85,
        "updatedAt" => now
      }
    }
    save_store(store)
    store
  end

  # --- Query & Mutation Helpers ---
  def self.status
    store = load_store
    {
      "status" => "connected",
      "cluster" => CLUSTER,
      "database" => DATABASE_NAME,
      "mongoUri" => MONGO_URI,
      "maskedUri" => store["_meta"]["maskedUri"],
      "lastSyncedAt" => Time.now.iso8601,
      "collections" => ["products", "inventory_transactions", "notifications", "business_data"],
      "documentCounts" => {
        "products" => (store["products"] || []).length,
        "inventory_transactions" => (store["inventory_transactions"] || []).length,
        "notifications" => (store["notifications"] || []).length,
        "business_data" => store["business_data"] ? 1 : 0
      }
    }
  end

  # Products
  def self.get_products(query = {})
    store = load_store
    prods = store["products"] || []
    if query["category"] && query["category"] != "all"
      prods = prods.select { |p| p["category"] == query["category"] }
    end
    if query["search"] && !query["search"].strip.empty?
      term = query["search"].downcase.strip
      prods = prods.select do |p|
        p["name"].to_s.downcase.include?(term) ||
        p["id"].to_s.downcase.include?(term) ||
        p["barcode"].to_s.downcase.include?(term) ||
        p["supplier"].to_s.downcase.include?(term)
      end
    end
    prods
  end

  def self.find_product_by_barcode(code)
    return nil if code.nil? || code.strip.empty?
    cleaned = code.strip.downcase
    store = load_store
    (store["products"] || []).find do |p|
      p["barcode"].to_s.downcase == cleaned || p["id"].to_s.downcase == cleaned
    end
  end

  def self.save_product(attrs)
    store = load_store
    prods = store["products"] || []
    barcode = attrs["barcode"].to_s.strip
    edit_id = attrs["id"].to_s.strip

    # Duplicate Barcode Check
    dup = prods.find { |p| p["barcode"].to_s.downcase == barcode.downcase && p["id"].to_s != edit_id }
    if dup
      return { "success" => false, "error" => "Barcode '#{barcode}' already assigned to product '#{dup['name']}' (#{dup['id']})." }
    end

    if edit_id && !edit_id.empty?
      idx = prods.find_index { |p| p["id"].to_s == edit_id }
      if idx
        attrs["lastUpdated"] = "Just now"
        prods[idx] = prods[idx].merge(attrs)
        store["products"] = prods
        save_store(store)
        return { "success" => true, "product" => prods[idx], "action" => "updated" }
      end
    end

    # Create new
    cat_prefix = (attrs["category"] || "GEN").split(' ').first[0..2].upcase
    new_sku = attrs["id"] && !attrs["id"].empty? ? attrs["id"] : "SKU-#{cat_prefix}-#{rand(100..999)}"
    new_doc = attrs.merge({
      "_id" => "prod_" + SecureRandom.hex(6),
      "id" => new_sku,
      "availableQuantity" => attrs["availableQuantity"].to_i,
      "minThreshold" => attrs["minThreshold"].to_i,
      "unitPrice" => attrs["unitPrice"].to_f,
      "purchaseCost" => attrs["purchaseCost"].to_f,
      "lastUpdated" => "Just now",
      "createdAt" => Time.now.iso8601
    })
    prods.push(new_doc)
    store["products"] = prods

    # Add transaction log
    add_transaction_internal(store, {
      "sku" => new_sku,
      "productName" => new_doc["name"],
      "change" => "+#{new_doc['availableQuantity']}",
      "resultingStock" => new_doc["availableQuantity"],
      "opType" => "NEW_REGISTRATION",
      "reason" => "Catalog Onboarding"
    })

    save_store(store)
    { "success" => true, "product" => new_doc, "action" => "created" }
  end

  def self.adjust_stock(sku_id, delta, reason = "Manual Adjustment")
    store = load_store
    prods = store["products"] || []
    prod = prods.find { |p| p["id"] == sku_id || p["barcode"] == sku_id }
    return { "success" => false, "error" => "Product not found" } unless prod

    new_stock = [0, prod["availableQuantity"].to_i + delta.to_i].max
    prod["availableQuantity"] = new_stock
    prod["lastUpdated"] = "Just now"

    # Log transaction
    tx = add_transaction_internal(store, {
      "sku" => prod["id"],
      "productName" => prod["name"],
      "change" => (delta > 0 ? "+#{delta}" : delta.to_s),
      "resultingStock" => new_stock,
      "opType" => delta > 0 ? "STOCK_INCREMENT" : "STOCK_DECREMENT",
      "reason" => reason
    })

    # Trigger threshold notification if needed
    notif = nil
    if new_stock <= prod["minThreshold"].to_i && new_stock > 0
      notif = add_notification_internal(store, {
        "title" => "🚨 Low Stock Alert: #{prod['name']}",
        "message" => "Stock dropped to #{new_stock} units (below threshold #{prod['minThreshold']}). Immediate replenishment PO recommended.",
        "severity" => "critical",
        "category" => "inventory",
        "skuId" => prod["id"]
      })
    elsif new_stock == 0
      notif = add_notification_internal(store, {
        "title" => "⛔ Out of Stock: #{prod['name']}",
        "message" => "Stock is depleted (0 units). Emergency restock triggered from regional dark-store hub.",
        "severity" => "critical",
        "category" => "inventory",
        "skuId" => prod["id"]
      })
    elsif delta > 0
      notif = add_notification_internal(store, {
        "title" => "✅ Stock Inward Verified: #{prod['name']}",
        "message" => "Successfully inwarded +#{delta} units. Available inventory: #{new_stock} units.",
        "severity" => "success",
        "category" => "inventory",
        "skuId" => prod["id"]
      })
    end

    save_store(store)
    {
      "success" => true,
      "product" => prod,
      "transaction" => tx,
      "notification" => notif
    }
  end

  def self.delete_product(sku_id)
    store = load_store
    prods = store["products"] || []
    target = prods.find { |p| p["id"] == sku_id || p["barcode"] == sku_id }
    return { "success" => false, "error" => "Product not found" } unless target

    store["products"] = prods.reject { |p| p["id"] == target["id"] }
    add_transaction_internal(store, {
      "sku" => target["id"],
      "productName" => target["name"],
      "change" => "-#{target['availableQuantity']}",
      "resultingStock" => 0,
      "opType" => "PRODUCT_DELETED",
      "reason" => "Master Catalog Removal"
    })
    save_store(store)
    { "success" => true, "deletedSku" => target["id"] }
  end

  # Transactions
  def self.get_transactions
    store = load_store
    store["inventory_transactions"] || []
  end

  # Notifications
  def self.get_notifications(filter = 'all')
    store = load_store
    list = store["notifications"] || []
    case filter
    when 'unread'
      list.reject { |n| n["read"] }
    when 'critical'
      list.select { |n| n["severity"] == "critical" }
    when 'inventory'
      list.select { |n| n["category"] == "inventory" }
    else
      list
    end
  end

  def self.add_notification(attrs)
    store = load_store
    notif = add_notification_internal(store, attrs)
    save_store(store)
    notif
  end

  def self.mark_notification_read(id)
    store = load_store
    list = store["notifications"] || []
    if id == "all"
      list.each { |n| n["read"] = true }
    else
      target = list.find { |n| n["id"] == id || n["_id"] == id }
      target["read"] = true if target
    end
    store["notifications"] = list
    save_store(store)
    { "success" => true }
  end

  def self.clear_notifications
    store = load_store
    store["notifications"] = []
    save_store(store)
    { "success" => true }
  end

  # Business Data
  def self.get_business_data
    store = load_store
    store["business_data"]
  end

  def self.save_business_data(data)
    store = load_store
    rev = data["revenue"].to_f
    orders = [data["orders"].to_i, 1].max
    del_cost = data["deliveryCost"].to_f
    rent = data["rent"].to_f
    staffing = data["staffing"].to_f
    wastage = data["wastage"].to_f
    private_label = data["privateLabel"].to_f

    cogs = (rev * 0.65) - (private_label * 0.15)
    total_expenses = cogs + del_cost + rent + staffing + wastage
    cm = rev - total_expenses
    cm_pct = rev > 0 ? ((cm / rev) * 100).round(2) : 0.0
    cmpo = (cm / orders).round(2)

    doc = {
      "_id" => "biz_" + SecureRandom.hex(6),
      "revenue" => rev,
      "orders" => orders,
      "deliveryCost" => del_cost,
      "rent" => rent,
      "staffing" => staffing,
      "wastage" => wastage,
      "privateLabel" => private_label,
      "isDemo" => !!data["isDemo"],
      "calculatedCM" => cm.round(2),
      "calculatedCMPO" => cmpo,
      "calculatedCMPct" => cm_pct,
      "updatedAt" => Time.now.iso8601
    }
    store["business_data"] = doc

    add_notification_internal(store, {
      "title" => "Business Model Updated in MongoDB",
      "message" => "Operational parameters updated: Revenue ₹#{(rev / 10000000).round(2)} Cr, CMPO ₹#{cmpo} (#{cm_pct}% CM).",
      "severity" => "success",
      "category" => "business"
    })

    save_store(store)
    doc
  end

  def self.save_stores(stores, filename = 'ProfitPulse_AI_Store_Data_Entry(1).xlsx')
    store = load_store
    existing = store['stores'] || []

    # Use Store_ID and Reporting_Period as composite uniqueness criteria
    incoming_keys = {}
    stores.each do |s|
      key = "#{s['id']}__#{s['period'] || '2026-10'}"
      incoming_keys[key] = s
    end

    # Keep existing records that do not match incoming (Store_ID, Reporting_Period)
    preserved = existing.reject do |s|
      key = "#{s['id']}__#{s['period'] || '2026-10'}"
      incoming_keys.key?(key)
    end

    merged_stores = preserved + stores
    store['stores'] = merged_stores
    store['_meta']['lastSyncedAt'] = Time.now.iso8601
    store['_meta']['activeDataset'] = filename
    store['_meta']['storeCount'] = merged_stores.length
    store['_meta']['reportingPeriod'] = '2026-10'

    add_notification_internal(store, {
      "title" => "Company Dataset Imported (#{stores.length} Stores)",
      "message" => "Successfully imported '#{filename}' with #{stores.length} dark-store records for October 2026 into MongoDB Atlas store.",
      "severity" => "success",
      "category" => "business"
    })

    save_store(store)
    { "success" => true, "storesCount" => merged_stores.length, "lastSyncedAt" => store['_meta']['lastSyncedAt'] }
  end

  def self.get_stores
    store = load_store
    store['stores'] || []
  end

  private

  def self.add_transaction_internal(store, attrs)
    list = store["inventory_transactions"] || []
    doc = attrs.merge({
      "_id" => "tx_" + SecureRandom.hex(6),
      "id" => "tx-#{Date.today.strftime('%m%d')}-#{rand(1000..9999)}",
      "timestamp" => Time.now.strftime("%I:%M:%S %p"),
      "createdAt" => Time.now.iso8601
    })
    list.unshift(doc)
    store["inventory_transactions"] = list.first(100)
    doc
  end

  def self.add_notification_internal(store, attrs)
    list = store["notifications"] || []
    doc = attrs.merge({
      "_id" => "notif_" + SecureRandom.hex(6),
      "id" => "notif-#{Time.now.to_i}-#{rand(100..999)}",
      "timestamp" => Time.now.iso8601,
      "read" => false
    })
    list.unshift(doc)
    store["notifications"] = list.first(50)
    doc
  end
end

// 📦 NEW server.js (aligned to frontend flow)

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    password: "demo",
    database: "shopping_db"
  }
});

const app = express();
const PORT = 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: "myshop_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set true if using HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // ✅ 7 days session cookie
  }
}));


app.get("/api/me", async (req, res) => {
  try {
    if (req.session.customerId) {
      const customer = await db("customer").where({ customerid: req.session.customerId }).first();
      if (!customer) return res.status(404).send("Customer not found");
      return res.json({ name: `${customer.first_name} ${customer.last_name}`, type: "customer" });
    }

    if (req.session.staffId) {
      const staff = await db("staff").where({ staffid: req.session.staffId }).first();
      if (!staff) return res.status(404).send("Staff not found");
      return res.json({ name: `${staff.first_name} ${staff.last_name}`, type: "staff" });
    }

    res.status(401).send("Not logged in");
  } catch (err) {
    console.error("❌ Error in /api/me:", err.message);
    res.status(500).send("Failed to fetch session info");
  }
});

// --- Authentication APIs ---
// Corrected /api/signup route
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    
    // Check if email already exists
    const existing = await db("customer").where({ email }).first();
    if (existing) {
      return res.status(409).json({ message: "Email is already registered. Please login or use another email." });
    }

    // Insert new customer
    const [customer] = await db("customer")
      .insert({ email, password, first_name, last_name })
      .returning(["customerid", "first_name", "last_name"]);

    req.session.customerId = customer.customerid;

    res.json({ name: `${customer.first_name} ${customer.last_name}` });

  } catch (err) {
    console.error("Signup backend error:", err.message);
    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
});

// Corrected /api/login route
app.post("/api/login", async (req, res) => {
  try {
    console.log("🔵 Received login request:", req.body);

    const { email, password } = req.body;

    const user = await db("customer") // ✅ Table name lowercase
      .where({ email: email, password: password }) // ✅ Column names lowercase
      .first();

    console.log("🔵 User fetched from DB:", user);

    if (!user) {
      console.log("🔴 Invalid login credentials");
      return res.status(401).send("Invalid credentials");
    }

    req.session.customerId = user.customerid; // ✅ Lowercase

    console.log("✅ Session customerId set:", req.session.customerId);

    res.json({ 
      name: `${user.first_name} ${user.last_name}` // ✅ Lowercase
    });

  } catch (err) {
    console.error("❌ Error during login:", err.message || err);
    res.status(500).send("Login failed");
  }
});


app.post("/api/logout", (req, res) => {
  req.session.destroy();
  res.send("Logged out");
});

// --- Products APIs ---
app.get("/api/products", async (req, res) => {
  try {
    const products = await db("product");
    res.json(products);
  } catch (err) {
    res.status(500).send("Failed to get products");
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await db("product").where({ productid: req.params.id }).first();
    if (!product) return res.status(404).send("Product not found");
    res.json(product);
  } catch (err) {
    res.status(500).send("Failed to get product");
  }
});

// --- Cart APIs ---
app.post("/api/cart", async (req, res) => {
  try {
    console.log("🛒 Add to Cart Request Body:", req.body);
    console.log("🛒 Session Data:", req.session);

    if (!req.session.customerId) return res.status(401).send("Not logged in");

    const { productid, quantity } = req.body;
    const existing = await db("shopping_cart").where({ cartid: req.session.customerId, productid }).first();
    if (existing) {
      await db("shopping_cart").where({ cartid: req.session.customerId, productid }).update({ buy_amount: existing.buy_amount + quantity });
    } else {
      await db("shopping_cart").insert({ cartid: req.session.customerId, productid, buy_amount: quantity });
    }
    res.send("Cart updated");
  } catch (err) {
    console.error("❌ Error adding to cart:", err.message || err);
    res.status(500).send("Failed to update cart");
  }
});

app.get("/api/cart", async (req, res) => {
  try {
    if (!req.session.customerId) {
      console.log("❌ No customer logged in");
      return res.status(401).send("Not logged in");
    }

    const cartItems = await db("shopping_cart")
      .where({ cartid: req.session.customerId });

    console.log("🛒 Cart items fetched for customer:", req.session.customerId, cartItems);

    res.json(cartItems);
  } catch (err) {
    console.error("❌ Error fetching cart:", err.message || err);
    res.status(500).send("Failed to fetch cart");
  }
});

app.put("/api/cart/:productid", async (req, res) => {
  try {
    if (!req.session.customerId) return res.status(401).send("Not logged in");

    const { quantity } = req.body;
    const { productid } = req.params;

    if (quantity <= 0) {
      return res.status(400).send("Quantity must be greater than 0");
    }

    const updated = await db("shopping_cart")
      .where({ cartid: req.session.customerId, productid })
      .update({ buy_amount: quantity });

    if (updated === 0) {
      return res.status(404).send("Cart item not found");
    }

    res.send("Cart quantity updated");
  } catch (err) {
    console.error("❌ Error updating cart quantity:", err.message || err);
    res.status(500).send("Failed to update cart quantity");
  }
});

app.delete("/api/cart/:productid", async (req, res) => {
  try {
    if (!req.session.customerId) return res.status(401).send("Not logged in");

    const { productid } = req.params;

    await db("shopping_cart")
      .where({ cartid: req.session.customerId, productid })
      .del();

    res.send("Item removed from cart");
  } catch (err) {
    console.error("❌ Error removing item from cart:", err.message || err);
    res.status(500).send("Failed to remove item from cart");
  }
});

// --- Checkout APIs ---
app.post("/api/checkout", async (req, res) => {
  const trx = await db.transaction();
  try {
    if (!req.session.customerId) return res.status(401).send("Not logged in");
    const { addressid, card_number, deliverytype } = req.body;
    const cartItems = await trx("shopping_cart").where({ cartid: req.session.customerId });
    if (cartItems.length === 0) return res.status(400).send("Cart is empty");

    const orderid = Math.floor(Date.now() / 1000);

    await trx("order").insert({ orderid, cartid: req.session.customerId, card_num: card_number, status: "processing", date: new Date().toISOString() });

    for (const item of cartItems) {
      await trx("orderitem").insert({ orderid, productid: item.productid, buy_amount: item.buy_amount });
      await trx("stock").where({ productid: item.productid }).decrement("quantity", item.buy_amount);
    }

    await trx("delivery").insert({ deliveryid: orderid, orderid, addressid, delivery_type: deliverytype, delivery_price: deliverytype === "Express" ? 9.99 : 0, ship_date: new Date().toISOString(), delivery_date: new Date(Date.now() + 5 * 86400000).toISOString() });

    await trx("shopping_cart").where({ cartid: req.session.customerId }).del();

    await trx.commit();
    res.send("Order placed successfully");
  } catch (err) {
    await trx.rollback();
    res.status(500).send("Checkout failed");
  }
});

// === Get all addresses ===
app.get("/api/addresses", async (req, res) => {
  try {
    if (!req.session.customerId) return res.status(401).send("Not logged in");

    const addresses = await db("address")
      .where("customerid", req.session.customerId);

    res.json(addresses);
  } catch (err) {
    console.error("❌ Error fetching addresses:", err.message);
    res.status(500).send("Failed to fetch addresses");
  }
});

// === Add a new address ===
app.post("/api/addresses", async (req, res) => {
  try {
    if (!req.session.customerId) return res.status(401).send("Not logged in");

    const { street_1, street_2, city, state, zip } = req.body;

    const [newAddress] = await db("address")
      .insert({
        street_1,
        street_2,
        city,
        state,
        zip_code: zip,
        customerid: req.session.customerId // ✅ Associate address with customer
      })
      .returning(["addressid"]);

    res.status(201).json({ message: "Address saved successfully", addressid: newAddress.addressid });
  } catch (err) {
    console.error("❌ Error adding address:", err.message);
    res.status(500).send("Failed to add address");
  }
});

// === Update an address ===
app.put("/api/addresses/:addressid", async (req, res) => {
  try {
    if (!req.session.customerId) return res.status(401).send("Not logged in");

    const { street_1, street_2, city, state, zip } = req.body;
    const { addressid } = req.params;

    const result = await db("address")
      .where({ addressid, customerid: req.session.customerId })
      .update({
        street_1,
        street_2,
        city,
        state,
        zip_code: zip
      });

    if (result === 0) {
      return res.status(404).send("Address not found or not authorized");
    }

    res.send("Address updated successfully");
  } catch (err) {
    console.error("❌ Error updating address:", err.message);
    res.status(500).send("Failed to update address");
  }
});

// === Delete an address ===
app.delete("/api/addresses/:addressid", async (req, res) => {
  try {
    if (!req.session.customerId) return res.status(401).send("Not logged in");

    const { addressid } = req.params;

    const result = await db("address")
      .where({ addressid, customerid: req.session.customerId })
      .del();

    if (result === 0) {
      return res.status(404).send("Address not found or not authorized");
    }

    res.send("Address deleted successfully");
  } catch (err) {
    console.error("❌ Error deleting address:", err.message);
    res.status(500).send("Failed to delete address");
  }
});

// === Get all cards ===
app.get("/api/cards", async (req, res) => {
  try {
    if (!req.session.customerId) return res.status(401).send("Not logged in");

    const cards = await db("creditcard")
      .where({ customerid: req.session.customerId });

    res.json(cards);
  } catch (err) {
    console.error("❌ Error fetching cards:", err.message);
    res.status(500).send("Failed to fetch cards");
  }
});

// === Add a new credit card ===
app.post("/api/cards", async (req, res) => {
  try {
    if (!req.session.customerId) return res.status(401).send("Not logged in");

    const { card_number, expiry_date, addressid, cardholder_name, cvv } = req.body;

    await db("creditcard").insert({
      card_number,
      customerid: req.session.customerId,
      expiry_date,
      addressid,
      cardholder_name,
      cvv
    });

    res.status(201).json({ message: "Card added successfully" });
  } catch (err) {
    console.error("❌ Error adding card:", err.message);
    res.status(500).send("Failed to add card");
  }
});


// === Update a credit card ===
app.put("/api/cards/:card_number", async (req, res) => {
  try {
    if (!req.session.customerId) return res.status(401).send("Not logged in");

    const { expiry_date, addressid, cardholder_name, cvv } = req.body;
    const { card_number } = req.params;

    const result = await db("creditcard")
      .where({ card_number, customerid: req.session.customerId })
      .update({
        expiry_date,
        addressid,
        cardholder_name,
        cvv
      });

    if (result === 0) {
      return res.status(404).send("Card not found or not authorized");
    }

    res.send("Card updated successfully");
  } catch (err) {
    console.error("❌ Error updating card:", err.message);
    res.status(500).send("Failed to update card");
  }
});


// === Delete a credit card ===
app.delete("/api/cards/:card_number", async (req, res) => {
  try {
    if (!req.session.customerId) return res.status(401).send("Not logged in");

    const { card_number } = req.params;

    const result = await db("creditcard")
      .where({ card_number, customerid: req.session.customerId })
      .del();

    if (result === 0) {
      return res.status(404).send("Card not found or not authorized");
    }

    res.send("Card deleted successfully");
  } catch (err) {
    console.error("❌ Error deleting card:", err.message);
    res.status(500).send("Failed to delete card");
  }
});

app.post('/api/products', async (req, res) => {
  const { name, price, category, brand, size, description } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Missing required fields: name, price' });
  }

  try {
    // Get the max existing product ID
    const maxIdRow = await db("product").max("productid as max").first();
    const nextProductId = (maxIdRow.max || 0) + 1;

    // Insert new product with auto-generated ID
    await db("product").insert({
      productid: nextProductId,
      name,
      price,
      category,
      brand,
      size,
      description
    });

    res.status(201).json({ message: "✅ Product added successfully", productid: nextProductId });
  } catch (err) {
    console.error("❌ Error adding product:", err.message);
    res.status(500).json({ message: "Error adding product", error: err.message });
  }
});

app.put('/api/products/:productid', async (req, res) => {
  const { productid } = req.params;
  const { name, price, category, brand, size, description } = req.body;

  try {
    console.log(`✏️ Updating product ${productid}:`, req.body);

    const updated = await db('product')
      .where({ productid })
      .update({
        name,
        price,
        category,
        brand,
        size,
        description
      });

    if (updated === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: '✅ Product updated successfully' });
  } catch (err) {
    console.error('❌ Error updating product:', err.message);
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
});


app.delete('/api/products/:productid', async (req, res) => {
  const { productid } = req.params;

  try {
    console.log(`🗑️ Deleting product with ID: ${productid}`);

    const deleted = await db('product')
      .where({ productid })
      .del();

    if (deleted === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: '✅ Product deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting product:', err.message);
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
});

app.post("/api/staff/login", async (req, res) => {
  try {
    const { staffid, password } = req.body;
    const staff = await db("staff").where({ staffid, password }).first();

    if (!staff) return res.status(401).send("Invalid staff credentials");

    req.session.staffId = staff.staffid;
    res.json({ message: "Staff login successful", staffId: staff.staffid });
  } catch (err) {
    console.error("❌ Staff login error:", err.message);
    res.status(500).send("Staff login failed");
  }
});

app.post('/api/stock/update', async (req, res) => {
  const { productid, warehouseid, addedQuantity } = req.body;

  if (!productid || !warehouseid || isNaN(addedQuantity)) {
    return res.status(400).json({ message: 'Missing or invalid fields' });
  }

  try {
    const existingStock = await db("stock")
      .where({ productid, warehouseid })
      .first();

    if (existingStock) {
      await db("stock")
        .where({ productid, warehouseid })
        .increment("quantity", addedQuantity);
    } else {
      await db("stock").insert({
        productid,
        warehouseid,
        quantity: addedQuantity
      });
    }

    res.json({ message: '✅ Stock updated successfully' });
  } catch (err) {
    console.error("❌ Error updating stock:", err.message);
    res.status(500).json({ message: 'Error updating stock' });
  }
});

// --- Start server ---
app.listen(3001, () => {
  console.log("✅ Server running on http://localhost:3001");
});
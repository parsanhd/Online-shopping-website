const { Client } = require("pg");

const client = new Client({
  host: "localhost",
  user: "postgres",
  password: "TEST",
  database: "Project",
  port: 5432,
  connectionTimeoutMillis: 5000 // 5 seconds timeout
});

(async () => {
  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL");

    const res = await client.query("SELECT NOW()");
    console.log("🕒 Server time:", res.rows[0]);

    await client.end();
  } catch (err) {
    console.error("❌ Connection error:", err.message || err);
  }
})();

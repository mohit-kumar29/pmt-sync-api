import express from "express";
import mysql from "mysql2/promise";

const app = express();
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

// MySQL pool
const pool = mysql.createPool({
  host: "mysql-14658c9c-mohitk93540-9651.d.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_L3Sq8CJHnfAyLSpE5UF",
  database: "defaultdb",
  port: 17856,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 5
});

// Test DB
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS test");
    res.json({ success: true, result: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sync endpoint
app.post("/sync", async (req, res) => {
  try {
    const rows = req.body.rows || [];

    if (!rows.length) {
      return res.json({ status: "no data received" });
    }

    const sql = `
INSERT INTO pmt_data (
LABEL,SITE_TYPE,LAST_PMT_DONE_ON,SCHEDULE_DATE,SESSION_DAY_OR_NIGHT,
M6_LOCATION,PMT_STATUS,HELP_DESK_REMARK,CRQ_NUMBER,CRQ_RAISED_DATE,
CRQ_RAISED_BY,CRQ_STATUS,CANCELLATION_REMARK,CUSTOMER_NAME_AND_NUMBER,
REPORT_UPLOADED,APPROVAL_STATUS,OLD_EMAIL_SENT_DATE,NEW_EMAIL_SENT_DATE,
EMAIL_SENT_BY,ENGINEER_NAME,ENGINEER_NUMBER,PRODUCT_NAME,CITY,STATE,
WORK_AREA,TNG_CIRCLE,FINAL_TIER,LOCATION_ADDRESS,ADDRESS_COUNT,TEAM_LEADER
)
VALUES ?
`;

    const conn = await pool.getConnection();
    await conn.query(sql, [rows]);
    conn.release();

    res.json({ status: "ok", inserted: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on port", PORT));

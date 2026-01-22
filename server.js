import express from "express";
import mysql from "mysql2/promise";

const app = express();
app.use(express.json({ limit: "10mb" }));


const pool = mysql.createPool({
  host: "bzksakfqv7kdpsnpv6iv-mysql.services.clever-cloud.com",
  user: "uvfyagtdrmgbenqi",
  password: "fENWanJkBynN9V4zUdj",
  database: "bzksakfqv7kdpsnpv6iv",
  port: 3306,

  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 5
});



// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

// Test DB
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS test");
    res.json({ success: true, result: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});



app.post("/sync", async (req, res) => {
  try {
    const rows = req.body.rows || [];

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
ON DUPLICATE KEY UPDATE
SITE_TYPE=VALUES(SITE_TYPE),
LAST_PMT_DONE_ON=VALUES(LAST_PMT_DONE_ON),
SCHEDULE_DATE=VALUES(SCHEDULE_DATE),
SESSION_DAY_OR_NIGHT=VALUES(SESSION_DAY_OR_NIGHT),
M6_LOCATION=VALUES(M6_LOCATION),
PMT_STATUS=VALUES(PMT_STATUS),
HELP_DESK_REMARK=VALUES(HELP_DESK_REMARK),
CRQ_NUMBER=VALUES(CRQ_NUMBER),
CRQ_RAISED_DATE=VALUES(CRQ_RAISED_DATE),
CRQ_RAISED_BY=VALUES(CRQ_RAISED_BY),
CRQ_STATUS=VALUES(CRQ_STATUS),
CANCELLATION_REMARK=VALUES(CANCELLATION_REMARK),
CUSTOMER_NAME_AND_NUMBER=VALUES(CUSTOMER_NAME_AND_NUMBER),
REPORT_UPLOADED=VALUES(REPORT_UPLOADED),
APPROVAL_STATUS=VALUES(APPROVAL_STATUS),
OLD_EMAIL_SENT_DATE=VALUES(OLD_EMAIL_SENT_DATE),
NEW_EMAIL_SENT_DATE=VALUES(NEW_EMAIL_SENT_DATE),
EMAIL_SENT_BY=VALUES(EMAIL_SENT_BY),
ENGINEER_NAME=VALUES(ENGINEER_NAME),
ENGINEER_NUMBER=VALUES(ENGINEER_NUMBER),
PRODUCT_NAME=VALUES(PRODUCT_NAME),
CITY=VALUES(CITY),
STATE=VALUES(STATE),
WORK_AREA=VALUES(WORK_AREA),
TNG_CIRCLE=VALUES(TNG_CIRCLE),
FINAL_TIER=VALUES(FINAL_TIER),
LOCATION_ADDRESS=VALUES(LOCATION_ADDRESS),
ADDRESS_COUNT=VALUES(ADDRESS_COUNT),
TEAM_LEADER=VALUES(TEAM_LEADER)
`;

    const conn = await pool.getConnection();
    await conn.query(sql, [rows]);
    conn.release();

    res.json({ status: "ok", rows: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("PMT Sync API is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on port", PORT));






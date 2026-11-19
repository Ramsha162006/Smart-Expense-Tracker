const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST || "mysqldb",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "SmartExpenseTracker",
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});



db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
        return;
    }

    console.log("MySQL connected successfully!");
});

module.exports = db;
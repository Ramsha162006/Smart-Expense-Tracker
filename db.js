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

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(100) NOT NULL,
            date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(createTableQuery, (tableErr) => {
        if (tableErr) {
            console.error("Failed to ensure expenses table:", tableErr);
        } else {
            console.log("Expenses table verified/created successfully!");
        }
    });
});

module.exports = db;

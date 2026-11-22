require("dotenv").config();
const redisClient = require("./redisClient");
const express = require("express");

const db = require("./db");

const app = express();
app.use(express.static("public"));
app.use (express.json());
const PORT = process.env.PORT || 3000;

const CACHE_KEY = "all_expenses";

// 1. GET ALL EXPENSES (Cache-Aside Pattern)
app.get("/expenses", async (req, res) => {
    try {
        if (redisClient.isOpen) {
            const cachedExpenses = await redisClient.get(CACHE_KEY);
            if (cachedExpenses) {
                console.log("⚡ Cache HIT: Serving expenses from Redis");
                return res.json(JSON.parse(cachedExpenses));
            }
        }
    } catch (cacheErr) {
        console.log("Redis read error, falling back to MySQL:", cacheErr);
    }

    console.log("🐢 Cache MISS: Fetching expenses from MySQL");
    const sql = "SELECT * FROM expenses";

    db.query(sql, async (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }

        try {
            if (redisClient.isOpen) {
                await redisClient.setEx(CACHE_KEY, 60, JSON.stringify(result));
            }
        } catch (cacheErr) {
            console.log("Redis write error:", cacheErr);
        }

        res.json(result);
    });
});

// 2. ADD EXPENSE (With Cache Invalidation)
app.post("/expenses", (req, res) => {
    const { amount, category, description, expense_date } = req.body;

    if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
    }
    if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    if (!category || category.trim() === "") {
        return res.status(400).json({ message: "Category is required" });
    }
    if (!expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(expense_date)) {
        return res.status(400).json({ message: "Expense date must be in YYYY-MM-DD format" });
    }

    const sql = `
        INSERT INTO expenses
        (amount, category, description, expense_date)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [amount, category, description, expense_date], async (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }

        if (redisClient.isOpen) {
            await redisClient.del(CACHE_KEY);
            console.log("🗑️ Cache Invalidated after POST");
        }

        res.json({
            message: "Expense added successfully",
            expense_id: result.insertId
        });
    });
});

// 3. GET SINGLE EXPENSE BY ID
app.get("/expenses/:id", (req, res) => {
    const sql = "SELECT * FROM expenses WHERE expense_id = ?";

    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Expense not found" });
        }
        res.json(result);
    });
});

// 4. DELETE EXPENSE (With Cache Invalidation)
app.delete("/expenses/:id", (req, res) => {
    const sql = "DELETE FROM expenses WHERE expense_id = ?";
    db.query(sql, [req.params.id], async (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Expense not found" });
        }

        if (redisClient.isOpen) {
            await redisClient.del(CACHE_KEY);
            console.log("🗑️ Cache Invalidated after DELETE");
        }

        res.json({ message: "Expense deleted successfully" });
    });
});

// 5. UPDATE EXPENSE (With Cache Invalidation)
app.put("/expenses/:id", (req, res) => {
    const { amount, category, description, expense_date } = req.body;
    if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
    }
    if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    if (!category || category.trim() === "") {
        return res.status(400).json({ message: "Category is required" });
    }
    if (!expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(expense_date)) {
        return res.status(400).json({ message: "Expense date must be in YYYY-MM-DD format" });
    }

    const sql = `
        UPDATE expenses
        SET amount = ?,
        category = ?,
        description = ?,
        expense_date = ?
        WHERE expense_id = ?;
    `;
    db.query(sql, [amount, category, description, expense_date, req.params.id], async (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Expense not found" });
        }

        if (redisClient.isOpen) {
            await redisClient.del(CACHE_KEY);
            console.log("🗑️ Cache Invalidated after PUT");
        }

        res.json({ message: "Expense updated successfully" });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
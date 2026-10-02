require("dotenv").config();
const express = require("express");

const db = require("./db");

const app = express();
app.use(express.static("public"));
app.use (express.json());
const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Smart Expense Tracker Backend Working!");
});

app.get("/expenses", (req, res) => {

    const sql = "SELECT * FROM expenses";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }
        
        res.json(result);
    });
});

app.post("/expenses", (req, res) => {

    const { amount, category, description, expense_date } = req.body;

    if (!amount) {
    return res.status(400).json({
        message: "Amount is required"
    });
}

if (amount <= 0) {
    return res.status(400).json({
        message: "Amount must be greater than 0"
    });
}

    if (!category || category.trim() === "") {
    return res.status(400).json({
        message: "Category is required"
    });
}

if (!expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(expense_date)) {
    return res.status(400).json({
        message: "Expense date must be in YYYY-MM-DD format"
    });
}

    const sql = `
        INSERT INTO expenses
        (amount, category, description, expense_date)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
    sql,
    [amount, category, description, expense_date],
    (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }

        res.json({
            message: "Expense added successfully",
            expense_id: result.insertId
        });
    }
    );
});

app.get("/expenses/:id", (req, res) => {

    const sql = "SELECT * FROM expenses WHERE expense_id = ?";

    db.query(sql, [req.params.id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.json(result);
    });
});


app.delete("/expenses/:id",(req,res) =>{
    const sql = "DELETE FROM expenses WHERE expense_id = ?";
    db.query(sql, [req.params.id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }
        
        if (result.affectedRows === 0) {
        return res.status(404).json({
        message: "Expense not found"
        });
        }

       res.json({
            message: "Expense deleted successfully"
        });
    });
})

app.put("/expenses/:id",(req,res) =>{
    const { amount, category, description, expense_date } = req.body;
        if (!amount) {
        return res.status(400).json({
            message: "Amount is required"
        });
    }

    if (amount <= 0) {
        return res.status(400).json({
            message: "Amount must be greater than 0"
        });
    }

    if (!category || category.trim() === "") {
        return res.status(400).json({
            message: "Category is required"
        });
    }

    if (!expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(expense_date)) {
        return res.status(400).json({
            message: "Expense date must be in YYYY-MM-DD format"
        });
    }
    const sql = `
        UPDATE expenses
        SET amount = ?,
        category = ?,
        description = ?,
        expense_date = ?
        WHERE expense_id = ?;
    `;
    db.query(
    sql,
    [amount, category, description, expense_date,req.params.id],
    (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Database error");
        }
            if (result.affectedRows === 0) {
        return res.status(404).json({
        message: "Expense not found"
        });
        }
        res.json({
            message: "Expense updated successfully",
        });
    }
    );
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
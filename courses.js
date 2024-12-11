const express = require("express");
const pool = require("./db");

const router = express.Router();

// Search Courses
router.get("/search", async (req, res) => {
    const query = req.query.q.toLowerCase();
    try {
        const result = await pool.query(
            "SELECT * FROM courses WHERE LOWER(title) LIKE $1 OR LOWER(description) LIKE $1",
            [`%${query}%`]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

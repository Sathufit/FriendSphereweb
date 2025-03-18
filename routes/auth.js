const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const router = express.Router();

// ✅ **Admin Login Route**
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: "❌ Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "❌ Invalid credentials" });
        }

        // ✅ Generate Token
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: "❌ Server error", error: err.message });
    }
});

// ✅ **Test Route (Optional)**
router.get("/test", (req, res) => {
    res.send("Admin Auth API is working!");
});

module.exports = router;

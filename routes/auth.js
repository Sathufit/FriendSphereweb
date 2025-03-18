const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const router = express.Router();

// ✅ **Fix Login Route**
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log("🔍 Checking user:", username); // Debugging
        const admin = await Admin.findOne({ username });

        if (!admin) {
            console.log("❌ Admin not found!");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log("🔍 Stored Password Hash:", admin.password);

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.log("❌ Password does not match!");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log("✅ Password matched! Generating token...");

        const token = jwt.sign(
            { id: admin._id, isAdmin: true }, 
            process.env.JWT_SECRET, 
            { expiresIn: "2h" }
        );

        res.json({ token });
    } catch (err) {
        console.error("❌ Server error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

module.exports = router;

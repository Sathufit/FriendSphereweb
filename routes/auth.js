router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log("🔍 Checking user:", username); // ✅ Log input
        const admin = await Admin.findOne({ username });

        if (!admin) {
            console.log("❌ Admin not found!");
            return res.status(401).json({ message: "Invalid credentials - No admin found" });
        }

        console.log("🔍 Stored Hash in DB:", admin.password); // ✅ Check stored password

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.log("❌ Password does not match!");
            return res.status(401).json({ message: "Invalid credentials - Wrong password" });
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

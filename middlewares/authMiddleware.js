const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;

        // ✅ Only allow admin users
        if (!req.admin || !req.admin.isAdmin) {
            return res.status(403).json({ message: "Unauthorized. Admin access required." });
        }

        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

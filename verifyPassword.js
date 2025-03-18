require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

const checkPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const username = "Yamila";  
        const enteredPassword = "Yamila123";  

        // ✅ Fetch latest admin record
        const admin = await Admin.findOne({ username });
        if (!admin) {
            console.log("❌ Admin user not found!");
            return;
        }

        console.log("📌 Stored Hash:", admin.password); // Debugging

        // ✅ Compare entered password with stored hash
        const isMatch = await bcrypt.compare(enteredPassword, admin.password);
        if (isMatch) {
            console.log("✅ Password is CORRECT!");
        } else {
            console.log("❌ Incorrect Password!");
        }

        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error checking password:", error);
        mongoose.connection.close();
    }
};

// ✅ Run the script
checkPassword();

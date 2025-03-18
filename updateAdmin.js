require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

const updateAdminPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const username = "Yamila"; 
        const newPassword = "Yamila123"; // Change to a new password

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const admin = await Admin.findOne({ username });
        if (!admin) {
            console.log("❌ Admin user not found!");
        } else {
            admin.password = hashedPassword;
            await admin.save();
            console.log("✅ Admin password updated successfully.");
        }

        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error updating admin password:", error);
        mongoose.connection.close();
    }
};

updateAdminPassword();

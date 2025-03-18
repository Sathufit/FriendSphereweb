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
        const newPassword = "Yamila123";  // ✅ The correct password

        // ✅ Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log("🔑 New Hashed Password:", hashedPassword);

        // ✅ Ensure we are updating the correct user
        const result = await Admin.findOneAndUpdate(
            { username },
            { $set: { password: hashedPassword } },
            { new: true }
        );

        if (result) {
            console.log("✅ Admin password updated successfully.");
        } else {
            console.log("❌ Admin user not found! Creating a new one...");
            const newAdmin = new Admin({ username, password: hashedPassword, isAdmin: true });
            await newAdmin.save();
            console.log("✅ New admin created successfully.");
        }

        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error updating admin password:", error);
        mongoose.connection.close();
    }
};

// ✅ Run the script
updateAdminPassword();

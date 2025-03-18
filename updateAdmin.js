require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

const updateOrCreateAdmin = async () => {
  try {
    // ✅ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const username = "Yamila"; // Change if needed
    const email = "yamiladilhara123@gmail.com"; // Ensure this matches your Postman input
    const plainPassword = "Yamila123"; // Change this to your desired password

    // ✅ Hash the password securely
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log("🔹 New Hashed Password:", hashedPassword); // Debugging purpose

    // ✅ Find the admin by email or username
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      // ✅ Update the password if the admin exists
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log("✅ Admin password updated successfully.");
    } else {
      // ✅ Create a new admin if none exists
      const newAdmin = new Admin({ username, email, password: hashedPassword });
      await newAdmin.save();
      console.log("✅ New admin created successfully.");
    }

    // ✅ Close MongoDB connection
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error updating/creating admin:", error);
    mongoose.connection.close();
  }
};

// ✅ Run the script
updateOrCreateAdmin();

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");


const app = express();
app.use(express.json());

// ✅ **Fix CORS Configuration**
const corsOptions = {
    origin: ["https://frontendcrickweb.onrender.com", "http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};
app.use(cors(corsOptions));

// ✅ **Connect to MongoDB Atlas**
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ **Define Mongoose Schemas**
const RunSchema = new mongoose.Schema({
    name: { type: String, required: true },
    venue: { type: String, required: true },
    runs: { type: Number, required: true },
    innings: { type: Number, required: true },
    outs: { type: Number, required: true },
    date: { type: String, required: true }
});

const WicketSchema = new mongoose.Schema({
    bowler_name: { type: String, required: true },
    venue: { type: String, required: true },
    wickets: { type: Number, required: true },
    innings: { type: Number, required: true },
    date: { type: String, required: true }
});

// ✅ **Create Mongoose Models**
const Run = mongoose.model("runs", RunSchema);
const Wicket = mongoose.model("wickets", WicketSchema);

// ✅ **API Routes**
app.get("/players/stats", async (req, res) => {
    try {
        const stats = await Run.aggregate([
            {
                $group: {
                    _id: "$name",
                    totalRuns: { $sum: "$runs" },
                    totalInnings: { $sum: "$innings" },
                    totalOuts: { $sum: "$outs" }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    totalRuns: 1,
                    totalInnings: 1,
                    totalOuts: 1,
                    average: {
                        $cond: {
                            if: { $gt: ["$totalOuts", 0] },
                            then: { $divide: ["$totalRuns", "$totalOuts"] },
                            else: "N/A"
                        }
                    }
                }
            },
            { $sort: { totalRuns: -1 } }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

app.get("/runs", async (req, res) => {
    try {
        const runs = await Run.find().select("name venue runs innings outs date");
        res.json(runs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/wickets", async (req, res) => {
    try {
        const wickets = await Wicket.find();
        res.json(wickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/runs", async (req, res) => {
    try {
        const { name, venue, runs, innings, outs, date } = req.body;
        if (!name || !venue || runs == null || innings == null || outs == null || !date) {
            return res.status(400).json({ message: "❌ All fields are required" });
        }

        const newRun = new Run({ name, venue, runs, innings, outs, date });
        await newRun.save();
        res.status(201).json({ message: "✅ Run added successfully", newRun });
    } catch (err) {
        res.status(500).json({ message: "❌ Server error", error: err.message });
    }
});

app.post("/wickets", async (req, res) => {
    try {
        const { bowler_name, venue, wickets, innings, date } = req.body;
        if (!bowler_name || !venue || wickets == null || innings == null || !date) {
            return res.status(400).json({ message: "❌ All fields are required" });
        }

        const newWicket = new Wicket({ bowler_name, venue, wickets, innings, date });
        await newWicket.save();
        res.status(201).json({ message: "✅ Wicket added successfully", newWicket });
    } catch (err) {
        res.status(500).json({ message: "❌ Server error", error: err.message });
    }
});

app.delete("/runs/:id", async (req, res) => {
    try {
        const deletedRun = await Run.findByIdAndDelete(req.params.id);
        if (!deletedRun) {
            return res.status(404).json({ message: "❌ Run not found" });
        }
        res.json({ message: "✅ Run deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/wickets/:id", async (req, res) => {
    try {
        const deletedWicket = await Wicket.findByIdAndDelete(req.params.id);
        if (!deletedWicket) {
            return res.status(404).json({ message: "❌ Wicket not found" });
        }
        res.json({ message: "✅ Wicket deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/runs/:id", async (req, res) => {
    try {
        const updatedRun = await Run.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRun) {
            return res.status(404).json({ message: "❌ Run not found" });
        }
        res.json({ message: "✅ Run updated successfully", updatedRun });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/wickets/:id", async (req, res) => {
    try {
        const updatedWicket = await Wicket.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedWicket) {
            return res.status(404).json({ message: "❌ Wicket not found" });
        }
        res.json({ message: "✅ Wicket updated successfully", updatedWicket });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ✅ **Serve Frontend for React Routes**
const frontendPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// ✅ **Start the server**
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

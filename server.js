require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ **Connect to MongoDB Atlas**
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ **Define Mongoose Schemas**
const RunSchema = new mongoose.Schema({
    name: { type: String, required: true },  // ✅ Ensure "name" field consistency
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

// ✅ **Get Player Stats**
app.get("/players/stats", async (req, res) => {
    try {
        const stats = await Run.aggregate([
            {
                $group: {
                    _id: "$name",  // ✅ Group by correct player name field
                    totalRuns: { $sum: "$runs" },
                    totalInnings: { $sum: "$innings" },
                    totalOuts: { $sum: "$outs" }
                }
            },
            {
                $project: {
                    _id: 0,  // ✅ Remove MongoDB ObjectID from output
                    name: "$_id",
                    totalRuns: 1,
                    totalInnings: 1,
                    totalOuts: 1,
                    average: {
                        $cond: {
                            if: { $gt: ["$totalOuts", 0] },
                            then: { $divide: ["$totalRuns", "$totalOuts"] }, // ✅ Fix calculation
                            else: "N/A"
                        }
                    }
                }
            },
            { $sort: { totalRuns: -1 } } // ✅ Sort players by total runs
        ]);

        console.log("📌 Player Stats (Backend):", stats); // ✅ Debugging log
        res.json(stats);
    } catch (error) {
        console.error("❌ Error fetching player stats:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ✅ **Fetch all runs**
app.get("/runs", async (req, res) => {
    try {
        const runs = await Run.find().select("name venue runs innings outs date");
        console.log("📌 Fetched Runs from DB:", runs);
        res.json(runs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ **Fetch all wickets**
app.get("/wickets", async (req, res) => {
    try {
        const wickets = await Wicket.find();
        res.json(wickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ **Add a new run**
app.post("/runs", async (req, res) => {
    try {
        console.log("📌 Incoming Request Body:", req.body); // ✅ Debugging log

        const { name, venue, runs, innings, outs, date } = req.body;

        if (!name || !venue || runs == null || innings == null || outs == null || !date) {
            return res.status(400).json({ message: "❌ All fields are required" });
        }

        const newRun = new Run({ name, venue, runs, innings, outs, date });
        await newRun.save();
        
        res.status(201).json({ message: "✅ Run added successfully", newRun });
    } catch (err) {
        console.error("❌ Error adding run:", err);
        res.status(500).json({ message: "❌ Server error", error: err.message });
    }
});


// ✅ **Add a new wicket**
app.post("/wickets", async (req, res) => {
    try {
        const { bowler_name, venue, wickets, innings, date } = req.body;

        if (!bowler_name || !venue || !wickets || !innings || !date) {
            return res.status(400).json({ message: "❌ All fields are required" });
        }

        const newWicket = new Wicket({ bowler_name, venue, wickets, innings, date });
        await newWicket.save();
        
        res.status(201).json({ message: "✅ Wicket added successfully", newWicket });
    } catch (err) {
        res.status(500).json({ message: "❌ Error adding wicket", error: err.message });
    }
});

// ✅ **Delete a run**
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

// ✅ **Delete a wicket**
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

// ✅ **Update a run**
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

// ✅ **Update a wicket**
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

// ✅ **Start the server**
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const Traffic = require("../models/Traffic");

// ================= RECEIVE DATA FROM PYTHON =================
exports.logTraffic = async (req, res) => {
  try {
    const { state, action, reward, type } = req.body;

    await Traffic.create({
      state,
      action,
      reward,
      type
    });

    res.json({ message: "Traffic data stored successfully" });
  } catch (err) {
    console.error("LOG ERROR:", err.message);
    res.status(500).json({ error: "Failed to store data" });
  }
};

// ================= COMPARISON =================
exports.getComparison = async (req, res) => {
  try {
    const rl = await Traffic.find({ type: "RL" });
    const fixed = await Traffic.find({ type: "FIXED" });

    const avg = (data) =>
      data.length === 0
        ? 0
        : data.reduce(
            (sum, d) => sum + d.state.reduce((a, b) => a + b, 0),
            0
          ) / data.length;

    res.json({
      RL_avg_queue: avg(rl),
      FIXED_avg_queue: avg(fixed)
    });
  } catch (err) {
    console.error("COMPARE ERROR:", err.message);
    res.status(500).json({ error: "Comparison error" });
  }
};
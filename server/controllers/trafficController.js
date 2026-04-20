const axios = require("axios");
const Traffic = require("../models/Traffic");

let current = 0;

// ================= RL SIGNAL =================
exports.getRLSignal = async (req, res) => {
  try {
    const { state } = req.body;

    // Call Python RL service
    const response = await axios.post("http://localhost:8000/get_signal", {
      state
    });

    const signal = response.data.signal;
    const action = signal === "NS_GREEN" ? 0 : 1;

    // Save to DB
    await Traffic.create({
      state,
      action,
      reward: -state.reduce((a, b) => a + b, 0),
      type: "RL"
    });

    res.json({ signal });
  } catch (err) {
    console.error("RL ERROR:", err.message);
    res.status(500).json({ error: "RL service error" });
  }
};

// ================= FIXED TIMER =================
exports.getFixedSignal = async (req, res) => {
  try {
    const { state } = req.body;

    current = 1 - current;

    const signal = current === 0 ? "NS_GREEN" : "EW_GREEN";

    // Save to DB
    await Traffic.create({
      state,
      action: current,
      reward: -state.reduce((a, b) => a + b, 0),
      type: "FIXED"
    });

    res.json({ signal });
  } catch (err) {
    console.error("FIXED ERROR:", err.message);
    res.status(500).json({ error: "Fixed signal error" });
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
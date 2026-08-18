import Traffic from "../models/Traffic.js";
import axios from "axios";

// ================= IN-MEMORY LIVE DATA =================
let liveData = {
  vehicles: [],
  signal: "NONE",
  reward: 0
};

// ================= RL SIGNAL =================
export const getRLSignal = async (req, res) => {
  try {
    const { traffic, light = 0, timeInPhase = 0 } = req.body;
    if (!Array.isArray(traffic) || traffic.length < 2) {
      return res.status(400).json({ error: "traffic must contain NS and EW queue counts" });
    }

    const nsQueue = Math.min(20, Math.max(0, Number(traffic[0]) + Number(traffic[1] || 0)));
    const ewQueue = Math.min(20, Math.max(0, Number(traffic[2] || 0) + Number(traffic[3] || 0)));

    const response = await axios.post("http://127.0.0.1:8000/predict", {
      ns_queue: nsQueue,
      ew_queue: ewQueue,
      light,
      time_in_phase: timeInPhase
    });

    const { action, signal } = response.data;
    const state = [nsQueue, ewQueue, light, timeInPhase];
    const reward = -(nsQueue + ewQueue);

    await Traffic.create({
      state: traffic,
      action: signal,
      reward,
      type: "RL"
    });

    res.json({
      type: "RL",
      signal,
      state,
      reward,
      action
    });

  } catch (err) {
    console.error("RL ERROR:", err.message);
    res.status(500).json({ error: "RL failed" });
  }
};

// ================= FIXED SIGNAL =================
export const getFixedSignal = async (req, res) => {
  try {
    const { traffic } = req.body;

    const signal = "NS_GREEN";
    const reward = -traffic.reduce((a, b) => a + b, 0);

    await Traffic.create({
      state: traffic,
      action: signal,
      reward,
      type: "FIXED"
    });

    res.json({
      type: "FIXED",
      signal,
      reward
    });

  } catch (err) {
    console.error("FIXED ERROR:", err.message);
    res.status(500).json({ error: "Fixed failed" });
  }
};

// ================= LOG =================
export const logTraffic = async (req, res) => {
  try {
    const { state, action, reward, type } = req.body;

    await Traffic.create({ state, action, reward, type });

    res.json({ message: "Traffic data stored successfully" });
  } catch (err) {
    console.error("LOG ERROR:", err.message);
    res.status(500).json({ error: "Failed to store data" });
  }
};

// ================= LIVE UPDATE (FROM PYTHON) =================
export const updateLive = (req, res) => {
  liveData = req.body;
  res.json({ message: "Live updated" });
};

// ================= LIVE FETCH (FOR UI) =================
export const getLive = (req, res) => {
  res.json(liveData);
};

// ================= COMPARISON =================
export const getComparison = async (req, res) => {
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

    const rlAvg = avg(rl);
    const fixedAvg = avg(fixed);

    res.json({
      RL_avg_queue: rlAvg,
      FIXED_avg_queue: fixedAvg,
      improvement:
        fixedAvg === 0
          ? "0%"
          : (((fixedAvg - rlAvg) / fixedAvg) * 100).toFixed(2) + "%"
    });

  } catch (err) {
    console.error("COMPARE ERROR:", err.message);
    res.status(500).json({ error: "Comparison error" });
  }
};

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the Q-table securely on the backend
const qTablePath = path.join(__dirname, '../config/q_table.json');
let qTable = null;
try {
  qTable = JSON.parse(fs.readFileSync(qTablePath, 'utf-8'));
  console.log("trafficSim: Q-table loaded securely.");
} catch (e) {
  console.error("trafficSim: Failed to load Q-table in server:", e);
}

class TrafficSimulation {
  constructor(io) {
    this.io = io;
    this.nsQueue = 0;
    this.ewQueue = 0;
    this.light = 0; // 0=NS, 1=EW
    this.cleared = 0;
    this.isRunning = false;
    this.tickRate = 800; // Simulated ms per step
    this.intervalId = null;
    this.spawnRate = 0.4;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), this.tickRate);
    this.broadcastState();
  }

  pause() {
    this.isRunning = false;
    if (this.intervalId) clearInterval(this.intervalId);
    this.broadcastState();
  }

  reset() {
    this.pause();
    this.nsQueue = 0;
    this.ewQueue = 0;
    this.light = 0;
    this.cleared = 0;
    this.broadcastState();
  }

  tick() {
    // 1. Give State to Agent (Capping visually to 10 max arrays bounds)
    const stateNs = Math.min(this.nsQueue, 10);
    const stateEw = Math.min(this.ewQueue, 10);

    let action = 0;
    if (qTable && qTable[stateNs] && qTable[stateNs][stateEw] && qTable[stateNs][stateEw][this.light]) {
      const actions = qTable[stateNs][stateEw][this.light];
      // Trained Action logic using argmax
      action = (actions[1] > actions[0]) ? 1 : 0;
    }

    // 2. Apply Agent Action
    let currentLight = this.light;
    if (action === 1) {
      currentLight = 1 - currentLight;
      this.light = currentLight;
    }

    // 3. Clear Traffic
    let trafficCleared = 0;
    if (currentLight === 0 && this.nsQueue > 0) {
      this.nsQueue--;
      trafficCleared++;
    }
    if (currentLight === 1 && this.ewQueue > 0) {
      this.ewQueue--;
      trafficCleared++;
    }
    this.cleared += trafficCleared;

    // 4. Spawn new cars randomly dynamically
    if (Math.random() < this.spawnRate) this.nsQueue = Math.min(this.nsQueue + 1, 10);
    if (Math.random() < this.spawnRate) this.ewQueue = Math.min(this.ewQueue + 1, 10);

    // Broadcast globally to all watchers
    this.broadcastState();
  }

  broadcastState() {
    this.io.emit('sim_update', {
      nsQueue: this.nsQueue,
      ewQueue: this.ewQueue,
      light: this.light,
      cleared: this.cleared,
      isRunning: this.isRunning,
      spawnRate: this.spawnRate
    });
  }
}

// Singleton for collaborative dashboard viewing
let globalSim = null;

export const initializeSimulation = (io) => {
  globalSim = new TrafficSimulation(io);

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected to Traffic Sim: ${socket.id}`);
    
    // Transmit an immediate snapshot to syncing client
    socket.emit('sim_update', {
      nsQueue: globalSim.nsQueue,
      ewQueue: globalSim.ewQueue,
      light: globalSim.light,
      cleared: globalSim.cleared,
      isRunning: globalSim.isRunning
    });

    socket.on('start_sim', () => globalSim.start());
    socket.on('pause_sim', () => globalSim.pause());
    socket.on('reset_sim', () => globalSim.reset());
    socket.on('set_spawn_rate', (rate) => { globalSim.spawnRate = rate; globalSim.broadcastState(); });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected from Traffic Sim: ${socket.id}`);
    });
  });
};

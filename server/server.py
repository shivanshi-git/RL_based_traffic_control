# """
# server.py  –  Flask-SocketIO backend
# Bridges the React frontend (TrafficSimulation.jsx) with the Q-Learning agent.

# Events received from client:
#   start_sim       – begin / resume the simulation loop
#   pause_sim       – pause the simulation loop
#   reset_sim       – reset everything
#   set_spawn_rate  – update spawn rate (float 0.1–1.0)
#   update_config   – receive config from SetupAutomation (simMode, lanes, …)

# Events emitted to client:
#   sim_update  – dict with nsQueue, ewQueue, light, cleared, reward,
#                 cumulativeReward, isRunning, spawnRate, simMode, lanes
# """

# import threading
# import time
# import random
# import math
# import sys
# import os
# import pickle
# import numpy as np

# from flask import Flask, request, jsonify
# from flask_socketio import SocketIO
# from flask_cors import CORS

# # Add traffic-rl to path so we can import its agents
# TRAFFIC_RL_PATH = os.path.join(os.path.dirname(__file__), 'traffic-rl')
# if TRAFFIC_RL_PATH not in sys.path:
#     sys.path.append(TRAFFIC_RL_PATH)

# try:
#     from stable_baselines3 import DQN
#     HAS_SB3 = True
# except ImportError:
#     HAS_SB3 = False
#     print("Warning: stable_baselines3 not found. DQN models will be unavailable.")

# # ──────────────────────────────────────────────────────────────────────────────
# app = Flask(__name__)
# CORS(app, origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"], supports_credentials=True)
# socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

# @app.route("/get_signal", methods=["POST"])
# def get_signal():
#     """Endpoint for the Node.js server to get RL decisions."""
#     data = request.json
#     traffic = data.get("traffic", [0, 0, 0, 0])
#     # traffic is [ns, ns, ew, ew]
#     ns_q = traffic[0]
#     ew_q = traffic[2]
    
#     with state_lock:
#         light = state["light"]
    
#     action = manager.get_action(ns_q, ew_q, light)
#     signal = "NS_GREEN" if action == 0 else "EW_GREEN"
    
#     # Reward calculation (approximate for the bridge)
#     total_waiting = ns_q + ew_q
#     reward = -total_waiting * 0.1
    
#     return jsonify({
#         "signal": signal,
#         "reward": reward,
#         "model": manager.model_name
#     })

# # ──────────────────────────────────────────────────────────────────────────────
# # Simulation state (shared between the sim thread and socket handlers)
# # ──────────────────────────────────────────────────────────────────────────────
# state = {
#     "isRunning":        False,
#     "spawnRate":        0.4,
#     "simMode":          "intersection",   # "single" | "intersection"
#     "lanes":            4,
#     "light":            0,                # 0 = NS green, 1 = EW green
#     "nsQueue":          0,
#     "ewQueue":          0,
#     "cleared":          0,
#     "reward":           0.0,
#     "cumulativeReward": 0.0,
#     "activeModel":      "Internal Q-Learning",
# }

# state_lock = threading.Lock()
# sim_thread = None

# # ──────────────────────────────────────────────────────────────────────────────
# # Simple Q-Learning agent (tabular, 2-action: keep | switch)
# # ──────────────────────────────────────────────────────────────────────────────
# class QLAgent:
#     """
#     State  = (ns_bucket, ew_bucket, current_light)
#     Actions= 0 keep current phase | 1 switch phase
#     """

#     BUCKETS = 5   # discretise queue 0-20+ into 5 bins

#     def __init__(self, alpha=0.1, gamma=0.99,
#                  init_epsilon=1.0, min_epsilon=0.05, decay=0.995):
#         self.alpha   = alpha
#         self.gamma   = gamma
#         self.epsilon = init_epsilon
#         self.min_eps = min_epsilon
#         self.decay   = decay
#         self.q: dict = {}          # (state_tuple, action) → float
#         self.step    = 0

#     def _bucket(self, q):
#         if q <= 0:  return 0
#         if q <= 2:  return 1
#         if q <= 5:  return 2
#         if q <= 10: return 3
#         return 4

#     def get_state(self, ns_q, ew_q, light):
#         return (self._bucket(ns_q), self._bucket(ew_q), light)

#     def choose_action(self, state):
#         if random.random() < self.epsilon:
#             return random.randint(0, 1)
#         return max(0, 1, key=lambda a: self.q.get((state, a), 0.0))

#     def update(self, s, a, r, s_next):
#         best_next = max(self.q.get((s_next, a2), 0.0) for a2 in [0, 1])
#         old = self.q.get((s, a), 0.0)
#         self.q[(s, a)] = old + self.alpha * (r + self.gamma * best_next - old)
#         self.epsilon = max(self.min_eps, self.epsilon * self.decay)
#         self.step += 1


# # ──────────────────────────────────────────────────────────────────────────────
# # Agent Management
# # ──────────────────────────────────────────────────────────────────────────────

# class AgentManager:
#     def __init__(self):
#         self.internal_agent = QLAgent()
#         self.external_agent = None
#         self.mode = "internal"  # "internal" | "external"
#         self.model_name = "Internal Q-Learning"

#     def get_action(self, ns_q, ew_q, light):
#         if self.mode == "internal":
#             s = self.internal_agent.get_state(ns_q, ew_q, light)
#             return self.internal_agent.choose_action(s)
#         elif self.external_agent:
#             # Adapt state for external models
#             obs = self._get_external_obs(ns_q, ew_q, light)
#             return self.external_agent.predict(obs)
#         return 0

#     def update(self, s, a, r, s_next):
#         if self.mode == "internal":
#             self.internal_agent.update(s, a, r, s_next)
#         # External agents are usually tested in 'test' mode (no online learning here)

#     def _get_external_obs(self, ns_q, ew_q, light):
#         """
#         Adapts the simple SVG state to the SUMO-RL observation space.
#         SUMO-RL default obs: [phase_onehot, min_green, lane_queues, lane_densities]
#         """
#         # Phase one-hot (assuming 2 phases for simplicity)
#         phase_oh = [1.0, 0.0] if light == 0 else [0.0, 1.0]
#         # Min green (always true for simplicity)
#         min_green = [1.0]
#         # Normalize queues (0-20 -> 0.0-1.0)
#         q_ns = [min(ns_q / 20.0, 1.0)] * 2 # 2 lanes
#         q_ew = [min(ew_q / 20.0, 1.0)] * 2 # 2 lanes
        
#         # Concat into a flat vector
#         obs = np.array(phase_oh + min_green + q_ns + q_ew, dtype=np.float32)
#         return obs

#     def load_model(self, model_path, model_type):
#         try:
#             if model_type == "QL":
#                 with open(model_path, 'rb') as f:
#                     q_table = pickle.load(f)
                
#                 class QLWrapper:
#                     def __init__(self, table): self.table = table
#                     def predict(self, obs):
#                         state = tuple(obs)
#                         q_vals = [self.table.get((state, a), -999) for a in [0, 1]]
#                         return np.argmax(q_vals)
                
#                 self.external_agent = QLWrapper(q_table)
#                 self.mode = "external"
#             elif model_type == "DQN" and HAS_SB3:
#                 model = DQN.load(model_path)
                
#                 class DQNWrapper:
#                     def __init__(self, m): self.model = m
#                     def predict(self, obs):
#                         action, _ = self.model.predict(obs, deterministic=True)
#                         return int(action)
                
#                 self.external_agent = DQNWrapper(model)
#                 self.mode = "external"
#             return True
#         except Exception as e:
#             print(f"Error loading model {model_path}: {e}")
#             return False

#     def reset_to_internal(self):
#         self.mode = "internal"
#         self.external_agent = None
#         self.model_name = "Internal Q-Learning"

# manager = AgentManager()

# # ──────────────────────────────────────────────────────────────────────────────
# # Simulation loop
# # ──────────────────────────────────────────────────────────────────────────────
# MIN_GREEN_STEPS = 10   # minimum steps before agent can switch light

# def simulate():
#     """Runs in a background thread. One iteration ≈ one RL step."""
#     steps_on_phase = 0

#     while True:
#         with state_lock:
#             running = state["isRunning"]

#         if not running:
#             time.sleep(0.1)
#             continue

#         with state_lock:
#             ns_q    = state["nsQueue"]
#             ew_q    = state["ewQueue"]
#             light   = state["light"]
#             sr      = state["spawnRate"]
#             mode    = state["simMode"]

#         # ── Spawn vehicles into queues ──────────────────────────────────────
#         if random.random() < sr * 0.3:
#             ns_q += 1
#         if mode == "intersection" and random.random() < sr * 0.3:
#             ew_q += 1

#         # ── Clear vehicles that pass through on green ──────────────────────
#         cleared_this_step = 0
#         if light == 0:   # NS green
#             flow = min(ns_q, random.randint(1, 3))
#             ns_q = max(0, ns_q - flow)
#             cleared_this_step = flow
#         else:            # EW green
#             flow = min(ew_q, random.randint(1, 3))
#             ew_q = max(0, ew_q - flow)
#             cleared_this_step = flow

#         # ── Reward: negative total waiting + cleared bonus ─────────────────
#         total_waiting = ns_q + ew_q
#         reward = cleared_this_step * 2 - total_waiting * 0.1

#         # ── Agent decides ──────────────────────────────────────────────────
#         action = manager.get_action(ns_q, ew_q, light) if steps_on_phase >= MIN_GREEN_STEPS else 0

#         new_light = light
#         if action == 1:
#             new_light    = 1 - light
#             steps_on_phase = 0
#         else:
#             steps_on_phase += 1

#         if manager.mode == "internal":
#             s = manager.internal_agent.get_state(ns_q, ew_q, light)
#             s_next = manager.internal_agent.get_state(ns_q, ew_q, new_light)
#             manager.update(s, action, reward, s_next)

#         # ── Write back & emit ──────────────────────────────────────────────
#         with state_lock:
#             state["nsQueue"]          = ns_q
#             state["ewQueue"]          = ew_q
#             state["light"]            = new_light
#             state["cleared"]         += cleared_this_step
#             state["reward"]           = round(reward, 2)
#             state["cumulativeReward"] = round(state["cumulativeReward"] + reward, 2)
#             snapshot = dict(state)

#         socketio.emit("sim_update", snapshot)
#         time.sleep(0.3)    # ~3 steps/second so the UI stays readable


# # ──────────────────────────────────────────────────────────────────────────────
# # Socket events
# # ──────────────────────────────────────────────────────────────────────────────
# @socketio.on("connect")
# def on_connect():
#     print("Client connected")
#     with state_lock:
#         socketio.emit("sim_update", dict(state))


# @socketio.on("disconnect")
# def on_disconnect():
#     print("Client disconnected")


# @socketio.on("start_sim")
# def on_start():
#     with state_lock:
#         state["isRunning"] = True
#     print("Simulation started")


# @socketio.on("pause_sim")
# def on_pause():
#     with state_lock:
#         state["isRunning"] = False
#     print("Simulation paused")


# @socketio.on("reset_sim")
# def on_reset():
#     manager.internal_agent = QLAgent()
#     with state_lock:
#         state.update({
#             "isRunning":        False,
#             "light":            0,
#             "nsQueue":          0,
#             "ewQueue":          0,
#             "cleared":          0,
#             "reward":           0.0,
#             "cumulativeReward": 0.0,
#         })
#         socketio.emit("sim_update", dict(state))
#     print("Simulation reset")


# @socketio.on("get_models")
# def on_get_models():
#     models_dir = os.path.join(TRAFFIC_RL_PATH, 'output', 'models')
#     available = [{"name": "Internal Q-Learning", "type": "internal"}]
    
#     if os.path.exists(models_dir):
#         for f in os.listdir(models_dir):
#             if f.endswith('.pkl'):
#                 available.append({"name": f, "type": "QL", "path": os.path.join(models_dir, f)})
#             elif f.endswith('.zip'):
#                 available.append({"name": f, "type": "DQN", "path": os.path.join(models_dir, f)})
    
#     socketio.emit("available_models", available)


# @socketio.on("select_model")
# def on_select_model(data):
#     name = data.get("name")
#     m_type = data.get("type")
#     path = data.get("path")
    
#     if m_type == "internal":
#         manager.reset_to_internal()
#         success = True
#     else:
#         success = manager.load_model(path, m_type)
#         if success:
#             manager.model_name = name
    
#     if success:
#         with state_lock:
#             state["activeModel"] = manager.model_name
#             socketio.emit("sim_update", dict(state))
#         print(f"Model switched to: {manager.model_name}")
#     else:
#         socketio.emit("error", {"message": f"Failed to load model {name}"})


# @socketio.on("set_spawn_rate")
# def on_spawn_rate(rate):
#     with state_lock:
#         state["spawnRate"] = float(rate)


# @socketio.on("update_config")
# def on_config(config):
#     """Receive config from SetupAutomation page."""
#     with state_lock:
#         if "simMode" in config:
#             state["simMode"] = config["simMode"]
#         if "lanes" in config:
#             state["lanes"] = int(config["lanes"])
#     print(f"Config updated: {config}")


# # ──────────────────────────────────────────────────────────────────────────────
# if __name__ == "__main__":
#     # Start the sim loop thread (daemon so it dies with the process)
#     t = threading.Thread(target=simulate, daemon=True)
#     t.start()

#     print("Starting RL Engine on http://localhost:8000")
#     socketio.run(app, host="0.0.0.0", port=8000, debug=False, allow_unsafe_werkzeug=True)


"""
server.py  –  Flask-SocketIO backend
Bridges the React frontend (TrafficSimulation.jsx) with the Q-Learning agent.

Events received from client:
  start_sim       – begin / resume the simulation loop
  pause_sim       – pause the simulation loop
  reset_sim       – reset everything
  set_spawn_rate  – update spawn rate (float 0.1–1.0)
  update_config   – receive config from SetupAutomation (simMode, lanes, …)

Events emitted to client:
  sim_update  – dict with nsQueue, ewQueue, light, cleared, reward,
                cumulativeReward, isRunning, spawnRate, simMode, lanes
"""

import threading
import time
import random
import math
import sys
import os
import pickle
import numpy as np

from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS

# Add traffic-rl to path so we can import its agents
TRAFFIC_RL_PATH = os.path.join(os.path.dirname(__file__), 'traffic-rl')
if TRAFFIC_RL_PATH not in sys.path:
    sys.path.append(TRAFFIC_RL_PATH)

try:
    from stable_baselines3 import DQN
    HAS_SB3 = True
except ImportError:
    HAS_SB3 = False
    print("Warning: stable_baselines3 not found. DQN models will be unavailable.")

# ──────────────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"], supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

@app.route("/get_signal", methods=["POST"])
def get_signal():
    """Endpoint for the Node.js server to get RL decisions."""
    data = request.json
    traffic = data.get("traffic", [0, 0, 0, 0])
    # traffic is [ns, ns, ew, ew]
    ns_q = traffic[0]
    ew_q = traffic[2]
    
    with state_lock:
        light = state["light"]
    
    action = manager.get_action(ns_q, ew_q, light)
    signal = "NS_GREEN" if action == 0 else "EW_GREEN"
    
    # Reward calculation (approximate for the bridge)
    total_waiting = ns_q + ew_q
    reward = -total_waiting * 0.1
    
    return jsonify({
        "signal": signal,
        "reward": reward,
        "model": manager.model_name
    })

# ──────────────────────────────────────────────────────────────────────────────
# Simulation state (shared between the sim thread and socket handlers)
# ──────────────────────────────────────────────────────────────────────────────
state = {
    "isRunning":        False,
    "spawnRate":        0.4,
    "simMode":          "intersection",   # "single" | "intersection"
    "lanes":            4,
    "light":            0,                # 0 = NS green, 1 = EW green
    "nsQueue":          0,
    "ewQueue":          0,
    "cleared":          0,
    "reward":           0.0,
    "cumulativeReward": 0.0,
    "activeModel":      "Internal Q-Learning",
    "trafficType":      "low",            # "low" | "high"  — from SetupAutomation
    "agentType":        "QL",             # "QL"  | "DQN"   — from SetupAutomation
}

state_lock = threading.Lock()
sim_thread = None

# ──────────────────────────────────────────────────────────────────────────────
# Simple Q-Learning agent (tabular, 2-action: keep | switch)
# ──────────────────────────────────────────────────────────────────────────────
class QLAgent:
    """
    State  = (ns_bucket, ew_bucket, current_light)
    Actions= 0 keep current phase | 1 switch phase
    """

    BUCKETS = 5   # discretise queue 0-20+ into 5 bins

    def __init__(self, alpha=0.1, gamma=0.99,
                 init_epsilon=1.0, min_epsilon=0.05, decay=0.995):
        self.alpha   = alpha
        self.gamma   = gamma
        self.epsilon = init_epsilon
        self.min_eps = min_epsilon
        self.decay   = decay
        self.q: dict = {}          # (state_tuple, action) → float
        self.step    = 0

    def _bucket(self, q):
        if q <= 0:  return 0
        if q <= 2:  return 1
        if q <= 5:  return 2
        if q <= 10: return 3
        return 4

    def get_state(self, ns_q, ew_q, light):
        return (self._bucket(ns_q), self._bucket(ew_q), light)

    def choose_action(self, state):
        if random.random() < self.epsilon:
            return random.randint(0, 1)
        return max(0, 1, key=lambda a: self.q.get((state, a), 0.0))

    def update(self, s, a, r, s_next):
        best_next = max(self.q.get((s_next, a2), 0.0) for a2 in [0, 1])
        old = self.q.get((s, a), 0.0)
        self.q[(s, a)] = old + self.alpha * (r + self.gamma * best_next - old)
        self.epsilon = max(self.min_eps, self.epsilon * self.decay)
        self.step += 1


# ──────────────────────────────────────────────────────────────────────────────
# Agent Management
# ──────────────────────────────────────────────────────────────────────────────

class AgentManager:
    def __init__(self):
        self.internal_agent = QLAgent()
        self.external_agent = None
        self.mode = "internal"  # "internal" | "external"
        self.model_name = "Internal Q-Learning"

    def get_action(self, ns_q, ew_q, light):
        if self.mode == "internal":
            s = self.internal_agent.get_state(ns_q, ew_q, light)
            return self.internal_agent.choose_action(s)
        elif self.external_agent:
            # Adapt state for external models
            obs = self._get_external_obs(ns_q, ew_q, light)
            return self.external_agent.predict(obs)
        return 0

    def update(self, s, a, r, s_next):
        if self.mode == "internal":
            self.internal_agent.update(s, a, r, s_next)
        # External agents are usually tested in 'test' mode (no online learning here)

    def _get_external_obs(self, ns_q, ew_q, light):
        """
        Adapts the simple SVG state to the SUMO-RL observation space.
        SUMO-RL default obs: [phase_onehot, min_green, lane_queues, lane_densities]
        """
        # Phase one-hot (assuming 2 phases for simplicity)
        phase_oh = [1.0, 0.0] if light == 0 else [0.0, 1.0]
        # Min green (always true for simplicity)
        min_green = [1.0]
        # Normalize queues (0-20 -> 0.0-1.0)
        q_ns = [min(ns_q / 20.0, 1.0)] * 2 # 2 lanes
        q_ew = [min(ew_q / 20.0, 1.0)] * 2 # 2 lanes
        
        # Concat into a flat vector
        obs = np.array(phase_oh + min_green + q_ns + q_ew, dtype=np.float32)
        return obs

    def load_model(self, model_path, model_type):
        try:
            if model_type == "QL":
                with open(model_path, 'rb') as f:
                    q_table = pickle.load(f)
                
                class QLWrapper:
                    def __init__(self, table): self.table = table
                    def predict(self, obs):
                        state = tuple(obs)
                        q_vals = [self.table.get((state, a), -999) for a in [0, 1]]
                        return np.argmax(q_vals)
                
                self.external_agent = QLWrapper(q_table)
                self.mode = "external"
            elif model_type == "DQN" and HAS_SB3:
                model = DQN.load(model_path)
                
                class DQNWrapper:
                    def __init__(self, m): self.model = m
                    def predict(self, obs):
                        action, _ = self.model.predict(obs, deterministic=True)
                        return int(action)
                
                self.external_agent = DQNWrapper(model)
                self.mode = "external"
            return True
        except Exception as e:
            print(f"Error loading model {model_path}: {e}")
            return False

    def reset_to_internal(self):
        self.mode = "internal"
        self.external_agent = None
        self.model_name = "Internal Q-Learning"

manager = AgentManager()

# ──────────────────────────────────────────────────────────────────────────────
# Simulation loop
# ──────────────────────────────────────────────────────────────────────────────
MIN_GREEN_STEPS = 10   # minimum steps before agent can switch light

def simulate():
    """Runs in a background thread. One iteration ≈ one RL step."""
    steps_on_phase = 0

    while True:
        with state_lock:
            running = state["isRunning"]

        if not running:
            time.sleep(0.1)
            continue

        with state_lock:
            ns_q    = state["nsQueue"]
            ew_q    = state["ewQueue"]
            light   = state["light"]
            sr      = state["spawnRate"]
            mode    = state["simMode"]

        # ── Spawn vehicles into queues ──────────────────────────────────────
        if random.random() < sr * 0.3:
            ns_q += 1
        if mode == "intersection" and random.random() < sr * 0.3:
            ew_q += 1

        # ── Clear vehicles that pass through on green ──────────────────────
        cleared_this_step = 0
        if light == 0:   # NS green
            flow = min(ns_q, random.randint(1, 3))
            ns_q = max(0, ns_q - flow)
            cleared_this_step = flow
        else:            # EW green
            flow = min(ew_q, random.randint(1, 3))
            ew_q = max(0, ew_q - flow)
            cleared_this_step = flow

        # ── Reward: negative total waiting + cleared bonus ─────────────────
        total_waiting = ns_q + ew_q
        reward = cleared_this_step * 2 - total_waiting * 0.1

        # ── Agent decides ──────────────────────────────────────────────────
        action = manager.get_action(ns_q, ew_q, light) if steps_on_phase >= MIN_GREEN_STEPS else 0

        new_light = light
        if action == 1:
            new_light    = 1 - light
            steps_on_phase = 0
        else:
            steps_on_phase += 1

        if manager.mode == "internal":
            s = manager.internal_agent.get_state(ns_q, ew_q, light)
            s_next = manager.internal_agent.get_state(ns_q, ew_q, new_light)
            manager.update(s, action, reward, s_next)

        # ── Write back & emit ──────────────────────────────────────────────
        with state_lock:
            state["nsQueue"]          = ns_q
            state["ewQueue"]          = ew_q
            state["light"]            = new_light
            state["cleared"]         += cleared_this_step
            state["reward"]           = round(reward, 2)
            state["cumulativeReward"] = round(state["cumulativeReward"] + reward, 2)
            snapshot = dict(state)

        socketio.emit("sim_update", snapshot)
        time.sleep(0.3)    # ~3 steps/second so the UI stays readable


# ──────────────────────────────────────────────────────────────────────────────
# Socket events
# ──────────────────────────────────────────────────────────────────────────────
@socketio.on("connect")
def on_connect():
    print("Client connected")
    with state_lock:
        socketio.emit("sim_update", dict(state))


@socketio.on("disconnect")
def on_disconnect():
    print("Client disconnected")


@socketio.on("start_sim")
def on_start():
    with state_lock:
        state["isRunning"] = True
    print("Simulation started")


@socketio.on("pause_sim")
def on_pause():
    with state_lock:
        state["isRunning"] = False
    print("Simulation paused")


@socketio.on("reset_sim")
def on_reset():
    manager.internal_agent = QLAgent()
    with state_lock:
        state.update({
            "isRunning":        False,
            "light":            0,
            "nsQueue":          0,
            "ewQueue":          0,
            "cleared":          0,
            "reward":           0.0,
            "cumulativeReward": 0.0,
        })
        socketio.emit("sim_update", dict(state))
    print("Simulation reset")


@socketio.on("get_models")
def on_get_models():
    models_dir = os.path.join(TRAFFIC_RL_PATH, 'output', 'models')
    available = [{"name": "Internal Q-Learning", "type": "internal"}]
    
    if os.path.exists(models_dir):
        for f in os.listdir(models_dir):
            if f.endswith('.pkl'):
                available.append({"name": f, "type": "QL", "path": os.path.join(models_dir, f)})
            elif f.endswith('.zip'):
                available.append({"name": f, "type": "DQN", "path": os.path.join(models_dir, f)})
    
    socketio.emit("available_models", available)


@socketio.on("select_model")
def on_select_model(data):
    name = data.get("name")
    m_type = data.get("type")
    path = data.get("path")
    
    if m_type == "internal":
        manager.reset_to_internal()
        success = True
    else:
        success = manager.load_model(path, m_type)
        if success:
            manager.model_name = name
    
    if success:
        with state_lock:
            state["activeModel"] = manager.model_name
            socketio.emit("sim_update", dict(state))
        print(f"Model switched to: {manager.model_name}")
    else:
        socketio.emit("error", {"message": f"Failed to load model {name}"})


@socketio.on("set_spawn_rate")
def on_spawn_rate(rate):
    with state_lock:
        state["spawnRate"] = float(rate)


@socketio.on("update_config")
def on_config(config):
    """Receive config from SetupAutomation page."""
    with state_lock:
        if "simMode"     in config: state["simMode"]     = config["simMode"]
        if "lanes"       in config: state["lanes"]       = int(config["lanes"])
        if "trafficType" in config: state["trafficType"] = config["trafficType"]
        if "agentType"   in config: state["agentType"]   = config["agentType"]
        snapshot = dict(state)
    # Push updated config to all connected clients immediately
    socketio.emit("sim_update", snapshot)
    print(f"Config updated: {config}")


# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Start the sim loop thread (daemon so it dies with the process)
    t = threading.Thread(target=simulate, daemon=True)
    t.start()

    print("Starting RL Engine on http://localhost:8000")
    socketio.run(app, host="0.0.0.0", port=8000, debug=False, allow_unsafe_werkzeug=True)
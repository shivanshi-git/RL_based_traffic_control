import json
import random
import numpy as np

class TrafficEnv:
    def __init__(self):
        # State: [NS_queue_size (max 10), EW_queue_size (max 10), current_light (0=NS, 1=EW)]
        self.state_space = (11, 11, 2)
        self.action_space = 2 # 0: Keep light green, 1: Switch light
        self.reset()
        
    def reset(self):
        self.ns_queue = 0
        self.ew_queue = 0
        self.light = 0 # 0 for NS green, 1 for EW green
        return self._get_state()
        
    def _get_state(self):
        return (min(self.ns_queue, 10), min(self.ew_queue, 10), self.light)
        
    def step(self, action):
        # 1. Spawning vehicles (simulating ~0.4 cars arrive per step on each road)
        # Using simple random equivalent of Poisson
        if random.random() < 0.4: self.ns_queue += 1
        if random.random() < 0.4: self.ew_queue += 1
            
        # 2. Agent Action: Light switch
        if action == 1:
            self.light = 1 - self.light
            
        # 3. Traffic clearing
        cleared_ns, cleared_ew = 0, 0
        if self.light == 0 and self.ns_queue > 0:
            self.ns_queue -= 1
            cleared_ns = 1
        elif self.light == 1 and self.ew_queue > 0:
            self.ew_queue -= 1
            cleared_ew = 1
            
        # 4. Calculate Reward (Negative reward for waiting queues)
        reward = -(self.ns_queue + self.ew_queue)
        
        return self._get_state(), reward, (cleared_ns + cleared_ew)

def train_agent():
    print("Initializing RL Agent Training...")
    env = TrafficEnv()
    
    # Q-Table initialization (11 x 11 x 2 States) x 2 Actions
    q_table = np.zeros(env.state_space + (env.action_space,))
    
    alpha, gamma, epsilon = 0.1, 0.95, 1.0
    epsilon_decay, min_epsilon = 0.995, 0.01
    episodes, steps_per_episode = 2000, 60
    
    history = []
    
    for ep in range(episodes):
        state = env.reset()
        total_reward = 0
        throughput = 0
        
        for step in range(steps_per_episode):
            # Epsilon-greedy action
            if random.random() < epsilon:
                action = random.randint(0, 1) # Explore
            else:
                action = np.argmax(q_table[state]) # Exploit
                
            next_state, reward, cleared = env.step(action)
            
            # Learn: Update Q-value
            best_next_action = np.argmax(q_table[next_state])
            td_target = reward + gamma * q_table[next_state][best_next_action]
            td_error = td_target - q_table[state][action]
            q_table[state][action] += alpha * td_error
            
            state = next_state
            total_reward += reward
            throughput += cleared
            
        epsilon = max(min_epsilon, epsilon * epsilon_decay)
        
        if (ep + 1) % 200 == 0:
            print(f"Episode {ep + 1}/{episodes} - Total Wait: {-total_reward} - Throughput: {throughput} cars")
            
        history.append({'episode': ep + 1, 'reward': total_reward, 'throughput': throughput})

    # Output models directly to React src to satisfy Phase 2
    out_path_table = '../../client/src/q_table.json'
    
    with open(out_path_table, 'w') as f:
        json.dump(q_table.tolist(), f)
    with open('../../client/src/training_history.json', 'w') as f:
        json.dump(history, f)
        
    print(f"Finished! Saved model to {out_path_table}")

if __name__ == "__main__":
    train_agent()


import sys
import os
import pickle

# Add traffic-rl to path
sys.path.append(os.path.join(os.getcwd(), 'server', 'traffic-rl'))

# Try loading a QL model
model_path = os.path.join('server', 'traffic-rl', 'output', 'models', 'ql_run1.pkl')
try:
    with open(model_path, 'rb') as f:
        q_table = pickle.load(f)
    print(f"Successfully loaded Q-table with {len(q_table)} entries.")
    # Show first 5 entries
    for i, (k, v) in enumerate(q_table.items()):
        if i >= 5: break
        print(f"  {k} -> {v}")
except Exception as e:
    print(f"Error loading model: {e}")

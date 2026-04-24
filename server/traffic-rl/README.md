# Traffic-RL: Q-Learning & DQN Traffic Signal Control

Reinforcement learning agents (Q-Learning and Deep Q-Network) for traffic signal
control at a single intersection, simulated with SUMO and SUMO-RL.

---

## Project Structure

```
traffic-rl/
├── big-intersection/           # SUMO network & route files
│   ├── BI.net.xml
│   ├── BI_50_test.rou.xml      # low-traffic routes
│   └── BI_150_test.rou.xml     # high-traffic routes
├── configs/
│   ├── learn_low.yaml          # train all agents on low traffic
│   ├── learn_high.yaml         # train all agents on high traffic
│   ├── test_low_low.yaml       # test (low-trained) on low traffic
│   └── test_low_high.yaml      # test (low-trained) on high traffic
├── output/
│   ├── csv/                    # per-run metric CSVs
│   ├── plots/                  # generated PNG charts
│   └── models/                 # saved model files
├── scripts/
│   ├── agents/
│   │   ├── learning_agent.py   # abstract base class
│   │   ├── ql_agent.py         # tabular Q-Learning
│   │   ├── dqn_agent.py        # Deep Q-Network (SB3)
│   │   └── fixed_cycle.py      # fixed-time baseline
│   ├── custom/
│   │   └── custom_environment.py  # SUMO-RL env factory
│   ├── utils/
│   │   ├── config_parser.py    # YAML parser + validator
│   │   └── plotter.py          # matplotlib chart generator
│   └── runner.py               # orchestration logic
└── main.py                     # CLI entry point
```

---

## Installation

Make sure SUMO is already installed and `SUMO_HOME` is set, then:

```bash
pip install sumo-rl stable-baselines3 matplotlib pandas pyyaml
```

---

## Usage

Run from the project root directory.

### Train on low traffic
```bash
python main.py --config configs/learn_low.yaml --mode train
```

### Train on high traffic
```bash
python main.py --config configs/learn_high.yaml --mode train
```

### Train then immediately test (same traffic)
```bash
python main.py --config configs/learn_low.yaml --mode both
```

### Test a saved model
Edit the `Model:` path in the relevant test config, then:
```bash
python main.py --config configs/test_low_low.yaml --mode test
```

### Enable SUMO GUI
Set `Gui: True` in the YAML `Environment` section.

---

## Configuration

All agent hyperparameters live in the YAML files under `configs/`.

### Q-Learning key hyperparameters
| Key | Description | Typical range |
|---|---|---|
| `Alpha` | Learning rate | 0.01 – 0.3 |
| `Gamma` | Discount factor | 0.9 – 0.999 |
| `Init_epsilon` | Starting exploration | 1.0 |
| `Min_epsilon` | Minimum exploration | 0.01 – 0.1 |
| `Decay` | Epsilon decay per episode | 0.99 – 0.999 |

### DQN key hyperparameters
| Key | Description | Typical range |
|---|---|---|
| `Alpha` | Learning rate | 0.0001 – 0.001 |
| `Gamma` | Discount factor | 0.9 – 0.999 |
| `Init_epsilon` | Starting exploration | 1.0 |
| `Final_epsilon` | Minimum exploration | 0.01 – 0.1 |
| `Exp_fraction` | Fraction of training for exploration decay | 0.1 – 0.5 |

---

## Output

After a run you will find:
- **`output/csv/`** – one CSV per agent per run, with columns like
  `system_total_stopped`, `system_total_waiting_time`, `system_mean_speed`, …
- **`output/plots/`** – training curves and bar-chart comparisons as PNGs
- **`output/models/`** – `ql_run<N>.pkl` and `dqn_run<N>.zip` files

---

## Adding the SUMO Files

The SUMO network and route files (`BI.net.xml`, `BI_50_test.rou.xml`,
`BI_150_test.rou.xml`) must be placed inside the `big-intersection/` folder.
Download them from the original repository or create your own with SUMO's `netedit`.

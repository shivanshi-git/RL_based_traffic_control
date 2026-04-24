"""
main.py – CLI entry point for the Traffic-RL project.

Usage examples
--------------
Train on low traffic:
    python main.py --config configs/learn_low.yaml --mode train

Test a previously trained model:
    python main.py --config configs/test_low_low.yaml --mode test

Train then immediately test:
    python main.py --config configs/learn_high.yaml --mode both
"""

import argparse
import sys
import os

# Make sure imports resolve from the project root
sys.path.insert(0, os.path.dirname(__file__))

from scripts.runner import run


def parse_args():
    parser = argparse.ArgumentParser(
        description="Traffic Signal RL – Q-Learning & DQN"
    )
    parser.add_argument(
        "--config", "-c",
        required=True,
        help="Path to a YAML configuration file (e.g. configs/learn_low.yaml)",
    )
    parser.add_argument(
        "--mode", "-m",
        default="train",
        choices=["train", "test", "both"],
        help="Execution mode: train | test | both  (default: train)",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run(config_path=args.config, mode=args.mode)

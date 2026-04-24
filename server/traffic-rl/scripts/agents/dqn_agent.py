import os
import numpy as np
import pandas as pd

from stable_baselines3 import DQN
from stable_baselines3.common.callbacks import BaseCallback

from scripts.agents.learning_agent import LearningAgent


class MetricsCallback(BaseCallback):
    """Collect per-step info metrics during SB3 training."""

    def __init__(self):
        super().__init__()
        self.records: list = []

    def _on_step(self) -> bool:
        for info in self.locals.get("infos", []):
            if info:
                self.records.append(dict(info))
        return True


class DQNAgent(LearningAgent):
    """
    Deep Q-Network agent for traffic signal control.

    Wraps Stable-Baselines3 DQN.  Exploration follows a linear schedule
    from init_epsilon → final_epsilon over exp_fraction of total timesteps.
    """

    def __init__(self, env, config: dict, output_csv: str, output_model: str, run: int,
                 num_seconds: int = 3600):
        super().__init__(env, config, output_csv, output_model, run)

        self.alpha = config["Alpha"]
        self.gamma = config["Gamma"]
        self.init_epsilon = config["Init_epsilon"]
        self.final_epsilon = config["Final_epsilon"]
        self.exp_fraction = config["Exp_fraction"]
        self.num_seconds = num_seconds

        # total env steps ≈ simulation seconds / delta_time (default 5 s)
        self.total_timesteps = num_seconds // 5

        self.model: DQN | None = None
        self._build_model()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _build_model(self):
        self.model = DQN(
            policy="MlpPolicy",
            env=self.env,
            learning_rate=self.alpha,
            gamma=self.gamma,
            exploration_initial_eps=self.init_epsilon,
            exploration_final_eps=self.final_epsilon,
            exploration_fraction=self.exp_fraction,
            verbose=0,
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def learn(self) -> pd.DataFrame:
        print(f"  [DQN] Training run {self.run} | steps={self.total_timesteps}")
        cb = MetricsCallback()
        self.model.learn(total_timesteps=self.total_timesteps, callback=cb, reset_num_timesteps=True)

        df = pd.DataFrame(cb.records)
        os.makedirs(self.output_csv, exist_ok=True)
        csv_path = os.path.join(self.output_csv, f"dqn_train_run{self.run}.csv")
        df.to_csv(csv_path, index=False)
        self.save(os.path.join(self.output_model, f"dqn_run{self.run}"))
        return df

    def test(self) -> pd.DataFrame:
        print(f"  [DQN] Testing run {self.run}")
        obs, _ = self.env.reset()
        done = False
        metrics = []

        while not done:
            action, _ = self.model.predict(obs, deterministic=True)
            obs, reward, terminated, truncated, info = self.env.step(int(action))
            done = terminated or truncated
            if info:
                metrics.append(dict(info))

        df = pd.DataFrame(metrics)
        os.makedirs(self.output_csv, exist_ok=True)
        csv_path = os.path.join(self.output_csv, f"dqn_test_run{self.run}.csv")
        df.to_csv(csv_path, index=False)
        return df

    def save(self, path: str):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self.model.save(path)
        print(f"  [DQN] Model saved → {path}")

    def load(self, path: str):
        self.model = DQN.load(path, env=self.env)
        print(f"  [DQN] Model loaded ← {path}")

import os
import pandas as pd

from scripts.agents.learning_agent import LearningAgent


class FixedCycleAgent(LearningAgent):
    """
    Baseline agent that cycles through all green phases with fixed durations.
    No learning occurs — used purely as a performance reference.
    """

    def __init__(self, env, config: dict, output_csv: str, output_model: str, run: int):
        super().__init__(env, config, output_csv, output_model, run)
        self._phase = 0

    def _run_episode(self, tag: str) -> pd.DataFrame:
        obs, _ = self.env.reset()
        n_actions = self.env.action_space.n
        done = False
        metrics = []
        step = 0

        while not done:
            action = step % n_actions          # simple round-robin
            obs, reward, terminated, truncated, info = self.env.step(action)
            done = terminated or truncated
            if info:
                metrics.append(dict(info))
            step += 1

        df = pd.DataFrame(metrics)
        os.makedirs(self.output_csv, exist_ok=True)
        df.to_csv(os.path.join(self.output_csv, f"fixed_{tag}_run{self.run}.csv"), index=False)
        return df

    def learn(self) -> pd.DataFrame:
        print(f"  [FIXED] Run {self.run} (no training)")
        return self._run_episode("train")

    def test(self) -> pd.DataFrame:
        print(f"  [FIXED] Testing run {self.run}")
        return self._run_episode("test")

    def save(self, path: str):
        pass  # Nothing to save

    def load(self, path: str):
        pass  # Nothing to load

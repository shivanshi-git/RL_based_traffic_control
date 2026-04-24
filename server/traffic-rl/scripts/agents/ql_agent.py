import os
import pickle
import numpy as np
import pandas as pd

from scripts.agents.learning_agent import LearningAgent


class QLAgent(LearningAgent):
    """
    Tabular Q-Learning agent for traffic signal control.

    Uses an epsilon-greedy exploration strategy with exponential decay.
    The Q-table maps (state, action) pairs to expected cumulative rewards.
    """

    def __init__(self, env, config: dict, output_csv: str, output_model: str, run: int):
        super().__init__(env, config, output_csv, output_model, run)

        self.alpha = config["Alpha"]
        self.gamma = config["Gamma"]
        self.epsilon = config["Init_epsilon"]
        self.min_epsilon = config["Min_epsilon"]
        self.decay = config["Decay"]

        self.q_table: dict = {}

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _get_state(self, obs) -> tuple:
        """Convert raw observation to a hashable state tuple."""
        return tuple(obs) if not isinstance(obs, tuple) else obs

    def _get_q(self, state: tuple, action: int) -> float:
        return self.q_table.get((state, action), 0.0)

    def _choose_action(self, state: tuple, n_actions: int) -> int:
        if np.random.random() < self.epsilon:
            return np.random.randint(n_actions)
        q_values = [self._get_q(state, a) for a in range(n_actions)]
        return int(np.argmax(q_values))

    def _decay_epsilon(self):
        self.epsilon = max(self.min_epsilon, self.epsilon * self.decay)

    # ------------------------------------------------------------------
    # Core loop
    # ------------------------------------------------------------------

    def _run_episode(self, learning: bool) -> pd.DataFrame:
        obs, _ = self.env.reset()
        state = self._get_state(obs)
        n_actions = self.env.action_space.n

        done = False
        metrics = []

        while not done:
            action = self._choose_action(state, n_actions) if learning else self._greedy_action(state, n_actions)
            obs, reward, terminated, truncated, info = self.env.step(action)
            next_state = self._get_state(obs)
            done = terminated or truncated

            if learning:
                # Q-Learning update (off-policy)
                best_next = max(self._get_q(next_state, a) for a in range(n_actions))
                old_q = self._get_q(state, action)
                new_q = old_q + self.alpha * (reward + self.gamma * best_next - old_q)
                self.q_table[(state, action)] = new_q

            state = next_state
            metrics.append(info)

        if learning:
            self._decay_epsilon()

        return pd.DataFrame(metrics)

    def _greedy_action(self, state: tuple, n_actions: int) -> int:
        q_values = [self._get_q(state, a) for a in range(n_actions)]
        return int(np.argmax(q_values))

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def learn(self) -> pd.DataFrame:
        print(f"  [QL] Training run {self.run} | ε={self.epsilon:.4f}")
        df = self._run_episode(learning=True)
        os.makedirs(self.output_csv, exist_ok=True)
        csv_path = os.path.join(self.output_csv, f"ql_train_run{self.run}.csv")
        df.to_csv(csv_path, index=False)
        self.save(os.path.join(self.output_model, f"ql_run{self.run}.pkl"))
        return df

    def test(self) -> pd.DataFrame:
        print(f"  [QL] Testing run {self.run}")
        df = self._run_episode(learning=False)
        os.makedirs(self.output_csv, exist_ok=True)
        csv_path = os.path.join(self.output_csv, f"ql_test_run{self.run}.csv")
        df.to_csv(csv_path, index=False)
        return df

    def save(self, path: str):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            pickle.dump(self.q_table, f)
        print(f"  [QL] Model saved → {path}")

    def load(self, path: str):
        with open(path, "rb") as f:
            self.q_table = pickle.load(f)
        print(f"  [QL] Model loaded ← {path}")

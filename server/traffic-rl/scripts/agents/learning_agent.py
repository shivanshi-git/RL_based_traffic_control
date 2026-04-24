from abc import ABC, abstractmethod


class LearningAgent(ABC):
    """Abstract base class for all RL agents."""

    def __init__(self, env, config: dict, output_csv: str, output_model: str, run: int):
        self.env = env
        self.config = config
        self.output_csv = output_csv
        self.output_model = output_model
        self.run = run

    @abstractmethod
    def learn(self):
        """Run a full training episode."""
        pass

    @abstractmethod
    def test(self):
        """Run a full test episode (no learning)."""
        pass

    @abstractmethod
    def save(self, path: str):
        """Save the trained model to disk."""
        pass

    @abstractmethod
    def load(self, path: str):
        """Load a trained model from disk."""
        pass

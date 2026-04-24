import yaml
import os

# ---------------------------------------------------------------------------
# Allowed values
# ---------------------------------------------------------------------------

VALID_AGENT_TYPES = {"QL", "DQN", "FIXED"}
VALID_TRAFFIC_TYPES = {"low", "high"}

REQUIRED_AGENT_KEYS = {
    "QL":    ["Agent_type", "Runs", "Alpha", "Gamma", "Init_epsilon", "Min_epsilon", "Decay"],
    "DQN":   ["Agent_type", "Runs", "Alpha", "Gamma", "Init_epsilon", "Final_epsilon", "Exp_fraction"],
    "FIXED": ["Agent_type", "Runs"],
}

REQUIRED_ENV_KEYS = [
    "Traffic_type", "Gui", "Num_seconds",
    "Min_green", "Max_green", "Yellow_time", "Delta_time",
]


# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------

class ConfigParser:
    def __init__(self, config_path: str):
        if not os.path.isfile(config_path):
            raise FileNotFoundError(f"Config file not found: {config_path}")
        with open(config_path, "r") as f:
            self._raw = yaml.safe_load(f)
        self._validate()

    # ------------------------------------------------------------------
    def _validate(self):
        raw = self._raw
        assert "Plotter_settings" in raw, "Missing 'Plotter_settings' section"
        assert "Agent_settings" in raw,   "Missing 'Agent_settings' section"
        agent_s = raw["Agent_settings"]
        assert "Environment" in agent_s,  "Missing 'Environment' in Agent_settings"
        assert "Instances" in agent_s,    "Missing 'Instances' in Agent_settings"

        env = agent_s["Environment"]
        for k in REQUIRED_ENV_KEYS:
            assert k in env, f"Missing env key: {k}"

        tt = env["Traffic_type"].lower()
        assert tt in VALID_TRAFFIC_TYPES, f"Invalid Traffic_type '{tt}'. Choose from {VALID_TRAFFIC_TYPES}"

        for name, cfg in agent_s["Instances"].items():
            atype = cfg.get("Agent_type", "")
            assert atype in VALID_AGENT_TYPES, (
                f"Agent '{name}' has unknown Agent_type '{atype}'. "
                f"Valid: {VALID_AGENT_TYPES}"
            )
            if "Model" not in cfg:          # only validate when not loading from file
                for key in REQUIRED_AGENT_KEYS[atype]:
                    assert key in cfg, f"Agent '{name}' missing required key: {key}"

    # ------------------------------------------------------------------
    # Accessors
    # ------------------------------------------------------------------

    @property
    def plotter_settings(self) -> dict:
        return self._raw["Plotter_settings"]

    @property
    def agent_settings(self) -> dict:
        return self._raw["Agent_settings"]

    @property
    def environment(self) -> dict:
        return self._raw["Agent_settings"]["Environment"]

    @property
    def instances(self) -> dict:
        return self._raw["Agent_settings"]["Instances"]

    @property
    def output_csv(self) -> str:
        return self._raw["Agent_settings"].get("Output_csv", "output/csv")

    @property
    def output_model(self) -> str:
        return self._raw["Agent_settings"].get("Output_model", "output/models")

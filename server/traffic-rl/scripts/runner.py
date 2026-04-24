"""
runner.py – Orchestrates training / testing for all agent instances
defined in a YAML config file.
"""

from scripts.utils.config_parser import ConfigParser
from scripts.custom.custom_environment import make_env
from scripts.agents.ql_agent import QLAgent
from scripts.agents.dqn_agent import DQNAgent
from scripts.agents.fixed_cycle import FixedCycleAgent
from scripts.utils.plotter import Plotter


# Map Agent_type string → class
_AGENT_REGISTRY = {
    "QL":    QLAgent,
    "DQN":   DQNAgent,
    "FIXED": FixedCycleAgent,
}


def run(config_path: str, mode: str = "train"):
    """
    Entry point.

    Parameters
    ----------
    config_path : str
        Path to a .yaml configuration file.
    mode : str
        One of 'train', 'test', or 'both'.
    """
    assert mode in ("train", "test", "both"), f"Invalid mode '{mode}'"

    cfg = ConfigParser(config_path)
    env_cfg     = cfg.environment
    output_csv  = cfg.output_csv
    output_model= cfg.output_model
    plotter     = Plotter(cfg.plotter_settings)

    print(f"\n{'='*60}")
    print(f"  Config : {config_path}")
    print(f"  Mode   : {mode}")
    print(f"  Traffic: {env_cfg['Traffic_type']}")
    print(f"{'='*60}\n")

    for agent_name, agent_cfg in cfg.instances.items():
        agent_type = agent_cfg["Agent_type"]
        AgentClass = _AGENT_REGISTRY[agent_type]
        runs       = agent_cfg.get("Runs", 1)

        print(f"► Agent: {agent_name}  ({agent_type})  runs={runs}")

        for run_idx in range(1, runs + 1):
            env = make_env(env_cfg, output_csv_prefix=f"{output_csv}/sumo_{agent_name}_run{run_idx}")

            # Extra kwargs for DQN (needs num_seconds for total_timesteps)
            extra = {}
            if agent_type == "DQN":
                extra["num_seconds"] = env_cfg.get("Num_seconds", 3600)

            agent = AgentClass(env, agent_cfg, output_csv, output_model, run_idx, **extra)

            # Optionally load a pre-trained model
            if "Model" in agent_cfg:
                agent.load(agent_cfg["Model"])

            if mode in ("train", "both"):
                agent.learn()

            if mode in ("test", "both"):
                agent.test()

            env.close()

    # ── Plotting ─────────────────────────────────────────────────────────
    print("\n► Generating plots …")
    if mode in ("train", "both"):
        plotter.plot_training(output_csv, tag="train")
    if mode in ("test", "both"):
        plotter.plot_testing(output_csv)
        plotter.plot_bar_comparison(output_csv, tag="test")

    print("\n✓ Done.\n")

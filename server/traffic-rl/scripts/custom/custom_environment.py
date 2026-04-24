import os
import sumo_rl


# Map traffic type string → route file
_ROUTE_FILES = {
    "low":  os.path.join("big-intersection", "BI_50_test.rou.xml"),
    "high": os.path.join("big-intersection", "BI_150_test.rou.xml"),
}

_NET_FILE = os.path.join("big-intersection", "BI.net.xml")


def make_env(env_cfg: dict, output_csv_prefix: str = "output/csv/sumo"):
    """
    Build and return a sumo_rl SumoEnvironment.

    Parameters
    ----------
    env_cfg : dict
        The 'Environment' section from a YAML config.
    output_csv_prefix : str
        Base path for SUMO-RL's internal CSV writer.
    """
    traffic_type = env_cfg.get("Traffic_type", "low").lower()
    route_file = _ROUTE_FILES.get(traffic_type, _ROUTE_FILES["low"])

    env = sumo_rl.SumoEnvironment(
        net_file=_NET_FILE,
        route_file=route_file,
        use_gui=env_cfg.get("Gui", False),
        num_seconds=env_cfg.get("Num_seconds", 3600),
        min_green=env_cfg.get("Min_green", 10),
        max_green=env_cfg.get("Max_green", 50),
        yellow_time=env_cfg.get("Yellow_time", 4),
        delta_time=env_cfg.get("Delta_time", 5),
        out_csv_name=output_csv_prefix,
        single_agent=True,
    )
    return env

import os
import glob
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker


# Nicer display names for the raw metric column names
METRIC_LABELS = {
    "system_total_stopped":       "Total Stopped Vehicles",
    "system_total_waiting_time":  "Total Waiting Time (s)",
    "system_mean_waiting_time":   "Mean Waiting Time (s)",
    "system_mean_speed":          "Mean Speed (m/s)",
}

AGENT_COLORS = {
    "ql":    "#E07B39",   # warm orange
    "dqn":   "#4A90D9",   # cool blue
    "fixed": "#6DBF67",   # muted green
}


class Plotter:
    def __init__(self, settings: dict):
        self.output_dir = settings.get("Output", "output/plots")
        self.width  = settings.get("Width",  1920)
        self.height = settings.get("Height", 1080)
        self.metrics = settings.get("Metrics", list(METRIC_LABELS.keys()))
        os.makedirs(self.output_dir, exist_ok=True)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _load_runs(pattern: str) -> pd.DataFrame | None:
        """Load all CSVs matching a glob pattern and concatenate them."""
        files = sorted(glob.glob(pattern))
        if not files:
            return None
        frames = []
        for f in files:
            try:
                df = pd.read_csv(f)
                frames.append(df)
            except Exception as e:
                print(f"  [Plotter] Warning – could not read {f}: {e}")
        return pd.concat(frames, ignore_index=True) if frames else None

    @staticmethod
    def _smooth(series: pd.Series, window: int = 20) -> pd.Series:
        return series.rolling(window, min_periods=1).mean()

    def _figsize(self):
        dpi = 100
        return self.width / dpi, self.height / dpi

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def plot_training(self, csv_dir: str, tag: str = "train"):
        """
        For each metric, create one figure that overlays all agents' training curves.
        CSVs are expected to match: <csv_dir>/<agent>_train_run*.csv
        """
        agents = list(AGENT_COLORS.keys())
        data = {}
        for agent in agents:
            pattern = os.path.join(csv_dir, f"{agent}_{tag}_run*.csv")
            df = self._load_runs(pattern)
            if df is not None:
                data[agent] = df

        if not data:
            print("  [Plotter] No training CSVs found – skipping training plots.")
            return

        for metric in self.metrics:
            fig, ax = plt.subplots(figsize=self._figsize())
            for agent, df in data.items():
                if metric not in df.columns:
                    continue
                series = self._smooth(df[metric].reset_index(drop=True))
                color  = AGENT_COLORS.get(agent, "#888888")
                ax.plot(series, label=agent.upper(), color=color, linewidth=1.8)

            ax.set_title(f"Training – {METRIC_LABELS.get(metric, metric)}", fontsize=14, fontweight="bold")
            ax.set_xlabel("Step")
            ax.set_ylabel(METRIC_LABELS.get(metric, metric))
            ax.legend(framealpha=0.8)
            ax.xaxis.set_major_formatter(ticker.FuncFormatter(lambda x, _: f"{int(x):,}"))
            ax.grid(True, alpha=0.3)
            fig.tight_layout()

            out = os.path.join(self.output_dir, f"{tag}_{metric}.png")
            fig.savefig(out, dpi=100)
            plt.close(fig)
            print(f"  [Plotter] Saved → {out}")

    def plot_testing(self, csv_dir: str):
        self.plot_training(csv_dir, tag="test")

    def plot_bar_comparison(self, csv_dir: str, tag: str = "test"):
        """
        Bar chart comparing each agent's mean metric value over test runs.
        """
        agents = list(AGENT_COLORS.keys())
        summary = {m: {} for m in self.metrics}

        for agent in agents:
            pattern = os.path.join(csv_dir, f"{agent}_{tag}_run*.csv")
            df = self._load_runs(pattern)
            if df is None:
                continue
            for metric in self.metrics:
                if metric in df.columns:
                    summary[metric][agent] = df[metric].mean()

        for metric, values in summary.items():
            if not values:
                continue
            fig, ax = plt.subplots(figsize=(8, 5))
            bars = ax.bar(
                [a.upper() for a in values.keys()],
                list(values.values()),
                color=[AGENT_COLORS.get(a, "#888") for a in values.keys()],
                width=0.5,
            )
            ax.bar_label(bars, fmt="%.2f", padding=3, fontsize=10)
            ax.set_title(f"Test Comparison – {METRIC_LABELS.get(metric, metric)}", fontsize=13, fontweight="bold")
            ax.set_ylabel(METRIC_LABELS.get(metric, metric))
            ax.grid(True, axis="y", alpha=0.3)
            fig.tight_layout()

            out = os.path.join(self.output_dir, f"bar_{tag}_{metric}.png")
            fig.savefig(out, dpi=100)
            plt.close(fig)
            print(f"  [Plotter] Saved → {out}")

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import numpy as np
from stable_baselines3 import DQN
import os

app = FastAPI(title="Traffic RL Inference API")

# Load model globally
MODEL_PATH = os.path.join(os.path.dirname(__file__), "traffic_dqn_model.zip")
model = None

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = DQN.load(MODEL_PATH)
        print(f"RL Model loaded from {MODEL_PATH}")
    else:
        print(f"Warning: Model not found at {MODEL_PATH}. Inference will fail.")

class SimState(BaseModel):
    """The observation contract shared by the trainer and live simulator."""
    ns_queue: int = Field(ge=0, le=20)
    ew_queue: int = Field(ge=0, le=20)
    light: int = Field(ge=0, le=1)
    time_in_phase: int = Field(ge=0)

@app.post("/predict")
async def predict_action(state: SimState):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Normalize state for the model
    obs = np.array([
        state.ns_queue / 20.0,
        state.ew_queue / 20.0,
        float(state.light),
        min(state.time_in_phase / 10.0, 1.0)
    ], dtype=np.float32)
    
    action, _states = model.predict(obs, deterministic=True)
    next_light = state.light if int(action) == 0 else 1 - state.light
    
    return {
        "action": int(action),
        "signal": "NS_GREEN" if next_light == 0 else "EW_GREEN",
        "explanation": "Switch phase" if action == 1 else "Keep current phase"
    }

@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

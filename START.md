# Running the Project

Run the following services in separate PowerShell terminals, starting from the repository root.

## 1. Start MongoDB

Start a local MongoDB server:

```powershell
mongod
```

Alternatively, use a MongoDB Atlas connection string for `MONGO_URI` in `server/.env`.

## 2. Train and start the DQN model API

The live dashboard uses the trained DQN model served by `server/rl_engine/api.py`.

```powershell
cd server\rl_engine
py -m pip install fastapi "uvicorn[standard]" stable-baselines3 gymnasium numpy
py train.py
py api.py
```

Keep the API running. Confirm that the model loaded successfully:

```powershell
curl http://localhost:8000/health
```

Expected result: `"model_loaded": true`.

> If `py` is unavailable, install Python 3.10+ and select **Add Python to PATH** during installation, then use `python` in place of `py`.

## 3. Start the backend

In a new terminal:

```powershell
cd server
npm install
npm run dev
```

Create `server/.env` if it does not already exist:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/Capstone
JWT_SECRET=replace_with_a_long_random_secret
BASE_URL=https://localhost:5000
```

## 4. Start the frontend

In a third terminal:

```powershell
cd client
npm install
npm run dev
```

Open the HTTPS URL Vite prints in the terminal, usually `https://localhost:5173`.

## Notes

- Do not run `rl_model/app.py` for the DQN setup; it is the legacy Flask Q-learning service.
- The backend falls back to its local Q-table if the DQN API at port `8000` is unavailable.

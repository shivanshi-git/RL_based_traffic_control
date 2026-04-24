// import React, { useState, useEffect } from 'react';
// import { io } from 'socket.io-client';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import './TrafficSimulation.css';

// export default function TrafficSimulation() {
//   const [state, setState] = useState({
//     nsQueue: 0, ewQueue: 0, light: 0, cleared: 0,
//     isRunning: false, spawnRate: 0.4, lanes: 4, intersection: 1
//   });
//   const [performanceData, setPerformanceData] = useState([]);
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     // Connect to the Node Backend SocketSAA
//     const newSocket = io('http://localhost:5000', {
//       withCredentials: true
//     });

//     newSocket.on('connect', () => {
//         setIsConnected(true);
//         setSocket(newSocket);

//         // Send configuration if it exists
//         const savedConfig = localStorage.getItem("automationConfig");
//         if (savedConfig) {
//           try {
//             const config = JSON.parse(savedConfig);
//             newSocket.emit('update_config', config);
//           } catch (e) {
//             console.error("Failed to parse automationConfig", e);
//           }
//         }
//     });
    
//     newSocket.on('disconnect', () => {
//         setIsConnected(false);
//     });

//     // Listen for the simulation state stream continuously
//     newSocket.on('sim_update', (data) => {
//       setState(data);
      
//       // Update chart data (keeping last 20 points)
//       setPerformanceData(prev => {
//         const newData = [...prev, { time: new Date().toLocaleTimeString(), cleared: data.cleared }];
//         if (newData.length > 20) return newData.slice(1);
//         return newData;
//       });
//     });

//     return () => newSocket.close();
//   }, []);

//   const handleStartPause = () => {
//     if (!socket) return;
//     if (state.isRunning) socket.emit('pause_sim');
//     else socket.emit('start_sim');
//   };

//   const handleReset = () => {
//     if (!socket) return;
//     socket.emit('reset_sim');
//   };

//   const handleSpawnRate = (e) => {
//     if (!socket) return;
//     socket.emit('set_spawn_rate', parseFloat(e.target.value));
//   };

//   return (
//     <div className="cyber-container">
//       {/* LEFT DASHBOARD PANEL */}
//       <div className="dashboard-sidebar">
//         <div className="dashboard-header">
//             <h1 className="cyber-title">SMART CITY AI</h1>
//             <p className="cyber-subtitle">Q-Learning Traffic Control Network</p>
//             <div className={`status-badge ${isConnected ? 'online' : 'offline'}`}>
//                <div className="pulse-dot"></div>
//                {isConnected ? 'NODE.JS SECURE LINK ONLINE' : 'CONNECTION LOST'}
//             </div>
//         </div>

//         <div className="control-panel glass-panel">
//             <h3 className="panel-title">SIMULATION CONTROLS</h3>
            
//             <div className="slider-wrapper">
//                 <div className="slider-header">
//                     <label>TRAFFIC SPAWN RATE</label>
//                     <span className="slider-value">{Math.round((state.spawnRate || 0.4) * 100)}%</span>
//                 </div>
//                 <input 
//                     type="range" 
//                     min="0.1" 
//                     max="1.0" 
//                     step="0.05" 
//                     value={state.spawnRate || 0.4} 
//                     onChange={handleSpawnRate} 
//                     disabled={!isConnected} 
//                     className="cyber-slider" 
//                 />
//             </div>

//             <div className="button-group">
//                 <button 
//                     className={`cyber-btn ${!state.isRunning ? 'action-start' : 'action-pause'}`} 
//                     disabled={!isConnected} 
//                     onClick={handleStartPause}
//                 >
//                     {state.isRunning ? 'PAUSE ENGINE' : 'START ENGINE'}
//                 </button>
//                 <button 
//                     className="cyber-btn action-reset" 
//                     disabled={!isConnected} 
//                     onClick={handleReset}
//                 >
//                     REBOOT
//                 </button>
//             </div>
//         </div>

//         <div className="metrics-panel">
//            <div className="metric-box glass-panel">
//              <span className="metric-label">NORTH-SOUTH QUEUE</span>
//              <span className="metric-value">{state.nsQueue || 0}</span>
//            </div>
//            <div className="metric-box glass-panel">
//              <span className="metric-label">EAST-WEST QUEUE</span>
//              <span className="metric-value">{state.ewQueue || 0}</span>
//            </div>
//             <div className="metric-box highlight glass-panel">
//               <span className="metric-label">THROUGHPUT VOLUME</span>
//               <span className="metric-value glowing-text">{state.cleared || 0} <span className="unit">VEHICLES</span></span>
//             </div>
//          </div>

//          {/* REAL-TIME PERFORMANCE CHART */}
//          <div className="chart-panel glass-panel" style={{ height: '200px', marginTop: '1.5rem', padding: '1rem' }}>
//             <h3 className="panel-title" style={{ marginBottom: '1rem', fontSize: '0.7rem' }}>EFFICIENCY ANALYTICS</h3>
//             <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={performanceData}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
//                     <XAxis dataKey="time" hide />
//                     <YAxis stroke="#6c7086" fontSize={10} />
//                     <Tooltip 
//                         contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem' }}
//                         itemStyle={{ color: '#00f2fe' }}
//                     />
//                     <Line 
//                         type="monotone" 
//                         dataKey="cleared" 
//                         stroke="#00f2fe" 
//                         strokeWidth={2} 
//                         dot={false} 
//                         isAnimationActive={false}
//                     />
//                 </LineChart>
//             </ResponsiveContainer>
//          </div>
//       </div>

//       {/* RIGHT SVG MAP VISUALIZER */}
//       <div className="simulation-canvas">
//         <svg viewBox="0 0 800 800" className="intersection-svg">
//           {/* Background Layer */}
//           <rect width="800" height="800" fill="#ffffff" />
          
//           {/* North-South Road */}
//           <rect x="340" y="0" width="120" height="800" fill="#111116" />
//           <line x1="400" y1="0" x2="400" y2="800" stroke="#ffffff" strokeWidth="4" strokeDasharray="20,20" />
          
//           {/* East-West Road */}
//           <rect x="0" y="340" width="800" height="120" fill="#111116" />
//           <line x1="0" y1="400" x2="800" y2="400" stroke="#ffffff" strokeWidth="4" strokeDasharray="20,20" />
          
//           {/* Intersection Block */}
//           <rect x="340" y="340" width="120" height="120" fill="#16161d" />

//           {/* Traffic Lights Glow Indicators */}
//           {/* NS Active */}
//           <circle cx="475" cy="325" r="14" className={`svg-light ${state.light === 0 ? 'svg-green' : 'svg-red'}`} />
//           <circle cx="325" cy="475" r="14" className={`svg-light ${state.light === 0 ? 'svg-green' : 'svg-red'}`} />
          
//           {/* EW Active */}
//           <circle cx="325" cy="325" r="14" className={`svg-light ${state.light === 1 ? 'svg-green' : 'svg-red'}`} />
//           <circle cx="475" cy="475" r="14" className={`svg-light ${state.light === 1 ? 'svg-green' : 'svg-red'}`} />

//           {/* Cars NS Queue (Incoming from Top, flowing South)  */}
//           {Array.from({ length: state.nsQueue }).map((_, i) => (
//             <rect key={`ns-${i}`} x="415" y={290 - (i * 50)} width="30" height="42" rx="6" fill="url(#carGradNS)" className="svg-car" />
//           ))}

//           {/* Cars EW Queue (Incoming from Left, flowing East) */}
//           {Array.from({ length: state.ewQueue }).map((_, i) => (
//             <rect key={`ew-${i}`} x={290 - (i * 50)} y="415" width="42" height="30" rx="6" fill="url(#carGradEW)" className="svg-car" />
//           ))}

//           {/* Lane Visualization based on state.lanes */}
//           {Array.from({ length: state.lanes || 4 }).map((_, i) => (
//             <React.Fragment key={`lanes-visual-${i}`}>
//               <rect x={350 + (i * 20)} y="0" width="2" height="340" fill="#ffffff" opacity="0.2" />
//               <rect x="0" y={350 + (i * 20)} width="340" height="2" fill="#ffffff" opacity="0.2" />
//             </React.Fragment>
//           ))}

//           {/* Gradients and Filters */}
//           <defs>
//             <linearGradient id="carGradNS" x1="0%" y1="0%" x2="100%" y2="100%">
//               <stop offset="0%" stopColor="#00f2fe" />
//               <stop offset="100%" stopColor="#4facfe" />
//             </linearGradient>
//             <linearGradient id="carGradEW" x1="0%" y1="0%" x2="100%" y2="100%">
//               <stop offset="0%" stopColor="#f83600" />
//               <stop offset="100%" stopColor="#f9d423" />
//             </linearGradient>
//             <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
//               <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
//               <feMerge>
//                 <feMergeNode in="coloredBlur"/>
//                 <feMergeNode in="SourceGraphic"/>
//               </feMerge>
//             </filter>
//           </defs>
//         </svg>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './TrafficSimulation.css';

// ─── Car entity ────────────────────────────────────────────────────────────────
// direction: 'NS' (top→bottom) | 'SN' (bottom→top) | 'EW' (left→right) | 'WE' (right→left)
let carIdCounter = 0;
function createCar(direction) {
  const colors = ['#00f2fe','#4facfe','#f83600','#f9d423','#a78bfa','#34d399','#fb923c','#f472b6'];
  return {
    id: carIdCounter++,
    direction,
    color: colors[Math.floor(Math.random() * colors.length)],
    progress: 0,          // 0 → 1 across the whole road
    speed: 0.003 + Math.random() * 0.002,
    waiting: false,
    lane: Math.random() < 0.5 ? 0 : 1,  // dual lanes
  };
}

// ─── SVG constants ──────────────────────────────────────────────────────────────
const W = 800, H = 800;
const ROAD_W = 140;        // road width
const CX = W / 2, CY = H / 2;
const STOP_LINE_GAP = 12;  // pixels before intersection edge

// Road edges
const ROAD_NS_LEFT  = CX - ROAD_W / 2;   // 330
const ROAD_NS_RIGHT = CX + ROAD_W / 2;   // 470
const ROAD_EW_TOP   = CY - ROAD_W / 2;   // 330
const ROAD_EW_BOT   = CY + ROAD_W / 2;   // 470

// Intersection bounds
const IX1 = ROAD_NS_LEFT, IX2 = ROAD_NS_RIGHT;
const IY1 = ROAD_EW_TOP,  IY2 = ROAD_EW_BOT;

// Lane positions for dual lanes
function laneX(direction, lane) {
  // NS / SN: two sub-lanes within the vertical road
  if (direction === 'NS') return ROAD_NS_LEFT  + 25 + lane * 45;  // 355, 400 ≈ right half
  if (direction === 'SN') return ROAD_NS_RIGHT - 25 - lane * 45;  // 445, 400 ≈ left half
  return 0;
}
function laneY(direction, lane) {
  if (direction === 'EW') return ROAD_EW_TOP  + 25 + lane * 45;
  if (direction === 'WE') return ROAD_EW_BOT  - 25 - lane * 45;
  return 0;
}

// Map progress (0→1) to {x,y} position along the road
function carPosition(car) {
  const p = car.progress;
  switch (car.direction) {
    case 'NS': return { x: laneX('NS', car.lane), y: p * H };
    case 'SN': return { x: laneX('SN', car.lane), y: H - p * H };
    case 'EW': return { x: p * W, y: laneY('EW', car.lane) };
    case 'WE': return { x: W - p * W, y: laneY('WE', car.lane) };
    default:   return { x: 0, y: 0 };
  }
}

// Stop progress for each direction
const STOP_PROGRESS = {
  NS: (IY1 - STOP_LINE_GAP) / H,
  SN: (H - IY2 - STOP_LINE_GAP) / H,
  EW: (IX1 - STOP_LINE_GAP) / W,
  WE: (W - IX2 - STOP_LINE_GAP) / W,
};

function shouldStop(car, light) {
  // light=0 → NS green, EW red;  light=1 → EW green, NS red
  const isNS = car.direction === 'NS' || car.direction === 'SN';
  const isGreen = light === 0 ? isNS : !isNS;
  if (isGreen) return false;
  const stop = STOP_PROGRESS[car.direction];
  return car.progress >= stop - 0.02 && car.progress < stop + 0.02;
}

// ─── Car SVG shape ──────────────────────────────────────────────────────────────
function CarShape({ car }) {
  const { x, y } = carPosition(car);
  const isHoriz = car.direction === 'EW' || car.direction === 'WE';
  const W_car = isHoriz ? 38 : 22;
  const H_car = isHoriz ? 22 : 38;
  const flip = car.direction === 'SN' || car.direction === 'WE';
  const rotate = isHoriz ? 0 : 0;

  // Body colour + window colour
  const body = car.color;
  const win  = 'rgba(200,230,255,0.85)';

  return (
    <g transform={`translate(${x}, ${y})`} style={{ transition: 'transform 0.08s linear' }}>
      {/* Shadow */}
      <ellipse cx={0} cy={H_car / 2 + 4} rx={W_car * 0.45} ry={4} fill="rgba(0,0,0,0.25)" />
      {/* Body */}
      <rect x={-W_car/2} y={-H_car/2} width={W_car} height={H_car} rx={5} fill={body} />
      {/* Roof */}
      {isHoriz ? (
        <>
          <rect x={-W_car/2 + 7} y={-H_car/2 + 4} width={W_car - 18} height={H_car - 8} rx={3} fill={win} />
          {/* Headlights */}
          {!flip && <circle cx={ W_car/2 - 3} cy={-H_car/2 + 6} r={3} fill="#fffde7" opacity="0.9"/>}
          {!flip && <circle cx={ W_car/2 - 3} cy={ H_car/2 - 6} r={3} fill="#fffde7" opacity="0.9"/>}
          {flip  && <circle cx={-W_car/2 + 3} cy={-H_car/2 + 6} r={3} fill="#fffde7" opacity="0.9"/>}
          {flip  && <circle cx={-W_car/2 + 3} cy={ H_car/2 - 6} r={3} fill="#fffde7" opacity="0.9"/>}
          {/* Tail lights */}
          {!flip && <rect x={-W_car/2} y={-H_car/2 + 4} width={4} height={5} rx={1} fill="#ff1744" opacity="0.9"/>}
          {!flip && <rect x={-W_car/2} y={ H_car/2 - 9} width={4} height={5} rx={1} fill="#ff1744" opacity="0.9"/>}
        </>
      ) : (
        <>
          <rect x={-W_car/2 + 4} y={-H_car/2 + 7} width={W_car - 8} height={H_car - 18} rx={3} fill={win} />
          {/* Headlights (front) */}
          {!flip && <rect x={-W_car/2 + 3} y={ H_car/2 - 5} width={5} height={4} rx={1} fill="#fffde7" opacity="0.9"/>}
          {!flip && <rect x={ W_car/2 - 8} y={ H_car/2 - 5} width={5} height={4} rx={1} fill="#fffde7" opacity="0.9"/>}
          {flip  && <rect x={-W_car/2 + 3} y={-H_car/2 + 1} width={5} height={4} rx={1} fill="#fffde7" opacity="0.9"/>}
          {flip  && <rect x={ W_car/2 - 8} y={-H_car/2 + 1} width={5} height={4} rx={1} fill="#fffde7" opacity="0.9"/>}
          {/* Tail lights */}
          {!flip && <rect x={-W_car/2 + 3} y={-H_car/2 + 1} width={5} height={3} rx={1} fill="#ff1744" opacity="0.9"/>}
          {!flip && <rect x={ W_car/2 - 8} y={-H_car/2 + 1} width={5} height={3} rx={1} fill="#ff1744" opacity="0.9"/>}
        </>
      )}
    </g>
  );
}

// ─── Traffic Light Pole ─────────────────────────────────────────────────────────
function TrafficLightPole({ x, y, active, facing }) {
  // active: 'green' | 'red'
  const isGreen = active === 'green';
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Pole */}
      <rect x={-3} y={-60} width={6} height={60} rx={2} fill="#555" />
      {/* Housing */}
      <rect x={-12} y={-80} width={24} height={58} rx={5} fill="#1a1a1a" stroke="#333" strokeWidth={1.5}/>
      {/* Red light */}
      <circle cx={0} cy={-68} r={8}
        fill={isGreen ? '#3a0000' : '#ff1744'}
        filter={isGreen ? 'none' : 'url(#redGlow)'}
        style={{ transition: 'fill 0.4s' }}
      />
      {/* Amber (always off) */}
      <circle cx={0} cy={-52} r={8} fill="#2a2000" />
      {/* Green light */}
      <circle cx={0} cy={-36} r={8}
        fill={isGreen ? '#00e676' : '#003a15'}
        filter={isGreen ? 'url(#greenGlow)' : 'none'}
        style={{ transition: 'fill 0.4s' }}
      />
    </g>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function TrafficSimulation() {
  const [simState, setSimState] = useState({
    nsQueue: 0, ewQueue: 0, light: 0, cleared: 0,
    isRunning: false, spawnRate: 0.4, lanes: 4, intersection: 1
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Local animated cars
  const [cars, setCars] = useState([]);
  const animRef = useRef(null);
  const simStateRef = useRef(simState);
  simStateRef.current = simState;

  // ── Socket setup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const newSocket = io('http://localhost:5000', { withCredentials: true });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setSocket(newSocket);
      const savedConfig = localStorage.getItem("automationConfig");
      if (savedConfig) {
        try { newSocket.emit('update_config', JSON.parse(savedConfig)); } catch {}
      }
    });
    newSocket.on('disconnect', () => setIsConnected(false));
    newSocket.on('sim_update', (data) => {
      setSimState(data);
      setPerformanceData(prev => {
        const next = [...prev, { time: new Date().toLocaleTimeString(), cleared: data.cleared }];
        return next.length > 20 ? next.slice(1) : next;
      });
    });

    return () => newSocket.close();
  }, []);

  // ── Animation loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    let spawnTimer = 0;

    const tick = () => {
      const st = simStateRef.current;

      setCars(prev => {
        let next = prev
          .map(car => {
            if (!st.isRunning) return car;
            const stop = STOP_PROGRESS[car.direction];
            const atStop = car.progress >= stop - 0.015 && car.progress < stop + 0.01;
            const isNS = car.direction === 'NS' || car.direction === 'SN';
            const green = st.light === 0 ? isNS : !isNS;

            if (atStop && !green) {
              return { ...car, waiting: true };
            }
            return { ...car, waiting: false, progress: car.progress + car.speed };
          })
          .filter(car => car.progress < 1.05);  // remove when off-screen

        // Spawn new cars based on queue sizes
        spawnTimer++;
        if (st.isRunning && spawnTimer % 40 === 0) {
          const spawnChance = st.spawnRate || 0.4;
          const dirs = ['NS', 'SN', 'EW', 'WE'];
          dirs.forEach(dir => {
            if (Math.random() < spawnChance * 0.6) {
              next = [...next, createCar(dir)];
            }
          });
        }

        return next;
      });

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const handleStartPause = () => {
    if (!socket) return;
    simState.isRunning ? socket.emit('pause_sim') : socket.emit('start_sim');
  };
  const handleReset = () => {
    if (!socket) return;
    socket.emit('reset_sim');
    setCars([]);
  };
  const handleSpawnRate = (e) => {
    if (!socket) return;
    socket.emit('set_spawn_rate', parseFloat(e.target.value));
  };

  const nsGreen = simState.light === 0;
  const ewGreen = simState.light === 1;

  return (
    <div className="cyber-container">
      {/* ── LEFT DASHBOARD ── */}
      <div className="dashboard-sidebar">
        <div className="dashboard-header">
          <h1 className="cyber-title">SMART CITY AI</h1>
          <p className="cyber-subtitle">Q-Learning Traffic Control</p>
          <div className={`status-badge ${isConnected ? 'online' : 'offline'}`}>
            <div className="pulse-dot" />
            {isConnected ? 'LIVE CONNECTION' : 'DISCONNECTED'}
          </div>
        </div>

        <div className="control-panel glass-panel">
          <h3 className="panel-title">SIMULATION CONTROLS</h3>
          <div className="slider-wrapper">
            <div className="slider-header">
              <label>SPAWN RATE</label>
              <span className="slider-value">{Math.round((simState.spawnRate || 0.4) * 100)}%</span>
            </div>
            <input type="range" min="0.1" max="1.0" step="0.05"
              value={simState.spawnRate || 0.4}
              onChange={handleSpawnRate}
              disabled={!isConnected}
              className="cyber-slider"
            />
          </div>
          <div className="button-group">
            <button
              className={`cyber-btn ${!simState.isRunning ? 'action-start' : 'action-pause'}`}
              disabled={!isConnected}
              onClick={handleStartPause}
            >
              {simState.isRunning ? 'PAUSE' : 'START'}
            </button>
            <button className="cyber-btn action-reset" disabled={!isConnected} onClick={handleReset}>
              RESET
            </button>
          </div>
        </div>

        {/* Light Status Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <h3 className="panel-title" style={{ marginBottom: '1rem' }}>SIGNAL STATUS</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', margin: '0 auto 6px',
                background: nsGreen ? '#00e676' : '#3a0000',
                boxShadow: nsGreen ? '0 0 15px #00e676' : 'none',
                transition: 'all 0.4s'
              }} />
              <span style={{ fontSize: '0.7rem', color: '#8A92A6', letterSpacing: '1px' }}>
                N ↕ S
              </span>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: nsGreen ? '#00e676' : '#ff1744', marginTop: 4 }}>
                {nsGreen ? 'GREEN' : 'RED'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', margin: '0 auto 6px',
                background: ewGreen ? '#00e676' : '#3a0000',
                boxShadow: ewGreen ? '0 0 15px #00e676' : 'none',
                transition: 'all 0.4s'
              }} />
              <span style={{ fontSize: '0.7rem', color: '#8A92A6', letterSpacing: '1px' }}>
                E ↔ W
              </span>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: ewGreen ? '#00e676' : '#ff1744', marginTop: 4 }}>
                {ewGreen ? 'GREEN' : 'RED'}
              </div>
            </div>
          </div>
        </div>

        <div className="metrics-panel">
          <div className="metric-box glass-panel">
            <span className="metric-label">N–S QUEUE</span>
            <span className="metric-value">{simState.nsQueue || 0}</span>
          </div>
          <div className="metric-box glass-panel">
            <span className="metric-label">E–W QUEUE</span>
            <span className="metric-value">{simState.ewQueue || 0}</span>
          </div>
          <div className="metric-box highlight glass-panel">
            <span className="metric-label">THROUGHPUT</span>
            <span className="metric-value glowing-text">
              {simState.cleared || 0} <span className="unit">VEH</span>
            </span>
          </div>
        </div>

        <div className="chart-panel glass-panel" style={{ height: 200, marginTop: '1.5rem', padding: '1rem' }}>
          <h3 className="panel-title" style={{ marginBottom: '0.5rem', fontSize: '0.7rem' }}>THROUGHPUT TREND</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#6c7086" fontSize={10} />
              <Tooltip
                contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem' }}
                itemStyle={{ color: '#00f2fe' }}
              />
              <Line type="monotone" dataKey="cleared" stroke="#00f2fe" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── RIGHT: LIVE INTERSECTION SVG ── */}
      <div className="simulation-canvas">
        <svg viewBox={`0 0 ${W} ${H}`} className="intersection-svg">
          <defs>
            <filter id="greenGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="redGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="carShadow">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.4" />
            </filter>
            {/* Road texture lines */}
            <pattern id="roadLines" patternUnits="userSpaceOnUse" width="40" height="40">
              <line x1="0" y1="0" x2="0" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* ── SKY / GROUND ── */}
          <rect width={W} height={H} fill="#0e1117" />

          {/* Subtle grid */}
          <rect width={W} height={H} fill="url(#roadLines)" />

          {/* ── CITY BLOCK FILLS ── */}
          {/* 4 quadrants */}
          {[
            [0, 0, ROAD_NS_LEFT, ROAD_EW_TOP],
            [ROAD_NS_RIGHT, 0, W - ROAD_NS_RIGHT, ROAD_EW_TOP],
            [0, ROAD_EW_BOT, ROAD_NS_LEFT, H - ROAD_EW_BOT],
            [ROAD_NS_RIGHT, ROAD_EW_BOT, W - ROAD_NS_RIGHT, H - ROAD_EW_BOT],
          ].map(([x, y, w, h], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill="#131720" />
              {/* Building blocks */}
              {Array.from({ length: 6 }).map((_, bi) => {
                const bx = x + 10 + (bi % 3) * ((w - 20) / 3 + 4);
                const by = y + 10 + Math.floor(bi / 3) * ((h - 20) / 2 + 6);
                const bw = Math.max(20, (w - 40) / 3);
                const bh = Math.max(20, (h - 40) / 2);
                return bw > 15 && bh > 15 ? (
                  <rect key={bi} x={bx} y={by} width={bw} height={bh}
                    fill={`rgba(30,40,60,${0.6 + bi * 0.05})`}
                    stroke="rgba(255,255,255,0.04)" strokeWidth="1" rx="2"
                  />
                ) : null;
              })}
            </g>
          ))}

          {/* ── ROADS ── */}
          {/* North-South road */}
          <rect x={ROAD_NS_LEFT} y={0} width={ROAD_W} height={H} fill="#1c1f2b" />
          {/* Road edge stripes */}
          <line x1={ROAD_NS_LEFT} y1={0} x2={ROAD_NS_LEFT} y2={H} stroke="#facc15" strokeWidth={3} />
          <line x1={ROAD_NS_RIGHT} y1={0} x2={ROAD_NS_RIGHT} y2={H} stroke="#facc15" strokeWidth={3} />
          {/* NS Center dashes */}
          {Array.from({ length: 14 }).map((_, i) => (
            <rect key={i} x={CX - 2} y={i * 60 + 10} width={4} height={30}
              fill="rgba(255,255,255,0.25)" rx={2}
            />
          ))}

          {/* East-West road */}
          <rect x={0} y={ROAD_EW_TOP} width={W} height={ROAD_W} fill="#1c1f2b" />
          <line x1={0} y1={ROAD_EW_TOP} x2={W} y2={ROAD_EW_TOP} stroke="#facc15" strokeWidth={3} />
          <line x1={0} y1={ROAD_EW_BOT} x2={W} y2={ROAD_EW_BOT} stroke="#facc15" strokeWidth={3} />
          {/* EW Center dashes */}
          {Array.from({ length: 14 }).map((_, i) => (
            <rect key={i} x={i * 60 + 10} y={CY - 2} width={30} height={4}
              fill="rgba(255,255,255,0.25)" rx={2}
            />
          ))}

          {/* ── INTERSECTION ── */}
          <rect x={IX1} y={IY1} width={IX2 - IX1} height={IY2 - IY1} fill="#20242e" />
          {/* Crosswalk stripes - N side */}
          {Array.from({ length: 5 }).map((_, i) => (
            <rect key={`cwn${i}`} x={ROAD_NS_LEFT + 8 + i * 25} y={IY1 - 18} width={14} height={16}
              fill="rgba(255,255,255,0.15)" rx={1} />
          ))}
          {/* Crosswalk stripes - S side */}
          {Array.from({ length: 5 }).map((_, i) => (
            <rect key={`cws${i}`} x={ROAD_NS_LEFT + 8 + i * 25} y={IY2 + 2} width={14} height={16}
              fill="rgba(255,255,255,0.15)" rx={1} />
          ))}
          {/* Crosswalk stripes - W side */}
          {Array.from({ length: 5 }).map((_, i) => (
            <rect key={`cww${i}`} x={IX1 - 18} y={ROAD_EW_TOP + 8 + i * 25} width={16} height={14}
              fill="rgba(255,255,255,0.15)" rx={1} />
          ))}
          {/* Crosswalk stripes - E side */}
          {Array.from({ length: 5 }).map((_, i) => (
            <rect key={`cwe${i}`} x={IX2 + 2} y={ROAD_EW_TOP + 8 + i * 25} width={16} height={14}
              fill="rgba(255,255,255,0.15)" rx={1} />
          ))}

          {/* Stop lines */}
          {/* NS stop lines */}
          <line x1={ROAD_NS_LEFT} y1={IY1 - STOP_LINE_GAP} x2={ROAD_NS_RIGHT} y2={IY1 - STOP_LINE_GAP}
            stroke="white" strokeWidth={3} opacity="0.6" />
          <line x1={ROAD_NS_LEFT} y1={IY2 + STOP_LINE_GAP} x2={ROAD_NS_RIGHT} y2={IY2 + STOP_LINE_GAP}
            stroke="white" strokeWidth={3} opacity="0.6" />
          {/* EW stop lines */}
          <line x1={IX1 - STOP_LINE_GAP} y1={ROAD_EW_TOP} x2={IX1 - STOP_LINE_GAP} y2={ROAD_EW_BOT}
            stroke="white" strokeWidth={3} opacity="0.6" />
          <line x1={IX2 + STOP_LINE_GAP} y1={ROAD_EW_TOP} x2={IX2 + STOP_LINE_GAP} y2={ROAD_EW_BOT}
            stroke="white" strokeWidth={3} opacity="0.6" />

          {/* ── TRAFFIC LIGHT POLES (4 corners) ── */}
          {/* NW corner — controls EW traffic going East */}
          <TrafficLightPole x={IX1 - 30} y={IY1 - 10} active={ewGreen ? 'green' : 'red'} />
          {/* NE corner — controls NS traffic going South */}
          <TrafficLightPole x={IX2 + 30} y={IY1 - 10} active={nsGreen ? 'green' : 'red'} />
          {/* SW corner — controls NS traffic going North */}
          <TrafficLightPole x={IX1 - 30} y={IY2 + 10} active={nsGreen ? 'green' : 'red'} />
          {/* SE corner — controls EW traffic going West */}
          <TrafficLightPole x={IX2 + 30} y={IY2 + 10} active={ewGreen ? 'green' : 'red'} />

          {/* ── ANIMATED CARS ── */}
          <g filter="url(#carShadow)">
            {cars.map(car => (
              <CarShape key={car.id} car={car} />
            ))}
          </g>

          {/* ── AMBIENT GLOW ON INTERSECTION ── */}
          <circle cx={CX} cy={CY} r={70}
            fill={nsGreen ? 'rgba(0,230,118,0.04)' : 'rgba(255,61,0,0.04)'}
            style={{ transition: 'fill 0.4s' }}
          />
        </svg>
      </div>
    </div>
  );
}
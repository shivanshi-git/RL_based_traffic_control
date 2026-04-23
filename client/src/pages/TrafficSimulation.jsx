import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './TrafficSimulation.css';

export default function TrafficSimulation() {
  const [state, setState] = useState({
    nsQueue: 0, ewQueue: 0, light: 0, cleared: 0,
    isRunning: false, spawnRate: 0.4, lanes: 4, intersection: 1
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to the Node Backend Socket
    const newSocket = io('http://localhost:5000', {
      withCredentials: true
    });

    newSocket.on('connect', () => {
        setIsConnected(true);
        setSocket(newSocket);

        // Send configuration if it exists
        const savedConfig = localStorage.getItem("automationConfig");
        if (savedConfig) {
          try {
            const config = JSON.parse(savedConfig);
            newSocket.emit('update_config', config);
          } catch (e) {
            console.error("Failed to parse automationConfig", e);
          }
        }
    });
    
    newSocket.on('disconnect', () => {
        setIsConnected(false);
    });

    // Listen for the simulation state stream continuously
    newSocket.on('sim_update', (data) => {
      setState(data);
      
      // Update chart data (keeping last 20 points)
      setPerformanceData(prev => {
        const newData = [...prev, { time: new Date().toLocaleTimeString(), cleared: data.cleared }];
        if (newData.length > 20) return newData.slice(1);
        return newData;
      });
    });

    return () => newSocket.close();
  }, []);

  const handleStartPause = () => {
    if (!socket) return;
    if (state.isRunning) socket.emit('pause_sim');
    else socket.emit('start_sim');
  };

  const handleReset = () => {
    if (!socket) return;
    socket.emit('reset_sim');
  };

  const handleSpawnRate = (e) => {
    if (!socket) return;
    socket.emit('set_spawn_rate', parseFloat(e.target.value));
  };

  return (
    <div className="cyber-container">
      {/* LEFT DASHBOARD PANEL */}
      <div className="dashboard-sidebar">
        <div className="dashboard-header">
            <h1 className="cyber-title">SMART CITY AI</h1>
            <p className="cyber-subtitle">Q-Learning Traffic Control Network</p>
            <div className={`status-badge ${isConnected ? 'online' : 'offline'}`}>
               <div className="pulse-dot"></div>
               {isConnected ? 'NODE.JS SECURE LINK ONLINE' : 'CONNECTION LOST'}
            </div>
        </div>

        <div className="control-panel glass-panel">
            <h3 className="panel-title">SIMULATION CONTROLS</h3>
            
            <div className="slider-wrapper">
                <div className="slider-header">
                    <label>TRAFFIC SPAWN RATE</label>
                    <span className="slider-value">{Math.round((state.spawnRate || 0.4) * 100)}%</span>
                </div>
                <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.05" 
                    value={state.spawnRate || 0.4} 
                    onChange={handleSpawnRate} 
                    disabled={!isConnected} 
                    className="cyber-slider" 
                />
            </div>

            <div className="button-group">
                <button 
                    className={`cyber-btn ${!state.isRunning ? 'action-start' : 'action-pause'}`} 
                    disabled={!isConnected} 
                    onClick={handleStartPause}
                >
                    {state.isRunning ? 'PAUSE ENGINE' : 'START ENGINE'}
                </button>
                <button 
                    className="cyber-btn action-reset" 
                    disabled={!isConnected} 
                    onClick={handleReset}
                >
                    REBOOT
                </button>
            </div>
        </div>

        <div className="metrics-panel">
           <div className="metric-box glass-panel">
             <span className="metric-label">NORTH-SOUTH QUEUE</span>
             <span className="metric-value">{state.nsQueue || 0}</span>
           </div>
           <div className="metric-box glass-panel">
             <span className="metric-label">EAST-WEST QUEUE</span>
             <span className="metric-value">{state.ewQueue || 0}</span>
           </div>
            <div className="metric-box highlight glass-panel">
              <span className="metric-label">THROUGHPUT VOLUME</span>
              <span className="metric-value glowing-text">{state.cleared || 0} <span className="unit">VEHICLES</span></span>
            </div>
         </div>

         {/* REAL-TIME PERFORMANCE CHART */}
         <div className="chart-panel glass-panel" style={{ height: '200px', marginTop: '1.5rem', padding: '1rem' }}>
            <h3 className="panel-title" style={{ marginBottom: '1rem', fontSize: '0.7rem' }}>EFFICIENCY ANALYTICS</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="#6c7086" fontSize={10} />
                    <Tooltip 
                        contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem' }}
                        itemStyle={{ color: '#00f2fe' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="cleared" 
                        stroke="#00f2fe" 
                        strokeWidth={2} 
                        dot={false} 
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* RIGHT SVG MAP VISUALIZER */}
      <div className="simulation-canvas">
        <svg viewBox="0 0 800 800" className="intersection-svg">
          {/* Background Layer */}
          <rect width="800" height="800" fill="#ffffff" />
          
          {/* North-South Road */}
          <rect x="340" y="0" width="120" height="800" fill="#111116" />
          <line x1="400" y1="0" x2="400" y2="800" stroke="#ffffff" strokeWidth="4" strokeDasharray="20,20" />
          
          {/* East-West Road */}
          <rect x="0" y="340" width="800" height="120" fill="#111116" />
          <line x1="0" y1="400" x2="800" y2="400" stroke="#ffffff" strokeWidth="4" strokeDasharray="20,20" />
          
          {/* Intersection Block */}
          <rect x="340" y="340" width="120" height="120" fill="#16161d" />

          {/* Traffic Lights Glow Indicators */}
          {/* NS Active */}
          <circle cx="475" cy="325" r="14" className={`svg-light ${state.light === 0 ? 'svg-green' : 'svg-red'}`} />
          <circle cx="325" cy="475" r="14" className={`svg-light ${state.light === 0 ? 'svg-green' : 'svg-red'}`} />
          
          {/* EW Active */}
          <circle cx="325" cy="325" r="14" className={`svg-light ${state.light === 1 ? 'svg-green' : 'svg-red'}`} />
          <circle cx="475" cy="475" r="14" className={`svg-light ${state.light === 1 ? 'svg-green' : 'svg-red'}`} />

          {/* Cars NS Queue (Incoming from Top, flowing South)  */}
          {Array.from({ length: state.nsQueue }).map((_, i) => (
            <rect key={`ns-${i}`} x="415" y={290 - (i * 50)} width="30" height="42" rx="6" fill="url(#carGradNS)" className="svg-car" />
          ))}

          {/* Cars EW Queue (Incoming from Left, flowing East) */}
          {Array.from({ length: state.ewQueue }).map((_, i) => (
            <rect key={`ew-${i}`} x={290 - (i * 50)} y="415" width="42" height="30" rx="6" fill="url(#carGradEW)" className="svg-car" />
          ))}

          {/* Lane Visualization based on state.lanes */}
          {Array.from({ length: state.lanes || 4 }).map((_, i) => (
            <React.Fragment key={`lanes-visual-${i}`}>
              <rect x={350 + (i * 20)} y="0" width="2" height="340" fill="#ffffff" opacity="0.2" />
              <rect x="0" y={350 + (i * 20)} width="340" height="2" fill="#ffffff" opacity="0.2" />
            </React.Fragment>
          ))}

          {/* Gradients and Filters */}
          <defs>
            <linearGradient id="carGradNS" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#4facfe" />
            </linearGradient>
            <linearGradient id="carGradEW" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f83600" />
              <stop offset="100%" stopColor="#f9d423" />
            </linearGradient>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

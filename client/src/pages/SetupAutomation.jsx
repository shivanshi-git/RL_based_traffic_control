import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './TrafficSimulation.css';

const SetupAutomation = () => {
  const navigate = useNavigate();

  const [intersection, setIntersection] = useState(1);
  const [lanes, setLanes] = useState(4);
  const [pedestrians, setPedestrians] = useState([true, true, true, false]);
  const [cycleLength, setCycleLength] = useState(100);
  const [redTime, setRedTime] = useState(20);
  const [yellowTime, setYellowTime] = useState(3);
  const [greenTime, setGreenTime] = useState(87);
  const [showAdditional, setShowAdditional] = useState(false);

  const handleNext = () => {
    const config = {
      intersection,
      lanes,
      cycleLength,
      redTime,
      yellowTime,
      greenTime,
    };
    localStorage.setItem("automationConfig", JSON.stringify(config));
    navigate("/setup-queue");
  };

  return (
    <div className="cyber-container" style={{ flexDirection: 'column', overflow: 'auto', height: '100vh' }}>
      
      {/* Top Header */}
      <div style={{ 
        padding: '2rem 2.5rem 1rem', 
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #050508 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="cyber-title" style={{ fontSize: '2rem' }}>AUTOMATION SETTINGS</h1>
            <p className="cyber-subtitle">Configure Your Intersection Parameters</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 20px',
              borderRadius: '50px',
              color: '#a0a0b0',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: '0.8rem',
              letterSpacing: '1px',
            }}
          >
            ← BACK
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        display: 'flex', 
        flex: 1, 
        overflow: 'auto',
        background: 'radial-gradient(circle at center, #111116 0%, #050505 100%)'
      }}>
        
        {/* Left Config Panel */}
        <div style={{ 
          flex: '0 0 480px', 
          padding: '2rem 2.5rem',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          overflowY: 'auto'
        }}>
          
          {/* Intersection Config */}
          <div className="glass-panel">
            <h3 className="panel-title">INTERSECTION CONFIGURATION</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Intersection Type */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#6c7086', letterSpacing: '1.5px', fontWeight: 600 }}>INTERSECTION</span>
                <div style={{ margin: '0.8rem auto', width: '56px', height: '56px' }}>
                  <svg viewBox="0 0 64 64" style={{ width: '100%', height: '100%' }}>
                    <rect x="24" y="0" width="16" height="64" rx="2" fill="#1a1a24" stroke="#2a2a3a" strokeWidth="1" />
                    <rect x="0" y="24" width="64" height="16" rx="2" fill="#1a1a24" stroke="#2a2a3a" strokeWidth="1" />
                    <rect x="24" y="24" width="16" height="16" fill="#00f2fe" opacity="0.15" />
                    <line x1="32" y1="4" x2="32" y2="20" stroke="#00f2fe" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                    <line x1="32" y1="44" x2="32" y2="60" stroke="#00f2fe" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                    <line x1="4" y1="32" x2="20" y2="32" stroke="#00f2fe" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                    <line x1="44" y1="32" x2="60" y2="32" stroke="#00f2fe" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                  </svg>
                </div>
              </div>

              {/* Lanes */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#6c7086', letterSpacing: '1.5px', fontWeight: 600 }}>LANES</span>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', margin: '0.8rem 0' }}>
                  {[1, 2, 3, 4].map((lane) => (
                    <div
                      key={lane}
                      style={{
                        width: '6px',
                        height: '56px',
                        borderRadius: '50px',
                        background: lane <= lanes 
                          ? 'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)' 
                          : '#1a1a24',
                        boxShadow: lane <= lanes ? '0 0 10px rgba(0,242,254,0.3)' : 'none',
                        transition: 'all 0.3s'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Road Count */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#6c7086', letterSpacing: '1.5px', fontWeight: 600 }}>ROADS</span>
                <div style={{ margin: '0.8rem 0' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{intersection}</span>
                  <span style={{ fontSize: '1rem', color: '#00f2fe', fontWeight: 800, marginLeft: '4px' }}>R</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button onClick={() => setIntersection(Math.max(1, intersection - 1))} className="cyber-btn action-reset" style={{ flex: 'none', padding: '4px 12px', fontSize: '0.8rem', borderRadius: '8px' }}>−</button>
                  <button onClick={() => setIntersection(intersection + 1)} className="cyber-btn action-reset" style={{ flex: 'none', padding: '4px 12px', fontSize: '0.8rem', borderRadius: '8px' }}>+</button>
                </div>
              </div>
            </div>

            {/* Pedestrians */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.75rem', color: '#6c7086', letterSpacing: '1.5px', fontWeight: 600 }}>PEDESTRIANS</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {pedestrians.map((active, i) => {
                  const colors = ['#00e676', '#ffd600', '#ff9100', '#ff3d00'];
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        const updated = [...pedestrians];
                        updated[i] = !updated[i];
                        setPedestrians(updated);
                      }}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: 'none',
                        cursor: 'pointer',
                        background: active ? colors[i] : '#1a1a24',
                        boxShadow: active ? `0 0 12px ${colors[i]}60` : 'none',
                        transition: 'all 0.3s',
                        transform: active ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cycle Length */}
          <div className="glass-panel">
            <h3 className="panel-title">SIGNAL CYCLE TIMING</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a0a0b0' }}>CYCLE LENGTH</span>
              <span className="slider-value" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{cycleLength}s</span>
            </div>

            <input
              type="range"
              min="30"
              max="200"
              value={cycleLength}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setCycleLength(val);
                setRedTime(Math.round(val * 0.2));
                setYellowTime(Math.round(val * 0.03));
                setGreenTime(val - Math.round(val * 0.2) - Math.round(val * 0.03));
              }}
              className="cyber-slider"
              style={{ marginBottom: '0.5rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#6c7086', marginBottom: '2rem' }}>
              <span>0s</span>
              <span>200s</span>
            </div>

            {/* Signal Timing Rings */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
              {/* Red */}
              <div style={{ position: 'relative', textAlign: 'center' }}>
                <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#1a1a24" strokeWidth="5" />
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#ff3d00" strokeWidth="5"
                    strokeDasharray={`${(redTime / cycleLength) * 175.93} 175.93`}
                    strokeLinecap="round" style={{ transition: 'all 0.5s', filter: 'drop-shadow(0 0 6px rgba(255,61,0,0.5))' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ff3d00' }}>{redTime}</span>
                </div>
              </div>

              {/* Yellow */}
              <div style={{ position: 'relative', textAlign: 'center' }}>
                <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#1a1a24" strokeWidth="5" />
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#ffd600" strokeWidth="5"
                    strokeDasharray={`${(yellowTime / cycleLength) * 175.93} 175.93`}
                    strokeLinecap="round" style={{ transition: 'all 0.5s', filter: 'drop-shadow(0 0 6px rgba(255,214,0,0.5))' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffd600' }}>{yellowTime}</span>
                </div>
              </div>

              {/* Green */}
              <div style={{ position: 'relative', textAlign: 'center' }}>
                <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#1a1a24" strokeWidth="5" />
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#00e676" strokeWidth="5"
                    strokeDasharray={`${(greenTime / cycleLength) * 175.93} 175.93`}
                    strokeLinecap="round" style={{ transition: 'all 0.5s', filter: 'drop-shadow(0 0 6px rgba(0,230,118,0.5))' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00e676' }}>{greenTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <button
            onClick={() => setShowAdditional(!showAdditional)}
            style={{
              background: 'none',
              border: 'none',
              color: '#00f2fe',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '1px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: '1rem',
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
              textDecorationColor: 'rgba(0,242,254,0.3)',
            }}
          >
            {showAdditional ? '▲ HIDE ADVANCED' : '▼ ADVANCED SETTINGS'}
          </button>

          {showAdditional && (
            <div className="glass-panel" style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.65rem', color: '#6c7086', letterSpacing: '1.5px', fontWeight: 600 }}>RED (s)</label>
                  <input type="number" value={redTime}
                    onChange={(e) => setRedTime(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ width: '100%', marginTop: '6px', background: '#1a1a24', border: '1px solid rgba(255,61,0,0.3)', borderRadius: '10px', padding: '8px 12px', fontSize: '1rem', fontWeight: 800, color: '#ff3d00', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', color: '#6c7086', letterSpacing: '1.5px', fontWeight: 600 }}>YELLOW (s)</label>
                  <input type="number" value={yellowTime}
                    onChange={(e) => setYellowTime(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ width: '100%', marginTop: '6px', background: '#1a1a24', border: '1px solid rgba(255,214,0,0.3)', borderRadius: '10px', padding: '8px 12px', fontSize: '1rem', fontWeight: 800, color: '#ffd600', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', color: '#6c7086', letterSpacing: '1.5px', fontWeight: 600 }}>GREEN (s)</label>
                  <input type="number" value={greenTime}
                    onChange={(e) => setGreenTime(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ width: '100%', marginTop: '6px', background: '#1a1a24', border: '1px solid rgba(0,230,118,0.3)', borderRadius: '10px', padding: '8px 12px', fontSize: '1rem', fontWeight: 800, color: '#00e676', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Visual Preview */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: '450px', borderRadius: '24px', boxShadow: '0 0 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)', background: '#09090b' }}>
            <rect width="400" height="400" fill="#09090b" />
            {/* NS Road */}
            <rect x="170" y="0" width="60" height="400" fill="#111116" />
            <line x1="200" y1="0" x2="200" y2="400" stroke="#22222a" strokeWidth="2" strokeDasharray="12,12" />
            {/* EW Road */}
            <rect x="0" y="170" width="400" height="60" fill="#111116" />
            <line x1="0" y1="200" x2="400" y2="200" stroke="#22222a" strokeWidth="2" strokeDasharray="12,12" />
            {/* Intersection */}
            <rect x="170" y="170" width="60" height="60" fill="#16161d" />
            {/* Lights */}
            <circle cx="237" cy="163" r="8" fill="#00e676" filter="url(#previewGlow)" />
            <circle cx="163" cy="237" r="8" fill="#00e676" filter="url(#previewGlow)" />
            <circle cx="163" cy="163" r="8" fill="#ff3d00" filter="url(#previewGlow)" />
            <circle cx="237" cy="237" r="8" fill="#ff3d00" filter="url(#previewGlow)" />
            {/* Lane indicators */}
            {Array.from({ length: lanes }).map((_, i) => (
              <rect key={`lane-ns-${i}`} x={175 + i * 12} y="60" width="8" height="2" fill="#00f2fe" opacity="0.4" rx="1" />
            ))}
            {Array.from({ length: lanes }).map((_, i) => (
              <rect key={`lane-ew-${i}`} x="60" y={175 + i * 12} width="2" height="8" fill="#00f2fe" opacity="0.4" rx="1" />
            ))}
            <defs>
              <filter id="previewGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
          </svg>

          {/* Next Button */}
          <button
            className="cyber-btn action-start"
            onClick={handleNext}
            style={{ marginTop: '2rem', flex: 'none', padding: '1rem 3rem', fontSize: '1rem', letterSpacing: '2px' }}
          >
            PROCEED TO QUEUE SETUP →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SetupAutomation;

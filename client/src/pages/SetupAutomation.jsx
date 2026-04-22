import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SetupAutomation = () => {
  const navigate = useNavigate();

  const [intersection, setIntersection] = useState(1);
  const [lanes, setLanes] = useState(4);
  const [road, setRoad] = useState("1R");
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
      road,
      cycleLength,
      redTime,
      yellowTime,
      greenTime,
    };
    localStorage.setItem("automationConfig", JSON.stringify(config));
    navigate("/setup-queue");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 font-['Inter',sans-serif]">
      {/* Floating background shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6 group"
        >
          <svg
            className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-rose-400 font-medium">BACK</span>
        </button>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-800 mb-8">Automation Setting</h1>

        {/* Intersection / Lanes / Road Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 mb-4 shadow-lg shadow-slate-200/50 border border-white/80">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Intersection */}
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Intersection</p>
              <div className="flex justify-center">
                <div className="relative w-16 h-16">
                  {/* Crossroad icon */}
                  <svg viewBox="0 0 64 64" className="w-full h-full">
                    <rect x="24" y="0" width="16" height="64" rx="2" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
                    <rect x="0" y="24" width="64" height="16" rx="2" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
                    <rect x="24" y="24" width="16" height="16" fill="#fde68a" stroke="#fbbf24" strokeWidth="1" />
                    <line x1="32" y1="4" x2="32" y2="20" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="32" y1="44" x2="32" y2="60" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="4" y1="32" x2="20" y2="32" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="44" y1="32" x2="60" y2="32" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Lanes */}
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Lanes</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4].map((lane) => (
                  <div
                    key={lane}
                    className={`w-2 h-16 rounded-full transition-colors duration-300 ${
                      lane <= lanes ? "bg-indigo-500" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Road */}
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Road</p>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-lg">
                  <span>{intersection}</span>
                  <span className="text-rose-400">R</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => setIntersection(Math.max(1, intersection - 1))}
                    className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs text-slate-600 transition-colors"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setIntersection(intersection + 1)}
                    className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs text-slate-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pedestrians */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pedestrians</p>
            <div className="flex gap-2">
              {pedestrians.map((active, i) => {
                const colors = ["bg-emerald-400", "bg-amber-400", "bg-orange-400", "bg-rose-300"];
                return (
                  <button
                    key={i}
                    onClick={() => {
                      const updated = [...pedestrians];
                      updated[i] = !updated[i];
                      setPedestrians(updated);
                    }}
                    className={`w-5 h-5 rounded-full transition-all duration-300 ${
                      active
                        ? `${colors[i]} shadow-md scale-110`
                        : "bg-slate-200 scale-100"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Cycle Length Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 mb-4 shadow-lg shadow-slate-200/50 border border-white/80">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cycle Length</p>
            <div className="bg-indigo-50 text-indigo-600 font-bold text-sm px-3 py-1 rounded-lg">
              {cycleLength}s
            </div>
          </div>

          {/* Range slider */}
          <div className="relative mb-6">
            <input
              type="range"
              min="30"
              max="200"
              value={cycleLength}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setCycleLength(val);
                // proportionally distribute
                const total = val;
                setRedTime(Math.round(total * 0.2));
                setYellowTime(Math.round(total * 0.03));
                setGreenTime(total - Math.round(total * 0.2) - Math.round(total * 0.03));
              }}
              className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500
                [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-indigo-300
                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-125"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0s</span>
              <span>200s</span>
            </div>
          </div>

          {/* Signal timing circles */}
          <div className="flex items-center justify-center gap-6">
            {/* Red */}
            <div className="relative">
              <svg className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#fee2e2" strokeWidth="5" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="5"
                  strokeDasharray={`${(redTime / cycleLength) * 163.36} 163.36`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-rose-500">{redTime}</span>
              </div>
            </div>

            {/* Yellow */}
            <div className="relative">
              <svg className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#fef3c7" strokeWidth="5" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="5"
                  strokeDasharray={`${(yellowTime / cycleLength) * 163.36} 163.36`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-amber-500">{yellowTime}</span>
              </div>
            </div>

            {/* Green */}
            <div className="relative">
              <svg className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#d1fae5" strokeWidth="5" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="5"
                  strokeDasharray={`${(greenTime / cycleLength) * 163.36} 163.36`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-emerald-500">{greenTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Settings Toggle */}
        <button
          onClick={() => setShowAdditional(!showAdditional)}
          className="text-sm text-indigo-400 hover:text-indigo-600 transition-colors mb-6 underline underline-offset-4 decoration-indigo-200"
        >
          Additional settings
        </button>

        {showAdditional && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 mb-4 shadow-lg shadow-slate-200/50 border border-white/80 animate-fadeIn">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Red (s)</label>
                <input
                  type="number"
                  value={redTime}
                  onChange={(e) => setRedTime(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full mt-1 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-sm font-bold text-rose-600 outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Yellow (s)</label>
                <input
                  type="number"
                  value={yellowTime}
                  onChange={(e) => setYellowTime(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full mt-1 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm font-bold text-amber-600 outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Green (s)</label>
                <input
                  type="number"
                  value={greenTime}
                  onChange={(e) => setGreenTime(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full mt-1 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-sm font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* Next FAB */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleNext}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-300/50
              flex items-center justify-center text-white hover:scale-110 active:scale-95
              transition-all duration-300 group"
          >
            <svg
              className="w-6 h-6 transform group-hover:translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default SetupAutomation;

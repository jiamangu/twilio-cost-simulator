import { useState, useEffect } from 'react';

export function NumInput({ label, value, onChange, unit, min = 0, max = 999999, step = 1, hint }) {
  const [local, setLocal] = useState(String(value));
  useEffect(() => { setLocal(String(value)); }, [value]);
  const commit = (v) => {
    const n = parseFloat(v);
    if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
    else setLocal(String(value));
  };
  return (
    <div className="mb-3">
      <div className="text-xs text-slate-600 mb-1 font-medium">{label}</div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => commit(value - step)} className="w-8 h-8 rounded-lg border border-slate-300 bg-white text-slate-500 text-base font-semibold flex items-center justify-center shrink-0 cursor-pointer hover:bg-slate-50">−</button>
        <div className="relative flex-1">
          <input type="text" inputMode="decimal" value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit(e.target.value)}
            className="w-full h-8 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-semibold text-center outline-none tabular-nums px-7 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
          {unit && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">{unit}</span>}
        </div>
        <button onClick={() => commit(value + step)} className="w-8 h-8 rounded-lg border border-slate-300 bg-white text-slate-500 text-base font-semibold flex items-center justify-center shrink-0 cursor-pointer hover:bg-slate-50">+</button>
      </div>
      {hint && <div className="text-[11px] text-slate-400 mt-0.5">{hint}</div>}
    </div>
  );
}

export function Chip({ label, active, onClick, icon, desc, compact }) {
  return (
    <button onClick={onClick} className={`rounded-xl border-[1.5px] cursor-pointer text-[13px] font-medium transition-all flex-1 text-left ${compact ? 'py-1.5 px-3 flex-row items-center gap-1.5' : 'py-2 px-3 flex-col items-start gap-0.5'} flex ${active ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
      {icon && <span className={compact ? 'text-sm' : 'text-base'}>{icon}</span>}
      <div>
        <div className="font-semibold text-[13px]">{label}</div>
        {desc && !compact && <div className="text-[10px] text-slate-400 mt-0.5">{desc}</div>}
      </div>
    </button>
  );
}

import { fmtUSD } from '../utils/format';

export function OutboundCard({ market, result, tag, destType, jpNumberType, marketKey }) {
  const tagStyle = tag === "最低" ? "text-emerald-600 border-emerald-500 bg-emerald-50" : tag === "最高" ? "text-red-600 border-red-500 bg-red-50" : "";
  const borderColor = tag === "最低" ? "border-emerald-500" : tag === "最高" ? "border-red-500" : "border-slate-200";
  const linkLabel = market.outLabelFn(destType, jpNumberType);
  const accentColor = marketKey === 'us' ? 'bg-emerald-500' : marketKey === 'uk' ? 'bg-indigo-500' : 'bg-amber-500';
  return (
    <div className={`bg-white rounded-xl border-[1.5px] ${borderColor} overflow-hidden flex-1 min-w-0 relative shadow-md`}>
      <div className={`h-1 ${accentColor}`} />
      {tag && (
        <div className={`absolute top-3 right-4 px-2 py-0.5 rounded text-[10px] font-semibold border ${tagStyle}`}>{tag}成本</div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{market.flag}</span>
          <div className="text-[15px] font-bold text-slate-900">拨打{market.name}候选人</div>
        </div>
        <div className="text-[11px] text-slate-400 mb-4 pl-9">{linkLabel}</div>

        <div className="mb-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">每通</div>
          <div className="text-[22px] font-bold text-slate-900 tabular-nums leading-tight">{fmtUSD(result.perCallTotal)}</div>
        </div>
        <div className="mb-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">每分钟</div>
          <div className="text-[17px] font-semibold text-slate-900 tabular-nums">{fmtUSD(result.perMinuteTotal)}<span className="text-xs text-slate-400">/min</span></div>
        </div>
        <div className="border-t border-slate-100 pt-3 mb-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">月度总计</div>
          <div className="text-[19px] font-bold text-slate-900 tabular-nums">{fmtUSD(result.monthlyTotal)}</div>
        </div>
        <div className="border-t border-slate-100 pt-2">
          {result.breakdown.map((item, i) => (
            <div key={i} className="flex justify-between mb-0.5 text-xs">
              <span className="text-slate-500">{item.label}</span>
              <span className="text-slate-600 tabular-nums">{fmtUSD(item.value)}</span>
            </div>
          ))}
        </div>
        {result.surchargeApplied && (
          <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
            <div className="text-[11px] text-red-600 font-semibold">⚠️ Surcharge 触发</div>
            {result.surchargeDetails.map((s, i) => <div key={i} className="text-[11px] text-red-500 mt-0.5">{s}</div>)}
          </div>
        )}
        {market.outNote && <div className="mt-2 text-[11px] text-slate-400 italic">{market.outNote}</div>}
      </div>
    </div>
  );
}

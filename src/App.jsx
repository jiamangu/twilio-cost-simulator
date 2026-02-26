import { useState, useMemo } from 'react';
import { MARKETS } from './data/markets';
import { ADDONS } from './data/addons';
import { PRESETS } from './data/presets';
import { fmtUSD } from './utils/format';
import { calculateOutbound, calculateInbound } from './utils/calculations';
import { useIsMobile } from './hooks/useIsMobile';
import { NumInput } from './components/NumInput';
import { Chip } from './components/Chip';
import { OutboundCard } from './components/OutboundCard';
import { InboundCard } from './components/InboundCard';

export default function CostSimulator() {
  const isMobile = useIsMobile();
  const [preset, setPreset] = useState("growth");
  const [monthlyOutbound, setMonthlyOutbound] = useState(25000);
  const [avgDuration, setAvgDuration] = useState(2);
  const [answerRate, setAnswerRate] = useState(40);
  const [destType, setDestType] = useState("mobile");
  const [numberPoolSize, setNumberPoolSize] = useState(25);
  const [jpNumberType, setJpNumberType] = useState("national");
  const [addons, setAddons] = useState({ recording: true, mediaStreams: true, amd: true, conversationRelay: false });
  const [showPanel, setShowPanel] = useState("results");
  const [paramsExpanded, setParamsExpanded] = useState(false);
  const [direction, setDirection] = useState("outbound");
  const [shortCallRate, setShortCallRate] = useState(10);
  const [inNumType, setInNumType] = useState("local");
  const [inMonthly, setInMonthly] = useState(3000);
  const [inAvgDuration, setInAvgDuration] = useState(2);

  const applyPreset = (key) => {
    setPreset(key);
    const p = PRESETS[key];
    if (p.values) {
      setMonthlyOutbound(p.values.monthlyOutbound);
      setAvgDuration(p.values.avgDuration);
      setAnswerRate(p.values.answerRate);
      setNumberPoolSize(p.values.numberPoolSize);
    }
  };
  const editAndCustomize = (setter) => (v) => { setter(v); setPreset("custom"); };

  const paramsSummary = useMemo(() => {
    if (direction === "outbound") {
      const presetLabel = PRESETS[preset]?.label || "自定义";
      const destLabel = destType === "mobile" ? "手机" : "固话";
      return {
        title: `外呼 · ${presetLabel}`,
        detail: `每月${monthlyOutbound.toLocaleString()}通 · ${avgDuration}min时长 · ${answerRate}%接通 · ${destLabel}`
      };
    } else {
      const numLabel = inNumType === "local" ? "Local" : "Toll-free";
      return {
        title: "回拨场景",
        detail: `每月${inMonthly.toLocaleString()}通 · ${inAvgDuration}min时长 · ${numLabel}`
      };
    }
  }, [direction, preset, monthlyOutbound, avgDuration, answerRate, destType, inMonthly, inAvgDuration, inNumType]);

  const outResults = useMemo(() =>
    calculateOutbound({ monthlyOutbound, avgDuration, answerRate, destType, numberPoolSize, jpNumberType, addons, shortCallRate }),
    [monthlyOutbound, avgDuration, answerRate, destType, numberPoolSize, jpNumberType, addons, shortCallRate]
  );

  const inResults = useMemo(() =>
    calculateInbound({ inMonthly, inAvgDuration, inNumType, numberPoolSize, jpNumberType, addons }),
    [inMonthly, inAvgDuration, inNumType, numberPoolSize, jpNumberType, addons]
  );

  const activeResults = direction === "outbound" ? outResults : inResults;
  const totals = Object.entries(activeResults).map(([k, v]) => ({ key: k, total: v.perCallTotal }));
  const maxKey = totals.reduce((a, b) => (a.total > b.total ? a : b)).key;
  const minKey = totals.reduce((a, b) => (a.total < b.total ? a : b)).key;
  const maxPerMin = Math.max(...Object.values(activeResults).map((r) => r.perMinuteTotal));

  /* -- Controls Panel -- */
  const controlsPanel = (
    <div className={isMobile ? "space-y-6" : "grid grid-cols-4 gap-6 items-start"}>
      {direction === "outbound" && (
        <div>
          <div className="text-[11px] text-indigo-600 uppercase tracking-widest mb-3 font-semibold">场景预设</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PRESETS).map(([key, p]) => (
              <Chip key={key} label={p.label} desc={p.desc} icon={p.icon} active={preset === key} onClick={() => applyPreset(key)} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-[11px] text-indigo-600 uppercase tracking-widest mb-3 font-semibold">
          {direction === "outbound" ? "外呼参数" : "回拨参数"}
        </div>
        {direction === "outbound" ? (
          <div className="space-y-3">
            <NumInput label="月外呼总量" value={monthlyOutbound} onChange={editAndCustomize(setMonthlyOutbound)} unit="通" min={100} max={500000} step={1000} />
            <NumInput label="平均通话时长" value={avgDuration} onChange={editAndCustomize(setAvgDuration)} unit="min" min={0.1} max={30} step={0.5} hint="计费向上取整到整分钟" />
            <NumInput label="接通率" value={answerRate} onChange={editAndCustomize(setAnswerRate)} unit="%" min={1} max={99} step={1} hint="招聘外呼一般 30%-50%" />
            <NumInput label="短呼占比（≤6s）" value={shortCallRate} onChange={editAndCustomize(setShortCallRate)} unit="%" min={0} max={100} step={1} hint="≥20% 会触发美国 Surcharge" />
          </div>
        ) : (
          <div className="space-y-3">
            <NumInput label="月回拨来电量" value={inMonthly} onChange={setInMonthly} unit="通" min={100} max={200000} step={500} hint="预估候选人回拨量" />
            <NumInput label="平均通话时长" value={inAvgDuration} onChange={setInAvgDuration} unit="min" min={0.5} max={30} step={0.5} hint="计费向上取整到整分钟" />
          </div>
        )}
      </div>

      <div>
        <div className="text-[11px] text-indigo-600 uppercase tracking-widest mb-3 font-semibold">号码池</div>
        <div className="space-y-3">
          <NumInput label="号码数量" value={numberPoolSize} onChange={editAndCustomize(setNumberPoolSize)} unit="个" min={1} max={200} step={1}
            hint={`日容量约 ${(numberPoolSize * 50).toLocaleString()} 通`} />
          {direction === "outbound" && (
            <div>
              <div className="text-xs text-slate-600 mb-2 font-medium">被叫号码类型</div>
              <div className="flex gap-2">
                <button onClick={() => setDestType("mobile")} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${destType === "mobile" ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>📱 手机</button>
                <button onClick={() => setDestType("landline")} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${destType === "landline" ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>☎️ 固话</button>
              </div>
            </div>
          )}
          {direction === "inbound" && (
            <div>
              <div className="text-xs text-slate-600 mb-2 font-medium">接听号码类型</div>
              <div className="flex gap-2">
                <button onClick={() => setInNumType("local")} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${inNumType === "local" ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>Local</button>
                <button onClick={() => setInNumType("tollfree")} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${inNumType === "tollfree" ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>Toll-free</button>
              </div>
            </div>
          )}
          {(direction === "outbound" || (direction === "inbound" && inNumType === "local")) && (
            <div>
              <div className="text-xs text-slate-600 mb-2 font-medium">日本号码类型</div>
              <div className="flex gap-2">
                <button onClick={() => setJpNumberType("national")} className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${jpNumberType === "national" ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>National $4.5/月</button>
                <button onClick={() => setJpNumberType("local0ABJ")} className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${jpNumberType === "local0ABJ" ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>0ABJ $20/月</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="text-[11px] text-indigo-600 uppercase tracking-widest mb-3 font-semibold">附加服务</div>
        <div className="space-y-3">
          {Object.entries(ADDONS).map(([k, ad]) => (
            <label key={k} className="flex items-center gap-2.5 cursor-pointer"
              onClick={(e) => { e.preventDefault(); setAddons((p) => ({ ...p, [k]: !p[k] })); }}>
              <div className={`w-11 h-6 rounded-full shrink-0 relative transition-colors ${addons[k] ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 left-0.5 transition-transform shadow-sm ${addons[k] ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <span className="text-slate-700">{ad.label}</span>
                <span className="text-slate-400 ml-1">({fmtUSD(ad.price)}/{ad.unit === "min" ? "min" : "通"})</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  /* -- Results Panel -- */
  const resultsPanel = (
    <>
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-3 gap-4'} mb-4`}>
        {Object.entries(MARKETS).map(([key, market]) =>
          direction === "outbound" ? (
            <OutboundCard key={key} market={market} result={outResults[key]}
              destType={destType} jpNumberType={jpNumberType} marketKey={key}
              tag={key === minKey ? "最低" : key === maxKey ? "最高" : null} />
          ) : (
            <InboundCard key={key} market={market} result={inResults[key]}
              inNumType={inNumType} marketKey={key}
              tag={key === minKey ? "最低" : key === maxKey ? "最高" : null} />
          )
        )}
      </div>

      <div className="bg-white rounded-xl border-[1.5px] border-slate-200 overflow-hidden shadow-md">
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500" />
        <div className="p-4">
          <div className="text-[11px] text-indigo-600 uppercase tracking-widest mb-3 font-semibold">
            {direction === "outbound" ? "每分钟外呼成本对比" : "每分钟接听成本对比"}
          </div>
          {Object.entries(activeResults).map(([key, r]) => (
            <div key={key} className="mb-3 last:mb-0">
              <div className="flex justify-between mb-1 text-[13px]">
                <span className="text-slate-600">{MARKETS[key].flag} {MARKETS[key].name}</span>
                <span className="text-slate-900 font-semibold tabular-nums">{fmtUSD(r.perMinuteTotal)}/min</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${key === 'us' ? 'bg-emerald-500' : key === 'uk' ? 'bg-indigo-500' : 'bg-amber-500'}`}
                  style={{ width: (maxPerMin > 0 ? (r.perMinuteTotal / maxPerMin) * 100 : 0) + "%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Twilio 通话费用模拟器</h1>
        <p className="text-xs text-slate-500 mt-1">美国 / 英国 / 日本 · Outbound & Inbound 成本对比</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-4">
        <div className="inline-flex bg-slate-200/70 rounded-2xl p-1.5 gap-1">
          {[
            { key: "outbound", label: "Outbound 外呼", sub: "主动拨打候选人", icon: "📤" },
            { key: "inbound", label: "Inbound 回拨", sub: "候选人回拨接听", icon: "📥" },
          ].map((d) => (
            <button
              key={d.key}
              onClick={() => setDirection(d.key)}
              className={`py-3 px-6 rounded-xl transition-all cursor-pointer min-w-[180px] ${
                direction === d.key
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-base">{d.icon}</span>
                <span className="text-[13px] font-semibold">{d.label}</span>
              </div>
              <div className={`text-[11px] text-center mt-1 ${direction === d.key ? 'text-slate-500' : 'text-slate-400'}`}>{d.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {!isMobile && (
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <div
            onClick={() => setParamsExpanded(!paramsExpanded)}
            className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer hover:border-indigo-200 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3 text-sm">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">⚙️</span>
              <span className="font-semibold text-slate-900">{paramsSummary.title}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">{paramsSummary.detail}</span>
            </div>
            <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
              {paramsExpanded ? "收起" : "调整"}
              <svg className={`w-4 h-4 transition-transform ${paramsExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {paramsExpanded && (
            <div className="mt-3 bg-slate-100/70 rounded-2xl p-5 border border-slate-200">
              {controlsPanel}
            </div>
          )}
        </div>
      )}

      {isMobile && (
        <>
          <div className="mx-6 mb-3 bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
            <div className="text-xs text-indigo-600 font-medium">{paramsSummary.title}</div>
            <div className="text-sm text-slate-700 mt-0.5">{paramsSummary.detail}</div>
          </div>
          <div className="flex px-6 mb-3 border-b border-slate-200">
            {[{ key: "results", label: "📊 结果" }, { key: "controls", label: "⚙️ 参数" }].map((tab) => (
              <button key={tab.key} onClick={() => setShowPanel(tab.key)} className={`flex-1 py-2.5 text-sm font-semibold cursor-pointer ${showPanel === tab.key ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-400'}`}>{tab.label}</button>
            ))}
          </div>
        </>
      )}

      <div className="max-w-6xl mx-auto px-6 pb-10">
        {isMobile ? (
          showPanel === "controls" ? (
            <div className="bg-slate-100/70 rounded-2xl p-4">
              {controlsPanel}
            </div>
          ) : resultsPanel
        ) : (
          resultsPanel
        )}
      </div>
    </div>
  );
}

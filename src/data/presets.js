export const PRESETS = {
  pilot: { label: "试运营", desc: "小规模验证", icon: "🧪", values: { monthlyOutbound: 2000, avgDuration: 2, answerRate: 35, numberPoolSize: 5 } },
  growth: { label: "增长期", desc: "日均千通级", icon: "📈", values: { monthlyOutbound: 25000, avgDuration: 2, answerRate: 40, numberPoolSize: 25 } },
  scale: { label: "规模化", desc: "10万+月呼出", icon: "🚀", values: { monthlyOutbound: 100000, avgDuration: 2, answerRate: 45, numberPoolSize: 80 } },
  custom: { label: "自定义", desc: "手动设置", icon: "✏️", values: null },
};

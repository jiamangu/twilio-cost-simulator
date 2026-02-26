# Twilio 通话费用模拟器

美国 / 英国 / 日本三市场 Twilio Voice 外呼与回拨成本对比计算器。

## 在线体验

直接打开 `twilio-cost-simulator.html` 即可使用，无需安装任何依赖。

## 功能特性

### 📤 Outbound 外呼场景
- 支持美国、英国、日本三个目标市场
- 可选被叫号码类型（手机/固话）
- 场景预设：试运营、增长期、规模化
- 自动计算美国 Surcharge（未接通率≥20%、短呼占比≥20%、均时长<30s）

### 📥 Inbound 回拨场景
- 支持 Local 和 Toll-free 两种接听号码
- 自动计算号码月租分摊

### 💰 成本项覆盖
- Twilio 通话费（按被叫号码类型区分）
- 号码池月租（支持日本 National/0ABJ 两种类型）
- 可选附加服务：
  - 通话录音 $0.0025/min
  - Media Streams $0.004/min
  - 留言检测 AMD $0.0075/次
  - ConversationRelay $0.07/min

## 费率参考

| 市场 | 拨打固话 | 拨打手机 | 号码月租（最低） |
|------|---------|---------|----------------|
| 🇺🇸 美国 | $0.014/min | $0.014/min | $1.15/月 |
| 🇬🇧 英国 | $0.0158/min | $0.0305/min | $1.15/月 |
| 🇯🇵 日本 | $0.0746/min | $0.185/min | $4.50/月 |

## 技术栈

- React 18
- Tailwind CSS
- 纯前端，无需后端服务

## 本地开发

```bash
# 直接用浏览器打开
open twilio-cost-simulator.html

# 或启动本地服务器
npx serve .
```

## Notifications

Push events on this repo trigger Slack notifications via GitHub Actions.

## License

MIT

# Slack 集成配置指南

这个项目通过 GitHub Actions 自动发送通知到 Slack。

## 功能特性

现在支持以下事件的 Slack 通知：

| 事件类型 | 触发条件 | 消息样式 |
|---------|---------|---------|
| Push | 任何分支推送 | 📝 显示提交信息和作者 |
| Pull Request | 打开/关闭/合并 | 🔀/🔒/✅ 显示 PR 标题和操作 |
| Issues | 打开/关闭 | 🐛/✅ 显示 Issue 标题 |
| Issue 评论 | 新评论 | 💬 显示评论内容 |
| Star | 仓库被星标 | ⭐ 显示谁星标了 |
| 手动触发 | workflow_dispatch | 🤖 自定义消息 |

## 配置步骤

### 1. 创建 Slack Incoming Webhook

1. 访问 [Slack App 目录](https://api.slack.com/apps)
2. 点击 **"Create New App"**
3. 选择 **"From scratch"**
4. 输入 App 名称（如 "GitHub Notifications"）并选择你的 Workspace
5. 在左侧菜单选择 **"Incoming Webhooks"**
6. 开启 **"Activate Incoming Webhooks"**
7. 点击 **"Add New Webhook to Workspace"**
8. 选择要接收通知的频道
9. 复制生成的 **Webhook URL**（格式：`https://hooks.slack.com/services/T000/B000/XXXX`）

### 2. 配置 GitHub Secret

在你的 GitHub 仓库中添加 Webhook URL：

1. 打开仓库页面，进入 **Settings** > **Secrets and variables** > **Actions**
2. 点击 **"New repository secret"**
3. Name: `SLACK_WEBHOOK_URL`
4. Secret: 粘贴你的 Webhook URL
5. 点击 **"Add secret"**

### 3. 测试配置

手动触发 workflow 来测试：

1. 进入仓库的 **Actions** 标签
2. 选择 **"Slack Notify"** workflow
3. 点击 **"Run workflow"**
4. 输入测试消息
5. 如果配置正确，你会在 Slack 频道收到通知

## 消息格式示例

```
📝 Push to `main`
> Fix: 修正了 Twilio 费率计算
• Author: jacintagu • Commit: `a1b2c3d`

[View Repository]
```

```
🔀 PR #42 opened
> 添加英国市场的支持
• Author: jacintagu

[View Repository]
```

```
⭐ user123 starred your repository!

[View Repository]
```

## 自定义

### 修改通知事件

编辑 `.github/workflows/slack-notify.yml` 中的 `on` 部分来添加或移除触发事件。

### 修改消息格式

在 `Build message` 步骤中修改 `TEXT` 变量来自定义消息格式。

### 添加更多按钮

在 `Send to Slack` 步骤中的 `elements` 数组中添加更多按钮。

# CyberVerse AI — 项目上下文

## 项目简介

CyberVerse AI 是一个 AI 网络安全学习平台，采用赛博朋克风格 UI，集成 Coze LLM 提供 AI 安全助手对话能力。

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **AI**: coze-coding-dev-sdk (LLM 流式对话)

## 目录结构

```
├── public/                     # 静态资源
├── scripts/                    # 构建与启动脚本
│   ├── build.sh
│   ├── dev.sh
│   ├── prepare.sh
│   └── start.sh
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 根布局 (dark mode, metadata)
│   │   ├── page.tsx            # 首页 (Hero + 入口卡片)
│   │   ├── globals.css         # 全局样式 + 赛博朋克动画
│   │   ├── chat/
│   │   │   └── page.tsx        # AI 安全助手聊天页
│   │   ├── learn/
│   │   │   └── page.tsx        # 学习中心页
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts    # AI 聊天流式接口 (SSE)
│   ├── components/
│   │   ├── Shell/
│   │   │   └── layout.tsx      # 全局赛博朋克侧边栏布局
│   │   └── ui/                 # shadcn/ui 组件库
│   ├── hooks/
│   ├── lib/
│   │   └── utils.ts
│   └── server.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 设计规范

- **配色**: 黑色 (#000) + cyan (#00f0ff) 科技风
- **风格**: 赛博朋克 / 黑客控制台
- **动画**: 矩阵雨、扫描线、故障闪烁、脉冲发光、打字机
- **布局**: 桌面端固定侧边栏 + 移动端顶部汉堡菜单
- **字体**: font-mono 用于终端/标识, font-sans 用于正文

## 包管理规范

**仅允许使用 pnpm**，严禁 npm 或 yarn。

## 开发规范

- TypeScript strict 模式，禁止隐式 any
- 函数参数、返回值必须标注类型
- 使用 'use client' + useEffect + useState 处理客户端动态内容，防止 Hydration 错误
- 严禁在 JSX 中直接使用 typeof window、Date.now()、Math.random()
- 禁止使用 head 标签，使用 metadata API
- 三方 CSS/字体通过 globals.css @import 或 next/font 引入

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/chat | POST | AI 安全助手聊天 (SSE 流式返回) |

## 核心组件

| 组件 | 路径 | 说明 |
|------|------|------|
| ShellLayout | src/components/Shell/layout.tsx | 全局赛博朋克布局 (侧边栏 + 移动端菜单) |

# BioCopilot 🧬

BioCopilot 是一个智能生物信息学研究助手平台，提供 **Context-Aware IDE**、**Pipeline 管理** 和 **AI 驱动的代码建议**。

![BioCopilot Banner](https://img.shields.io/badge/BioCopilot-v0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 核心特性

### 🎯 智能 IDE
- **Monaco Editor 集成** - VS Code 级别的编辑体验
- **多文件标签管理** - 轻松切换多个文件
- **语法高亮** - 支持 Python、R、Shell 等
- **实时代码执行** - 即时查看运行结果

### 📊 Pipeline 管理
- **可视化工作流** - 清晰展示分析步骤
- **状态追踪** - 实时监控每个步骤的执行状态
- **数据流监控** - 自动追踪数据形状变化
- **错误处理** - 快速定位和修复问题

### 🤖 AI Copilot
- **上下文感知** - 根据当前工作流阶段提供建议
- **智能代码生成** - AI 辅助编写生物信息学代码
- **质量控制建议** - 自动检测数据质量问题
- **一键插入代码** - 快速应用 AI 建议

### 🎨 现代化 UI
- **深色模式支持**
- **响应式设计**
- **流畅动画**
- **直观的三栏布局**

## 🚀 快速开始

### 前置要求

- Node.js 18+ 
- npm / yarn / pnpm

### 安装依赖

```bash
cd /Users/yuxiaowen/Desktop/web-projects.nosync/CMU/SEM/BioCopilot
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 启动 IDE

点击首页的 **"启动 IDE"** 按钮，进入 BioCopilot IDE 界面。

## 📁 项目结构

```
BioCopilot/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # 首页
│   ├── ide/                     # IDE 页面
│   │   └── page.tsx
│   ├── api/                     # API 路由
│   │   ├── execute/             # 代码执行
│   │   └── copilot/             # AI Copilot
│   ├── layout.tsx               # 根布局
│   └── globals.css              # 全局样式
│
├── components/                   # React 组件
│   ├── ui/                      # 基础 UI 组件
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Tooltip.tsx
│   │   └── Spinner.tsx
│   └── ide/                     # IDE 组件
│       ├── IDELayout.tsx        # 主布局
│       ├── TopBar.tsx           # 顶部工具栏
│       ├── LeftSidebar/         # 左侧边栏
│       │   └── PipelineSteps.tsx
│       ├── Editor/              # 编辑器区域
│       │   ├── CodeEditor.tsx   # Monaco Editor
│       │   └── TabBar.tsx       # 文件标签栏
│       └── RightSidebar/        # 右侧边栏
│           ├── CopilotPanel.tsx
│           ├── WorkflowStatus.tsx
│           └── NextSteps.tsx
│
├── store/                        # Zustand 状态管理
│   ├── editorStore.ts           # 编辑器状态
│   ├── pipelineStore.ts         # Pipeline 状态
│   ├── copilotStore.ts          # Copilot 状态
│   └── projectStore.ts          # 项目状态
│
├── types/                        # TypeScript 类型
│   ├── editor.ts
│   ├── pipeline.ts
│   ├── copilot.ts
│   └── project.ts
│
├── lib/                          # 工具函数
│   ├── utils.ts                 # 通用工具
│   └── api-client.ts            # API 客户端
│
└── public/                       # 静态资源
```

## 🛠️ 技术栈

### 前端
- **[Next.js 14](https://nextjs.org/)** - React 框架
- **[TypeScript](https://www.typescriptlang.org/)** - 类型安全
- **[Tailwind CSS](https://tailwindcss.com/)** - 样式框架
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - 代码编辑器
- **[Zustand](https://zustand-demo.pmnd.rs/)** - 状态管理
- **[Lucide React](https://lucide.dev/)** - 图标库
- **[Framer Motion](https://www.framer.com/motion/)** - 动画库

### 后端/API
- **Next.js API Routes** - 服务端 API
- **Socket.io** - WebSocket 通信（待集成）

### 开发工具
- **ESLint** - 代码检查
- **Prettier** - 代码格式化

## 🎮 使用指南

### 1. 查看 Pipeline 步骤

左侧边栏展示当前项目的所有 Pipeline 步骤：
- ✅ **已完成** - 绿色对勾
- 🔄 **运行中** - 蓝色旋转图标
- ⏸️ **等待中** - 灰色圆圈
- ❌ **错误** - 红色叉号

### 2. 编辑代码

点击 Pipeline 步骤可在中间区域打开对应的代码文件：
- 支持多文件标签
- 语法高亮
- 自动保存（标签显示 • 表示未保存）

### 3. 运行代码

点击顶部工具栏的 **"运行"** 按钮执行当前代码：
- 实时查看输出
- 自动更新数据形状
- 错误提示

### 4. 使用 AI Copilot

右侧 Copilot 面板提供智能建议：
- **Workflow Status** - 查看当前工作流状态
- **Next Steps** - AI 推荐的下一步操作
- **Insert Code** - 一键插入建议的代码
- **Explain** - 解释代码功能

## 🔧 配置

### 环境变量

创建 `.env.local` 文件：

```bash
# API 配置
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# AI 服务（可选）
OPENAI_API_KEY=your_openai_key
```

## 📈 开发路线图

### Phase 1: MVP ✅
- [x] 基础 IDE 布局
- [x] Monaco Editor 集成
- [x] Pipeline 步骤展示
- [x] 基础状态管理
- [x] UI 组件库

### Phase 2: 核心功能（进行中）
- [ ] 真实代码执行引擎（Python/Jupyter）
- [ ] WebSocket 实时通信
- [ ] 文件系统集成
- [ ] Git 版本控制

### Phase 3: AI 集成
- [ ] OpenAI/Claude API 集成
- [ ] 上下文感知建议引擎
- [ ] 代码自动补全
- [ ] 智能错误修复

### Phase 4: 高级功能
- [ ] 数据可视化面板
- [ ] 协作编辑
- [ ] 插件系统
- [ ] 性能优化

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Next.js](https://nextjs.org/) - 强大的 React 框架
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code 编辑器内核
- [Tailwind CSS](https://tailwindcss.com/) - 优秀的 CSS 框架

---

**Built with ❤️ for the Bioinformatics Community**


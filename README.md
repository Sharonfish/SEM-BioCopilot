# BioCopilot 🧬

BioCopilot is an intelligent bioinformatics research assistant platform with **Context-Aware IDE**, **Pipeline Management**, and **AI-Powered Code Assistance**.

> **New Feature! 🎉** AI-powered code explanation - Select any code and get instant intelligent explanations!

![BioCopilot Banner](https://img.shields.io/badge/BioCopilot-v0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Core Features

### 🎯 Intelligent IDE
- **Monaco Editor Integration** - VS Code-level editing experience
- **Multi-file Tab Management** - Easily switch between multiple files
- **Syntax Highlighting** - Support for Python, R, Shell, etc.
- **Real-time Code Execution** - See results instantly
- **🆕 AI Code Explanation** - Select code to get intelligent explanations

### 📊 Pipeline Management
- **Visual Workflow** - Clear display of analysis steps
- **Status Tracking** - Real-time monitoring of each step's execution status
- **Data Flow Monitoring** - Automatic tracking of data shape changes
- **Error Handling** - Quick location and fixing of issues

### 🤖 AI Copilot
- **Context-Aware** - Provide suggestions based on current workflow stage
- **Intelligent Code Generation** - AI-assisted bioinformatics code writing
- **Quality Control Suggestions** - Automatic detection of data quality issues
- **One-Click Code Insertion** - Quick application of AI suggestions

### 🎨 Modern UI
- **Dark Mode Support**
- **Responsive Design**
- **Smooth Animations**
- **Intuitive Three-Column Layout**

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm / yarn / pnpm

### Install Dependencies

```bash
cd /Users/yuxiaowen/Desktop/web-projects.nosync/CMU/SEM/BioCopilot
npm install
```

### Start Development Server

```bash
npm run dev
```

Open your browser and visit [http://localhost:3000](http://localhost:3000)

### Launch IDE

Click the **"Launch IDE"** button on the homepage to enter the BioCopilot IDE interface.

### 🆕 Try Code Explanation

1. Open any file in the IDE
2. Select a code snippet with your mouse
3. Click the floating "Explain" button
4. Get AI-powered explanation instantly!

**Optional**: Add your OpenAI API key in `.env.local` for full AI features:
```bash
OPENAI_API_KEY=sk-your-api-key-here
```

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


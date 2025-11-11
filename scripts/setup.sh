#!/bin/bash

echo "🧬 BioCopilot 项目安装脚本"
echo "=============================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 安装依赖
echo "📦 正在安装依赖..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 依赖安装成功！"
    echo ""
    echo "🚀 快速开始："
    echo "   npm run dev      - 启动开发服务器"
    echo "   npm run build    - 构建生产版本"
    echo "   npm run start    - 启动生产服务器"
    echo ""
    echo "📖 访问 http://localhost:3000 查看应用"
    echo ""
else
    echo ""
    echo "❌ 依赖安装失败，请检查错误信息"
    exit 1
fi


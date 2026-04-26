#!/bin/bash

# Milestone Master 部署脚本
# 使用 GitHub Pages 免费部署

echo "🚀 开始部署 Milestone Master..."

# 1. 构建项目
echo "📦 构建生产版本..."
npm run build

# 2. 进入构建目录
cd dist

# 3. 初始化 git
git init
git config user.email "boris_lee82@126.com"
git config user.name "敬天爱人AI工作室"
git add .
git commit -m "Deploy Milestone Master V1.0.008"

# 4. 部署到 GitHub Pages
echo "🌐 部署到 GitHub Pages..."
echo "请手动执行以下命令:"
echo "git remote add origin https://github.com/YOUR_USERNAME/milestone-master.git"
echo "git push -f origin master:gh-pages"

echo "✅ 构建完成！"
echo "📁 构建文件位于 dist 目录"

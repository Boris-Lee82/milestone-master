# Milestone Master 部署文档

## 📦 部署方式

Milestone Master 是一个纯前端单机应用，支持多种部署方式。

---

## 🚀 方式一：本地开发部署

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 部署步骤

```bash
# 1. 克隆项目
git clone <repository-url>

# 2. 进入项目目录
cd "Milestone Master"

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可使用。

---

## 🌐 方式二：静态文件部署

### 构建生产版本

```bash
# 1. 安装依赖
npm install

# 2. 构建生产版本
npm run build
```

构建完成后，会在项目根目录生成 `dist` 文件夹，包含所有静态文件。

### 部署到 Web 服务器

#### 1. Nginx 部署

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/milestone-master/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### 2. Apache 部署

将 `dist` 文件夹内容上传到 Apache 的网站根目录，并添加 `.htaccess` 文件：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### 3. IIS 部署

将 `dist` 文件夹内容上传到 IIS 网站根目录，并添加 `web.config` 文件：

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

---

## ☁️ 方式三：云平台部署

### 1. Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

或直接在 Vercel 网站导入 Git 仓库。

### 2. Netlify 部署

1. 登录 Netlify
2. 点击 "New site from Git"
3. 选择 Git 仓库
4. 构建命令: `npm run build`
5. 发布目录: `dist`
6. 点击 "Deploy site"

### 3. GitHub Pages 部署

```bash
# 1. 安装 gh-pages
npm install --save-dev gh-pages

# 2. 在 package.json 中添加部署脚本
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}

# 3. 部署
npm run deploy
```

### 4. 阿里云 OSS 部署

1. 构建生产版本: `npm run build`
2. 登录阿里云 OSS 控制台
3. 创建 Bucket
4. 上传 `dist` 文件夹内容
5. 配置静态网站托管

---

## 🐳 方式四：Docker 部署

### 创建 Dockerfile

```dockerfile
# 构建阶段
FROM node:16-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 创建 nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

### 构建和运行

```bash
# 构建镜像
docker build -t milestone-master .

# 运行容器
docker run -d -p 80:80 --name milestone-master milestone-master

# 访问
http://localhost
```

---

## 📱 方式五：Electron 桌面应用

### 安装 Electron

```bash
npm install --save-dev electron electron-builder
```

### 创建 main.js

```javascript
const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  
  win.loadFile('dist/index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

### 构建桌面应用

```bash
# 构建 Vue 应用
npm run build

# 构建 Electron 应用
npm run electron:build
```

---

## 🔧 环境配置

### 环境变量

创建 `.env` 文件（可选）：

```env
# 应用标题
VITE_APP_TITLE=Milestone Master

# API 基础路径（如果需要）
VITE_API_BASE_URL=/
```

### 构建优化

在 `vite.config.js` 中配置：

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    // 生产构建优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 分包策略
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router', 'pinia']
        }
      }
    }
  }
})
```

---

## 📊 性能优化建议

### 1. 启用 Gzip 压缩

在 Web 服务器配置中启用 Gzip 压缩，可减少 60-80% 的文件大小。

### 2. 使用 CDN

将静态资源部署到 CDN，提高访问速度。

### 3. 启用浏览器缓存

配置适当的缓存策略，减少重复请求。

### 4. 使用 HTTP/2

启用 HTTP/2 协议，提高资源加载效率。

---

## 🔒 安全建议

### 1. 使用 HTTPS

生产环境建议使用 HTTPS 协议。

### 2. 配置 CSP

添加内容安全策略（CSP）头：

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

### 3. 防止 XSS

确保用户输入经过适当的转义和验证。

---

## 📝 部署检查清单

- [ ] 安装所有依赖
- [ ] 构建生产版本
- [ ] 测试构建结果
- [ ] 配置 Web 服务器
- [ ] 启用 Gzip 压缩
- [ ] 配置 HTTPS（推荐）
- [ ] 设置适当的缓存策略
- [ ] 测试所有功能
- [ ] 监控应用性能

---

## 🆘 常见问题

### Q: 部署后页面空白？

A: 检查以下几点：
1. 确保所有静态文件都已正确部署
2. 检查 Web 服务器的路由配置
3. 查看浏览器控制台错误信息

### Q: 数据丢失了怎么办？

A: Milestone Master 使用浏览器 IndexedDB 存储数据：
- 清除浏览器数据会导致数据丢失
- 建议定期使用"数据管理"功能导出备份
- 部署到不同域名时，数据不会共享

### Q: 如何迁移数据？

A: 
1. 在原系统导出数据（JSON 格式）
2. 在新系统导入数据
3. 所有数据将完整迁移

---

## 📞 技术支持

如有部署问题，请联系：

- **邮箱**: boris_lee82@126.com
- **作者**: 敬天爱人AI工作室

---

**祝您部署顺利！** 🎉

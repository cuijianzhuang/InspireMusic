# InspireMusic

[在线体验](https://ins-music.netlify.app/) | [下载 Windows 桌面端](https://github.com/WHStudio/InspireMusic/releases/download/v1.3.3/InspireMusic_1.3.3_x64-setup.exe)

一个现代化的纯前端音乐 APP ，可以在 CloudFlare Pages / Netlify / Vercel 上轻松部署，同时提供 Windows 桌面端。

后端基于 [TuneHub API](https://api.tunefree.fun/) ，请多多支持后端项目原作者开发的 [TuneFreeNext](https://tunefree.fun/) ，更强大、更好用。

## ⚠️ 免责声明

 1. 本项目仅供个人学习研究使用，禁止用于商业及非法用途。使用本项目所产生的一切后果由使用者自行承担，开发者不承担任何责任。
 2. 本项目由目前最先进的多款 AI Agent 联合开发，99.9% 以上代码由 AI 生成。虽然经过多轮迭代和代码审查，且以 MIT 许可证完全开源，但无法为可靠性提供任何保证。
 3. 我们承诺，本项目：不存储版权资源、不提供下载功能、不以任何形式盈利。
 4. 在部分平台或服务器上部署此类项目，可能面临版权投诉，请遵守相关平台规则。

## 📌 注意事项

 1. **HTTPS 环境部署**：在 HTTPS 环境下部署需要配置反向代理以避免 Mixed Content 错误。详见下方「HTTPS 部署配置」章节。
 2. 我们暂未提供 Linux 或 Mac OS 的打包，但您可以使用 Tauri 自行打包和体验。
 3. 本项目没有在非 Chrome 内核的浏览器上进行测试，不保证完全正常的显示效果。
 4. 使用 Windows 桌面端需要 Webview2 支持，已知在 Windows 10（从版本 1803 开始）和更高版本的 Windows 上默认提供，如您使用其他 Windows 版本，请自行研究解决方案。

## ✨ 功能特性

- **🔍 聚合搜索** - 支持网XX音乐、酷X音乐、QX音乐聚合搜索
- **📋 歌单管理** - 创建、导入、管理自定义歌单
- **❤️ 收藏功能** - 轻松收藏和管理喜爱的歌曲
- **⏰ 定时播放** - 睡眠定时器，支持自定义时长
- **🎨 响应式设计** - 完美适配 PC 和移动端
- **📱 PWA 支持** - 可安装为桌面/移动应用，支持媒体会话通知
- **💾 智能缓存** - 本地缓存歌曲信息，减少重复请求

## 🛠️ 技术栈

### 核心框架

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 19.2.3 | 前端 UI 框架 |
| TypeScript | 5.9.3 | 类型安全的 JavaScript |
| Vite | 7.2.7 | 下一代前端构建工具 |

### 样式与动画

| 技术 | 版本 | 说明 |
|------|------|------|
| Tailwind CSS | 4.1.18 | 原子化 CSS 框架 |
| Framer Motion | 12.23.26 | React 动画库 |
| Lucide React | 0.561.0 | 精美图标库 |

### 工具链

| 技术 | 版本 | 说明 |
|------|------|------|
| ESLint | 9.39.1 | 代码规范检查 |
| PostCSS | 8.5.6 | CSS 处理器 |
| vite-plugin-pwa | 1.2.0 | PWA 支持插件 |

## 📱 PWA 功能

应用支持 PWA (Progressive Web App)，具有以下特性：

- **可安装** - 在浏览器地址栏点击安装按钮，添加到桌面/启动器
- **离线支持** - Service Worker 缓存静态资源
- **媒体会话** - 在系统通知中心显示当前播放歌曲，支持控制播放

## 🚀 开发环境

- Node.js v24.12.0
- pnpm 10.25.0

```bash
# 构建命令，产物位于 /dist
pnpm build
```

## 🐳 Docker 一键部署

### 快速开始

**Linux/Mac:**
```bash
./docker-start.sh
```

**Windows:**
```cmd
docker-start.bat
```

**手动部署:**
```bash
docker-compose up -d
```

访问地址: http://localhost:3000

详细部署说明请查看 [docker-deploy.md](./docker-deploy.md)

## 🔒 HTTPS 部署配置

在 HTTPS 环境下部署时，由于浏览器的 Mixed Content 安全策略，需要配置反向代理以确保所有资源通过 HTTPS 加载。

### 前置要求

1. 修改 `src/api.ts` 第 17 行：
```typescript
const BASE_URL = '/api';
```

2. 重新构建项目：
```bash
npm run build
```

### Nginx / OpenResty 配置

在您的 Nginx 或 1Panel OpenResty 配置中添加以下 location 块（需要在主应用代理配置**之前**）：

```nginx
# API 反向代理配置
location ^~ /api/ {
    proxy_pass https://music-dl.sayqz.com;
    proxy_ssl_server_name on;
    proxy_set_header Host music-dl.sayqz.com;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    
    # 将 HTTP 重定向转换为 HTTPS（解决 Mixed Content 问题）
    proxy_redirect http:// https://;
    
    # 优化大文件下载
    proxy_buffering off;
}

# 您的应用主体配置
location / {
    # ... 您现有的配置
}
```

### Caddy 配置

```caddy
yourdomain.com {
    handle /api/* {
        uri strip_prefix /api
        reverse_proxy https://music-dl.sayqz.com
    }
    
    handle {
        root * /path/to/dist
        file_server
        try_files {path} /index.html
    }
}
```

### 验证配置

1. 访问 `https://yourdomain.com/api/?source=netease&type=search&keyword=test`
2. 应该返回 JSON 格式的搜索结果
3. 浏览器 Console 不应出现 Mixed Content 错误
4. 下载功能正常，不会跳转到新页面

### 常见问题

**Q: 配置后还是跳转到浏览器播放？**
- 确认已修改 `src/api.ts` 并重新构建
- 清除浏览器缓存（Ctrl+Shift+Delete）
- 使用开发者工具 Network 标签检查请求 URL 是否为 `https://yourdomain.com/api/...`

**Q: 出现 502 错误？**
- 检查服务器是否能访问 `https://music-dl.sayqz.com`
- 检查 DNS 解析是否正常

更多配置细节和故障排查，请参考项目 Issues。

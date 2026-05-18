# HeartCloud Live

HeartCloud Live 是一个课堂互动词云项目。学生通过 iPad 或手机提交英文单词，大屏页面实时展示彩色爱心形词云，适合公开课、课堂互动和现场活动。

## 功能

- 学生端提交英文单词
- 大屏端实时展示爱心形词云
- WebSocket 实时同步提交内容
- 支持新建页面、切换页面、清空当前页面
- 词云会按词频自动调整大小

## 技术栈

- React
- Vite
- ECharts
- echarts-wordcloud
- Node.js
- Express
- WebSocket

## 本地开发

安装依赖：

```bash
npm install
```

启动前端和后端：

```bash
npm run dev
```

默认会启动：

- 前端页面：http://localhost:5173
- 后端服务：http://localhost:3001

访问页面：

- 学生端：http://localhost:5173/student
- 大屏端：http://localhost:5173/screen

## 测试提交

项目根目录下可以运行测试脚本，批量提交测试单词：

```bash
node test.js
```

运行后打开大屏页面查看词云效果：

```text
http://localhost:5173/screen
```

如果大屏上的数据需要重新开始，可以点击页面上的 `Clear`，或者重启后端服务。当前项目的数据存储在内存里，后端重启后数据会清空。

## 生产构建

打包前端静态文件：

```bash
npm run build
```

构建产物会生成在：

```text
dist/
```

生产环境需要同时部署两部分：

- `dist/`：由 Nginx 提供静态访问
- `server.js`：由 Node.js 运行，提供 API 和 WebSocket

## 启动后端

直接启动：

```bash
node server.js
```

推荐在服务器上用 PM2 守护进程：

```bash
npm install -g pm2
pm2 start server.js --name heartcloud-live
pm2 save
```

后端默认监听：

```text
http://127.0.0.1:3001
```

## Nginx 部署示例

假设前端 `dist/` 已经部署到 `/usr/share/nginx/html`，Nginx 可以配置为：

```nginx
server {
    listen       80;
    listen       [::]:80;
    server_name  _;
    root         /usr/share/nginx/html;
    index        index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /ws {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

更新配置后检查并重载：

```bash
nginx -t
systemctl reload nginx
```

## 常见问题

### 提交时报 405 Not Allowed

这是 Nginx 没有把 `/api/submit` 转发给 Node 后端导致的。确认 Nginx 配置里有：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3001;
}
```

同时确认后端正在运行：

```bash
pm2 status
```

或：

```bash
ps aux | grep server.js
```

### 大屏不实时刷新

通常是 `/ws` 没有正确代理 WebSocket。确认 Nginx 配置里有：

```nginx
location /ws {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Total Submissions 数量不对

当前数据存在后端内存里，测试脚本每运行一次都会继续追加数据。需要重新开始时，点击大屏页面的 `Clear`，或者重启后端服务。

## API

- `GET /api/active-page`：获取当前活跃页面
- `GET /api/pages`：获取所有页面
- `GET /api/submissions/:pageId`：获取指定页面的提交数据
- `POST /api/submit`：提交单词
- `POST /api/new-page`：新建页面
- `POST /api/switch-page`：切换页面
- `POST /api/clear`：清空当前页面提交

## 项目结构

```text
heartcloud-live/
├── package.json
├── package-lock.json
├── server.js
├── test.js
├── index.html
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── routes/
    │   ├── StudentPage.jsx
    │   └── ScreenPage.jsx
    ├── lib/
    │   ├── realtime.js
    │   └── wordUtils.js
    ├── components/
    │   └── HeartWordCloud.jsx
    └── styles/
        └── global.css
```

## 说明

后端数据目前存储在内存中，适合临时课堂或活动使用。服务重启后，页面和提交记录会重置。

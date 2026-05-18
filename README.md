# HeartCloud Live

课堂互动词云项目 - 公开课场景下，学生通过 iPad 输入英文单词，大屏实时显示彩色爱心形词云。

## 技术栈

- **前端**: React + Vite + ECharts + echarts-wordcloud
- **后端**: Node.js + Express + WebSocket
- **实时同步**: WebSocket

## 功能特点

- 学生输入页：只能输入英文，1-15个字符
- 大屏展示页：实时彩色爱心词云
- 多页面支持：新建页面、切换历史页面
- 实时同步：多设备数据实时更新

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务

```bash
npm run dev
```

这将同时启动：
- 前端开发服务器: http://localhost:5173
- 后端 API 服务器: http://localhost:3001

### 3. 访问页面

- **学生端**: http://localhost:5173/student
- **大屏端**: http://localhost:5173/screen

## 局域网使用

如果需要在局域网内使用（多台 iPad 连接大屏）：

1. 查看本机局域网 IP 地址
2. 修改 `vite.config.js` 中的 server.host 为 `'0.0.0.0'`
3. 其他设备通过 `http://你的IP:5173/student` 访问

## 项目结构

```
heartcloud-live/
├── package.json
├── server.js              # Node.js 后端服务
├── index.html
├── vite.config.js
├── .env.example
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── routes/
    │   ├── StudentPage.jsx
    │   └── ScreenPage.jsx
    ├── lib/
    │   ├── realtime.js     # WebSocket 客户端
    │   └── wordUtils.js    # 词频计算工具
    ├── components/
    │   └── HeartWordCloud.jsx
    └── styles/
        └── global.css
```

## API 接口

- `GET /api/active-page` - 获取当前活跃页面
- `GET /api/pages` - 获取所有页面
- `GET /api/submissions/:pageId` - 获取指定页面的提交数据
- `POST /api/submit` - 提交单词
- `POST /api/new-page` - 新建页面
- `POST /api/switch-page` - 切换页面

## WebSocket 消息

- `init` - 初始化数据
- `new_submission` - 新提交
- `page_changed` - 页面切换

## 注意事项

- 后端数据存储在内存中，重启服务后数据会丢失
- 适合公开课、课堂互动等临时性活动场景

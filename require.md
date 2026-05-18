请帮我开发一个课堂互动词云项目。

项目用于公开课场景：学生通过 iPad 打开学生页面输入英文单词，大屏展示页面实时显示彩色爱心形词云。

为了实现多个 iPad 与大屏页面之间的数据同步，使用 Node.js + Express + WebSocket 后端服务。

一、技术栈要求

前端：
- React + Vite
- ECharts
- echarts-wordcloud
- CSS 普通 CSS

后端：
- Node.js
- Express
- WebSocket (ws)

不要实现：
- 不要关键词提取
- 不要中文分词
- 不要敏感词过滤
- 不要管理端页面

只需要两个页面：
- 学生输入页 `/student`
- 大屏展示页 `/screen`

二、学生输入页 `/student`

功能要求：

1. 页面用途
学生通过 iPad 或手机打开该页面，输入英文单词并提交。

2. 输入框规则
输入内容必须满足：
- 只能输入英文大小写字母
- 不允许输入中文
- 不允许输入数字
- 不允许输入特殊符号
- 长度必须在 1 到 15 个字符之间


学生输入合法英文单词后，点击提交按钮。

提交后：

将该单词写入当前激活的大屏页面对应的数据集合中
如果大屏当前是 Page 1，就提交到 Page 1
如果大屏点击了“新建页面”，当前激活页面变成 Page 2，那么之后学生提交的词就进入 Page 2
学生端不需要手动选择页面，永远提交到当前 active page
页面交互
输入不合法时，提示：Only English letters, max 15 characters.
提交成功后，提示：Submitted successfully.
提交后清空输入框
提交按钮要大，适合 iPad 触屏
页面风格简洁、活泼，适合公开课现场

三、大屏展示页 /screen

功能要求：

页面用途
大屏展示学生提交的英文词云。
词云展示
使用 echarts-wordcloud 实现词云。

词云要求：

爱心形
彩色
多巴胺风格
高饱和度
颜色以红色、玫红、粉红、橙色、黄色为主
词频越高，字体越大
页面适合投影和公开课大屏展示

推荐颜色池：

const colorList = [
  "#ff2d55",
  "#ff3b30",
  "#ff4fd8",
  "#ff66b3",
  "#ff1493",
  "#ff6b00",
  "#ff9500",
  "#ffcc00",
  "#ff7a00",
  "#ff5e57"
];

词云配置建议：

{
  type: "wordCloud",
  shape: "cardioid",
  sizeRange: [20, 90],
  rotationRange: [-15, 15],
  rotationStep: 15,
  gridSize: 8,
  drawOutOfBound: false,
  layoutAnimation: true
}
大屏页面信息展示
大屏页面需要展示：
项目标题：HeartCloud Live
当前页面编号，例如：Page 1 / Page 2
当前页面提交总数
当前页面不同单词数量
实时词云
新建页面功能
大屏展示页需要有一个按钮：

按钮名称：

New Page

点击后：

创建一个新的词云页面
当前 active page 切换到新页面
大屏词云清空，开始展示新一轮提交
学生端之后提交的新词，全部进入这个新页面
旧页面的数据不能丢失，可以保留在数据服务中

例如：

第一次活动：
大屏 Page 1
50 个学生提交
Page 1 显示第一轮词云

老师点击 New Page

第二次活动：
大屏 Page 2
之后学生提交的数据进入 Page 2
大屏显示第二轮词云
页面切换功能
大屏页面可以显示历史页面按钮：
Page 1 | Page 2 | Page 3

点击后可以查看之前页面的词云。

但是只有最新创建的页面是 active page，学生端始终提交到 active page。

四、实时数据逻辑

需要实现实时同步：

大屏页面
订阅当前 active page 的提交数据
有新词提交时，自动更新词频
实时刷新词云
学生页面
读取当前 active page
提交时写入当前 active page
如果大屏点击 New Page，学生后续提交自动进入新页面
数据统计
前端根据当前页面的提交记录计算词频。

例如原始提交数据：

[
  { "word": "AI" },
  { "word": "Future" },
  { "word": "AI" },
  { "word": "Robot" }
]

转换为词云数据：

[
  { "name": "AI", "value": 2 },
  { "name": "Future", "value": 1 },
  { "name": "Robot", "value": 1 }
]

五、数据模型

后端使用内存存储，设计三个数据结构：

room
用于表示当前课堂活动。

字段：

id
active_page_id
created_at
pages
用于表示每一轮词云页面。

字段：

id
room_id
page_no
created_at
submissions
用于保存学生提交记录。

字段：

id
room_id
page_id
word
created_at

六、页面路由

项目只需要两个路由：

/student
/screen

不需要：

/admin
登录
权限系统
后端接口

七、项目结构

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
    │   ├── realtime.js
    │   └── wordUtils.js
    ├── components/
    │   └── HeartWordCloud.jsx
    └── styles/
        └── global.css

八、运行方式

npm install
npm run dev

同时启动：
- 前端开发服务器: http://localhost:5173
- 后端 API 服务器: http://localhost:3001

访问地址：

学生端：http://localhost:5173/student
大屏端：http://localhost:5173/screen

局域网使用：
- 修改 vite.config.js 添加 host: '0.0.0.0'
- 其他设备通过 http://你的IP:5173/student 访问

九、视觉风格要求

整体风格：

公开课
活泼
多巴胺
高饱和度
温暖
适合大屏展示

学生页：

输入框居中
按钮明显
字体大
适合 iPad 触控

大屏页：

全屏视觉
爱心词云居中
背景可以使用淡粉、淡橙、浅黄色渐变
顶部展示标题和统计信息
右上角或底部放置 New Page 按钮

十、特别说明

这是一个实时互动项目，使用 Node.js + Express + WebSocket 后端。
请优先保证以下功能跑通：

学生页面只能输入英文，15 字符以内
学生提交后，大屏页面实时更新词云
大屏词云是彩色爱心形
大屏点击 New Page 后，新一轮提交进入新的页面
旧页面数据保留，可以切换查看
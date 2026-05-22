import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { validateWord } from './src/lib/wordUtils.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// 内存存储
const rooms = new Map();
const pages = new Map();
const submissions = new Map();

// 初始化默认房间
const defaultRoom = {
  id: 'default',
  active_page_id: 'page_1',
  created_at: new Date().toISOString()
};
rooms.set('default', defaultRoom);

// 创建默认页面
const defaultPage = {
  id: 'page_1',
  room_id: 'default',
  page_no: 1,
  created_at: new Date().toISOString()
};
pages.set('page_1', defaultPage);

// API: 获取当前活跃页面
app.get('/api/active-page', (req, res) => {
  const room = rooms.get('default');
  res.json({ active_page_id: room.active_page_id });
});

// API: 获取所有页面
app.get('/api/pages', (req, res) => {
  const roomPages = Array.from(pages.values())
    .filter(p => p.room_id === 'default')
    .sort((a, b) => a.page_no - b.page_no);
  res.json(roomPages);
});

// API: 获取指定页面的提交数据
app.get('/api/submissions/:pageId', (req, res) => {
  const { pageId } = req.params;
  const pageSubmissions = Array.from(submissions.values())
    .filter(s => s.page_id === pageId);
  res.json(pageSubmissions);
});

// API: 提交单词
app.post('/api/submit', (req, res) => {
  const { word } = req.body;
  const submittedWord = typeof word === 'string' ? word.trim() : '';
  const validation = validateWord(submittedWord);

  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.message });
  }

  const room = rooms.get('default');
  const activePageId = room.active_page_id;

  const submission = {
    id: Date.now().toString(),
    room_id: 'default',
    page_id: activePageId,
    word: submittedWord,
    created_at: new Date().toISOString()
  };
  submissions.set(submission.id, submission);

  // 广播给所有客户端
  broadcast({
    type: 'new_submission',
    data: submission
  });

  res.json({ success: true, submission });
});

// API: 新建页面
app.post('/api/new-page', (req, res) => {
  const room = rooms.get('default');
  const existingPages = Array.from(pages.values())
    .filter(p => p.room_id === 'default');
  const newPageNo = existingPages.length + 1;
  const newPageId = `page_${newPageNo}`;

  const newPage = {
    id: newPageId,
    room_id: 'default',
    page_no: newPageNo,
    created_at: new Date().toISOString()
  };
  pages.set(newPageId, newPage);

  // 更新活跃页面
  room.active_page_id = newPageId;
  rooms.set('default', room);

  // 广播页面切换
  broadcast({
    type: 'page_changed',
    data: { active_page_id: newPageId, page: newPage }
  });

  res.json({ success: true, page: newPage });
});

// API: 切换页面
app.post('/api/switch-page', (req, res) => {
  const { page_id } = req.body;
  const room = rooms.get('default');
  room.active_page_id = page_id;
  rooms.set('default', room);

  broadcast({
    type: 'page_changed',
    data: { active_page_id: page_id }
  });

  res.json({ success: true });
});

// API: 清空当前页面
app.post('/api/clear', (req, res) => {
  const room = rooms.get('default');
  const activePageId = room.active_page_id;

  // 删除当前页面的所有提交
  for (const [id, submission] of submissions.entries()) {
    if (submission.page_id === activePageId) {
      submissions.delete(id);
    }
  }

  broadcast({
    type: 'page_cleared',
    data: { page_id: activePageId }
  });

  res.json({ success: true });
});

// WebSocket 广播
function broadcast(message) {
  const data = JSON.stringify(message);
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}

// WebSocket 连接处理
wss.on('connection', (ws) => {
  console.log('Client connected');

  // 发送当前状态
  const room = rooms.get('default');
  ws.send(JSON.stringify({
    type: 'init',
    data: {
      active_page_id: room.active_page_id,
      pages: Array.from(pages.values()).filter(p => p.room_id === 'default')
    }
  }));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

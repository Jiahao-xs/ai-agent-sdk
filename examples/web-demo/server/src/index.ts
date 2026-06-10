import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createChatAgent } from './agent';
import { createChatRouter } from './routes/chat';
import { createHealthRouter } from './routes/health';

// 加载 .env：从多个可能的位置查找
// tsx 运行时 __dirname 可用；也尝试 process.cwd() 兜底
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(__dirname, '../../.env'),
];
for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    // eslint-disable-next-line no-console
    console.log(`[Server] 已加载环境变量: ${envPath}`);
    break;
  }
}

// eslint-disable-next-line no-console
console.log(
  `[Server] OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '已设置' : '未设置'}`,
);
// eslint-disable-next-line no-console
console.log(`[Server] OPENAI_API_BASE: ${process.env.OPENAI_API_BASE || '未设置'}`);

const PORT = parseInt(process.env.PORT || '3001', 10);

async function main(): Promise<void> {
  const app = express();

  // 中间件
  app.use(cors({ origin: '*' }));
  app.use(express.json());

  // 创建 Agent（async，会同时连接 MCP 服务器）
  // eslint-disable-next-line no-console
  console.log('[Server] 正在初始化 Agent（含 MCP 连接）...');
  const agent = await createChatAgent();
  // eslint-disable-next-line no-console
  console.log('[Server] Agent 初始化完成');

  // 挂载路由
  app.use('/api', createHealthRouter());
  app.use('/api', createChatRouter(agent));

  // 启动服务
  const server = app.listen(PORT, '127.0.0.1', () => {
    // eslint-disable-next-line no-console
    console.log(`[Server] 后端服务已启动: http://localhost:${PORT}`);
    // eslint-disable-next-line no-console
    console.log(`[Server] 健康检查: http://localhost:${PORT}/api/health`);
  });

  // 优雅关闭：清理 MCP 连接
  const shutdown = async () => {
    // eslint-disable-next-line no-console
    console.log('[Server] 正在关闭...');
    server.close();
    await agent.close();
    // eslint-disable-next-line no-console
    console.log('[Server] 已关闭');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error('启动失败:', err);
  process.exit(1);
});

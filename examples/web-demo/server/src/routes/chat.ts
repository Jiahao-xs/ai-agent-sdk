import { Router } from 'express';
import type { Request, Response } from 'express';
import type { Agent } from 'ai-agent-sdk';
import type { ChatRequest } from '../../../shared/types';

/**
 * 创建聊天路由 — POST /api/chat (SSE 流式响应)
 */
export function createChatRouter(agent: Agent): Router {
  const router = Router();

  router.post('/chat', async (req: Request, res: Response) => {
    const { message } = req.body as ChatRequest;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({ error: '消息不能为空' });
      return;
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    /** 发送 SSE 事件 */
    const sendEvent = (type: string, data: unknown): void => {
      res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      // 使用 Agent 的 stream 方法获取流式输出
      const result = await agent.stream(message, (chunk: string) => {
        sendEvent('token', { content: chunk });
      });

      // 发送完成事件
      sendEvent('done', {
        output: result.output,
        duration: result.duration,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      sendEvent('error', { message: errorMessage });
    }

    res.end();
  });

  return router;
}

import { Router } from 'express';
import type { Request, Response } from 'express';

/**
 * 健康检查路由 — GET /api/health
 */
export function createHealthRouter(): Router {
  const router = Router();

  router.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

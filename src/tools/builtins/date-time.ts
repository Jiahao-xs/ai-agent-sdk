import { z } from 'zod';
import { defineTool } from '../index';

/** 内置日期时间工具 */
export const dateTimeTool = defineTool({
  name: 'date_time',
  description: '获取当前日期和时间信息',
  parameters: z.object({
    timezone: z.string().optional().describe('时区，默认为 Asia/Shanghai'),
  }),
  execute: ({ timezone }: { timezone?: string }) => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone || 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    const formatted = now.toLocaleString('zh-CN', options);
    return `当前时间: ${formatted} (时区: ${timezone || 'Asia/Shanghai'})`;
  },
});

import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import type { StructuredToolInterface } from '@langchain/core/tools';

// ─── MCP Server 配置类型 ───

/** MCP 传输方式 */
export type MCPTransport = 'stdio' | 'http' | 'sse';

/** MCP 服务器配置 */
export interface MCPServerConfig {
  /** 传输方式（可选，可从 command/url 自动推断） */
  transport?: MCPTransport;
  /** stdio 命令（仅 stdio） */
  command?: string;
  /** stdio 参数（仅 stdio） */
  args?: string[];
  /** 远程 URL（仅 http/sse） */
  url?: string;
  /** HTTP 请求头（仅 http） */
  headers?: Record<string, string>;
}

// ─── MCPClientManager ───

/**
 * MCP Client 管理器
 * 负责连接 MCP 服务器、获取远程工具、关闭连接
 */
export class MCPClientManager {
  private client: MultiServerMCPClient | null = null;
  private connected = false;

  /**
   * 连接 MCP 服务器并获取远程工具
   * @param servers MCP 服务器配置
   * @returns 远程工具数组
   */
  async connect(
    servers: Record<string, MCPServerConfig>,
  ): Promise<StructuredToolInterface[]> {
    if (this.connected) {
      throw new Error('MCPClientManager 已连接，请先调用 close() 再重新连接');
    }

    // 将 MCPServerConfig 转换为 MultiServerMCPClient 所需的配置格式
    const mcpServers: Record<string, Record<string, unknown>> = {};
    for (const [name, config] of Object.entries(servers)) {
      // 自动推断 transport：command → stdio，url → http
      let transport = config.transport;
      if (!transport) {
        if (config.command) {
          transport = 'stdio';
        } else if (config.url) {
          transport = 'http';
        } else {
          throw new Error(
            `[MCP] 服务器 "${name}" 配置无效：必须指定 transport，或提供 command / url 字段`,
          );
        }
      }

      if (transport === 'stdio') {
        mcpServers[name] = {
          transport: 'stdio',
          command: config.command || '',
          args: config.args || [],
        };
      } else if (transport === 'http') {
        mcpServers[name] = {
          transport: 'http',
          url: config.url || '',
          headers: config.headers,
        };
      } else if (transport === 'sse') {
        mcpServers[name] = {
          transport: 'sse',
          url: config.url || '',
        };
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.client = new MultiServerMCPClient({ mcpServers } as any);
    const tools = await this.client.getTools();
    this.connected = true;
    return tools;
  }

  /**
   * 关闭所有 MCP 连接
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.connected = false;
    }
  }
}

// ─── 工具合并 ───

/**
 * 合并本地工具和 MCP 远程工具
 * 本地工具优先，同名工具忽略远程工具并打印 warning
 */
export function mergeTools(
  localTools: StructuredToolInterface[],
  remoteTools: StructuredToolInterface[],
): StructuredToolInterface[] {
  const localNames = new Set(localTools.map(t => t.name));
  const merged = [...localTools];

  for (const remoteTool of remoteTools) {
    if (localNames.has(remoteTool.name)) {
      process.stderr.write(
        `[MCP] 工具名称冲突: "${remoteTool.name}" — 保留本地工具，忽略远程工具\n`,
      );
    } else {
      merged.push(remoteTool);
    }
  }

  return merged;
}

// ─── createMCPClient 高级函数 ───

/**
 * 创建独立的 MCP Client
 * 返回工具和关闭函数，供高级用户自行管理生命周期
 */
export async function createMCPClient(servers: Record<string, MCPServerConfig>): Promise<{
  tools: StructuredToolInterface[];
  close: () => Promise<void>;
}> {
  const manager = new MCPClientManager();
  const tools = await manager.connect(servers);
  return {
    tools,
    close: () => manager.close(),
  };
}

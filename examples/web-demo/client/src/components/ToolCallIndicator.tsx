import type { ToolCallInfo } from '../types';

interface ToolCallIndicatorProps {
  toolCalls: ToolCallInfo[];
}

export function ToolCallIndicator({ toolCalls }: ToolCallIndicatorProps) {
  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="tool-calls">
      {toolCalls.map((tc, i) => (
        <div key={i} className={`tool-call ${tc.status}`}>
          <div className="tool-call-header">
            <span className="tool-icon">{tc.status === 'running' ? '...' : '>'}</span>
            <span className="tool-name">{tc.tool}</span>
            <span className={`tool-status ${tc.status}`}>
              {tc.status === 'running' ? '调用中' : '完成'}
            </span>
          </div>
          {tc.args && Object.keys(tc.args).length > 0 && (
            <div className="tool-args">
              <code>{JSON.stringify(tc.args)}</code>
            </div>
          )}
          {tc.result && (
            <div className="tool-result">
              <code>{tc.result}</code>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

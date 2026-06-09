import { StateGraph, END } from '@langchain/langgraph';
import { Annotation } from '@langchain/langgraph';
import type { GraphState, NodeHandler, ConditionFn } from '../core/types';

interface EdgeDefinition {
  from: string;
  to: string;
}

interface ConditionalEdgeDefinition<S extends GraphState = GraphState> {
  from: string;
  condition: ConditionFn<S>;
  pathMap?: Record<string, string>;
}

/**
 * AgentGraph - 图构建器 API
 * 允许使用者通过链式调用构建自定义执行图
 */
export class AgentGraph<S extends GraphState = GraphState> {
  private nodes: Map<string, NodeHandler<S>> = new Map();
  private edges: EdgeDefinition[] = [];
  private conditionalEdges: ConditionalEdgeDefinition<S>[] = [];
  private entryPoint: string | null = null;

  /** 添加节点 */
  addNode(name: string, handler: NodeHandler<S>): this {
    this.nodes.set(name, handler);
    // 第一个添加的节点自动成为入口
    if (!this.entryPoint) {
      this.entryPoint = name;
    }
    return this;
  }

  /** 添加固定边 */
  addEdge(from: string, to: string): this {
    this.edges.push({ from, to });
    return this;
  }

  /** 添加条件边 */
  addConditionalEdge(
    from: string,
    condition: ConditionFn<S>,
    pathMap?: Record<string, string>,
  ): this {
    this.conditionalEdges.push({ from, condition, pathMap });
    return this;
  }

  /** 设置入口点 */
  setEntryPoint(name: string): this {
    this.entryPoint = name;
    return this;
  }

  /** 编译图为可执行对象 */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  compile() {
    this.validate();

    // 创建 Annotation
    const StateAnnotation = Annotation.Root({
      ...Object.fromEntries(
        Array.from(this.nodes.keys()).map(key => [
          key,
          Annotation<unknown>({
            reducer: (_prev: unknown, next: unknown) => next,
          }),
        ]),
      ),
      messages: Annotation<unknown[]>({
        reducer: (prev: unknown[], next: unknown[]) => [...prev, ...next],
        default: () => [],
      }),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const graph = new StateGraph(StateAnnotation) as any;

    // 添加节点
    for (const [name, handler] of this.nodes) {
      graph.addNode(name, async (state: Record<string, unknown>) => {
        return handler(state as S);
      });
    }

    // 设置入口：从 START 连接到 entryPoint
    if (this.entryPoint) {
      graph.addEdge('__start__', this.entryPoint);
    }

    // 添加固定边
    for (const edge of this.edges) {
      if (edge.to === 'end') {
        graph.addEdge(edge.from, END);
      } else {
        graph.addEdge(edge.from, edge.to);
      }
    }

    // 添加条件边
    for (const condEdge of this.conditionalEdges) {
      const conditions: Record<string, string> = {
        ...condEdge.pathMap,
      };
      if (!conditions['end']) {
        conditions['end'] = END;
      }
      graph.addConditionalEdges(
        condEdge.from,
        (state: Record<string, unknown>) => {
          return condEdge.condition(state as S);
        },
        conditions,
      );
    }

    return graph.compile();
  }

  /** 校验图结构 */
  private validate(): void {
    if (this.nodes.size === 0) {
      throw new Error('Graph must have at least one node');
    }

    if (!this.entryPoint || !this.nodes.has(this.entryPoint)) {
      throw new Error(`Entry point "${this.entryPoint}" is not a valid node`);
    }

    // 检查是否有出边的节点引用了不存在的节点
    const allNodeNames = new Set(this.nodes.keys());
    allNodeNames.add('end');

    for (const edge of this.edges) {
      if (!this.nodes.has(edge.from)) {
        throw new Error(`Edge source "${edge.from}" is not a valid node`);
      }
      if (!allNodeNames.has(edge.to)) {
        throw new Error(`Edge target "${edge.to}" is not a valid node`);
      }
    }

    for (const condEdge of this.conditionalEdges) {
      if (!this.nodes.has(condEdge.from)) {
        throw new Error(`Conditional edge source "${condEdge.from}" is not a valid node`);
      }
    }

    // 检查孤立节点（没有出边且不是条件边源头的节点）
    const nodesWithOutgoing = new Set<string>();
    for (const edge of this.edges) {
      nodesWithOutgoing.add(edge.from);
    }
    for (const condEdge of this.conditionalEdges) {
      nodesWithOutgoing.add(condEdge.from);
    }

    for (const name of this.nodes.keys()) {
      if (!nodesWithOutgoing.has(name) && name !== this.getLastNode()) {
        // 警告但不阻止编译 - 可能是终点节点
      }
    }
  }

  /** 获取最后一个添加的节点 */
  private getLastNode(): string | undefined {
    const keys = Array.from(this.nodes.keys());
    return keys[keys.length - 1];
  }
}

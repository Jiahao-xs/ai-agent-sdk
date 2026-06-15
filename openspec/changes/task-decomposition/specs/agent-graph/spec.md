## ADDED Requirements

### Requirement: 拓扑排序工具函数

系统 SHALL 提供 `topologicalSort(tasks)` 工具函数，对任务 DAG 进行拓扑排序，返回可执行的任务顺序。

#### Scenario: 线性依赖排序

- **WHEN** 输入任务列表为 `[{id:'a'}, {id:'b', dependsOn:['a']}, {id:'c', dependsOn:['b']}]`
- **THEN** 返回执行顺序 `['a', 'b', 'c']`

#### Scenario: 并行层分组

- **WHEN** 输入任务列表为 `[{id:'a'}, {id:'b'}, {id:'c', dependsOn:['a','b']}]`
- **THEN** 返回分组执行顺序 `[['a', 'b'], ['c']]`，同组任务可并行

#### Scenario: 循环依赖报错

- **WHEN** 输入任务列表存在循环依赖
- **THEN** 抛出 `CyclicDependencyError`，包含循环路径信息

### Requirement: DAG 构建器

系统 SHALL 提供 `TaskDAG` 类，支持通过代码构建和验证任务 DAG。

#### Scenario: 链式构建 DAG

- **WHEN** 调用 `new TaskDAG().addTask('a', {...}).addTask('b', {dependsOn:['a']}).build()`
- **THEN** 返回验证通过的任务 DAG 对象

#### Scenario: 验证失败

- **WHEN** DAG 中存在循环依赖或无效引用
- **THEN** `build()` 方法抛出验证错误

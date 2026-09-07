# Agent Note: Native constructor source matched by grammar, not V8 spelling

Status: implemented

[English](2026-09-07-native-constructor-source-grammar.md) | 中文

## 问题

四处无损 JSON 的内建判定——`dsh-util-values`、`dsh-tools` 的 JSON Schema 校验、Cordis host-runner 的 guard、以及 code-runtime worker——识别一个 realm 的内建 `Object` 或 `Array` 构造函数时，是把 `Function.prototype.toString` 的输出与字面量 `function Object() { [native code] }` 做全等比较。这个字面量是 V8 的拼写。ECMA-262 只规定 NativeFunction 源码的词法单元，空白由引擎决定；JavaScriptCore 和 SpiderMonkey 会把它渲染成三行。

于是在 Safari 里每个普通对象都通不过内建判定，`snapshotJsonValue` 返回 `undefined`，`expandAssistantStream` 对每条内嵌流的 Assistant 消息都抛出 `Assistant stream raw chunk must be a lossless JSON object`。由于这次抛出发生在 Web 端 Conversation 组装内部，实时轮次的聊天记录停在第一条 Assistant 消息处，冷加载则整页空白，而 Host 投影（例如步骤计数）照常推进。Node、jsdom 和 Chrome 都运行 V8，所以单元测试和会话日志回放从未复现。

## 决策

四处判定各自保留一份副本——host-runner、worker 与 tools 的副本是刻意的 realm/VM 边界，已用 `jscpd:ignore` 记录——每一份现在都用按 NativeFunction 语法构造的正则检查渲染出的源码：`function`、构造函数名、`()`、`{`、`[native code]`、`}`，词法单元之间允许任意空白。worker 副本通过捕获的内建 `RegExp.prototype.test` 应用该模式，与它已有的捕获 `Function.prototype.toString` 的方式一致。名称与原型同一性检查保持不变，因此改名为 `Object` 的编译期用户函数依然会失败：它的源码是自己的函数体，永远不会是 `[native code]`。

## 曾考虑的替代方案

**与一组已知引擎拼写逐一比较。** 不采用：下一个引擎或下一次空白变化会重现同样的失败；语法才是真正的契约。

**去掉源码检查，只依赖 `constructor.name` 加原型同一性。** 不采用：同一 realm 内伪造的构造函数能同时满足两者，现有伪造原型测试固定了这一拒绝行为。

**把四处副本收拢到一个导出后面。** 本次不采用：worker 与 host-runner 的副本存在的目的就是让沙箱代码无法触及 workspace 运行时导入，tools 的副本守护 schema 的 realm 边界；这份重复已被记录且是有意为之。

## 测试

`core/session/tests/json.spec.ts`（覆盖 `dsh-util-values`）、`core/tools/tests/json-schema.spec.ts`、`code-runtime-worker-thread/tests/worker-json.spec.ts` 与 `cordis-host-runner/tests/sandbox.spec.ts` 用 JavaScriptCore 的拼写渲染内建构造函数，断言内建值依然通过而伪造原型依然被拒绝。Safari 26 上的复现——记录在第一条 Assistant 推理行之后冻结、重新打开时空白——由报告问题的用户在 Safari 中确认已修复。

## 后果

在任何符合规范的引擎下普通 JSON 值都能被识别，因此 Web 客户端在 Safari 和 Firefox 中组装 Assistant 流的行为与 Chrome 一致。判定对伪造构造函数保持与之前同样的严格。与本次调查一同落地的[增量组装失败后整窗重建](2026-09-07-conversation-window-rebuild-on-assembly-failure.zh.md)对瞬时故障仍然有用，但无法从这一故障中恢复，因为它在每个窗口上都确定性地抛出。

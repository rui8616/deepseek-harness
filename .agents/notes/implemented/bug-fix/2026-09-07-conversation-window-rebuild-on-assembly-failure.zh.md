# Agent Note: Conversation window rebuild after incremental assembly failure

Status: implemented

[English](2026-09-07-conversation-window-rebuild-on-assembly-failure.md) | 中文

## 问题

Session 事件源会隔离它的订阅者：`notifySubscribers` 记录订阅者失败后继续执行。订阅该事件源的每会话 Conversation binding 在组装这一版本携带的变更之前，就先采纳了发布的版本号。增量组装抛出异常时，事件源吞掉了失败，而 binding 的版本号已经推进，之后每个窗口的版本号依然连续——于是那条「版本号不连续就从整窗重建」的分支再也不会执行。

此后该视图在页面剩余生命周期内一直停在出错的那个版本，而事件源、Session 快照与 Host 投影仍在更新。运行中的轮次照常推进依赖 `sessionStats` 投影的步骤计数与耗时，输入区也照常在 `turn/end` 时回到空闲控件，于是记录停在很早的一个步骤，而其他所有界面都显示这一轮已经完整跑完。

## 决策

binding 只在该版本组装成功之后才采纳它。`accept` 通过单一的 `applyChange` 步骤应用 prepend、append 与 settle-assistant 变更；抛出的异常被记录下来并转入整窗重建，重建丢弃部分应用的变更并恢复实时追加。`replace` 同样先构建替换窗口再记录版本号，因此重建失败会让 binding 落后于事件源，下一个窗口就是不连续的，该窗口再次转入重建，而不是在已损坏的状态上继续追加。

恢复由 binding 自己负责，因为事件源无法把失败回报给它：它的发布是同步扇出，没有返回值。

## 曾考虑的替代方案

**让失败从订阅者中向上抛出。** 不采用：事件源按契约隔离订阅者，一个 Conversation binding 的失败不能阻止 Session 快照、队列镜像或其他 binding 观察到同一次发布。

**只重置抛出异常的那个 Context。** 不采用：组装器持有跨 Context 依赖与位置索引，部分应用的变更可能留下不属于任何单个 Context 的状态。`replaceWindow` 本来就会清空并从窗口重建每一个 Context。

**记录一个损坏标志并停止发布。** 不采用：那会把冻结的记录变成设计上的永久行为，而这正是本记录要修的缺陷。

## 测试

`conversation-registry.client.spec.ts` 追加三条事件，让组装在中间那条上抛出一次异常，然后断言重建后的窗口包含两次更新。没有本次改动时，该用例会以事件源自己的 `event feed subscriber failed` 消息失败——正是记录冻结时在浏览器 console 中观察到的那一行。

## 后果

一次瞬时组装失败的代价是一次整窗重建，而不是在页面剩余生命周期内冻结整个记录。重建量与窗口成正比，且只在失败的那次发布上执行。底层抛出的异常仍会显示在 console 中，仍需各自修复；本决策只覆盖恢复路径。

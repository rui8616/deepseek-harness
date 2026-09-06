---
description: "面向侧栏的部署自有品牌填充，在所有非官方构建中生效；供用自己的标志与名称替换本地构建品牌的维护者阅读。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-brand-custom

[English](README.md) | 中文

## 概述

本包向侧栏品牌槽位——`sidebar.brand.mark` 与 `sidebar.brand.name`——填充部署自有的标志与名称。除了以 `official` profile 构建的客户端 bundle 之外，它在所有构建中注册这些填充，恰好是 [`dsh-client-ui-brand-official`](../ui-brand-official/README.zh.md) 的补集：两个包共享一份 bundle 名单，却永远不会占据同一个格子，因此 `official` 构建显示官方品牌，其余构建显示本包的品牌。名称下方保留外壳的构建戳（版本、提交、dirty 标记），本地构建不会丢失回退原本携带的任何信息。会话首屏槽位（`conversation.hero.brand.mark`）保持无填充：其声明包以动画首屏鱼作为回退渲染。当部署身份不是 DeepSeek 自身时选择本包；编辑 `src/client/Brand.tsx` 与 `src/client/locales.ts` 即可换成你自己的标志与名称。它不保留任何运行时状态，也不向模型请求贡献任何内容。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与延期工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

在 web-app bundle 的浏览器名单中挂载本插件（发布名单已把它放在官方包旁边），然后以 `official` 之外的任意 profile 构建客户端。

### 换成你的品牌

标志是 [`src/client/Brand.tsx`](src/client/Brand.tsx) 中的 `CustomBrandMark` svg；它按宿主界面要求的宽度绘制官方鲸鱼轮廓（来自 `dsh-client-ui-primitives` 的 `FISH_LOGO_PATH`），并以主题的 DeepSeek 品牌蓝别名填充，因此亮暗模式都会跟随。换成自己的标志时替换路径或填充即可——[`BRAND_GUIDELINES.zh.md`](../../../BRAND_GUIDELINES.zh.md) 要求非 DeepSeek 自身的部署不要把官方标志呈现为官方背书。名称是 [`src/client/locales.ts`](src/client/locales.ts) 中的 `brand.name` 键，旁边的徽章是 `brand.tag`（默认 `HARNESS`，仿官方字标的徽章），每个发布语言（zh、en、ja）各一条；`verify-client-ui-i18n` 会拒绝直接写进组件的产品文案。在探测运行中的 `dsh web` 服务器之前先重建 bundle（`pnpm --filter @deepseek-ai/dsh-client-ui-brand-custom bundle`）。

### 选择 profile

`DSH_CLIENT_BUILD_PROFILE` 决定渲染哪个品牌。`official` 构建把两个槽位都留给官方包；任何其他取值（包括未设置）都会注册本包的填充。两种情况下插件都会照常加载并通过校验；只有注册受 profile 门控。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

两个填充作为一组声明感知的注册安装：嵌套的 `ctx.slots.inject()` 调用等待侧栏声明，因此无论本行在声明者之前还是之后激活，这组注册都能工作；声明消失时两个填充一并撤回，HMR 期间也不会留下残缺的品牌混合。名称填充以 `brand` locale 命名空间注册，其字典由插件在同一个 apply 中通过 `ctx.locale` 注册；构建戳读取每个客户端 bundle 都携带的 `DSH_CLIENT_*` define。浏览器半部是 [`src/client/index.ts`](src/client/index.ts)；node 半部是一个空 Loader 座位。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

当品牌面不够用时阅读以下页面。它们从本包占据的槽位进入渲染这些槽位的外壳。

- [ui-brand-official](../ui-brand-official/README.zh.md)——`official` 构建下与本包互补的填充集合。
- [ui-sidebar](../ui-sidebar/README.zh.md)——声明 `sidebar.brand.mark` 与 `sidebar.brand.name` 并渲染其回退。
- [Web Client Slots](../../../docs/subsystems/slots.zh.md)——本包遵循的组合规则。

-----

<a id="model-experience"></a>
## 模型体验

无，因为本包只贡献浏览器呈现；这里没有任何内容进入模型请求。

#### KV Cache 影响

无；本包既不组装也不发送提供方请求。

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>


这些限制界定了品牌呈现的供给方式。它们是当前包约束，不是品牌设计对比或任务积压。

- **品牌内容是源码而非配置**——更换标志或名称意味着编辑本包并重建其 bundle；没有任何 cordis.yml 字段或设置卡片可以选择它们。
- **浏览器标题独立**——`DSH_CLIENT_TITLE` 在构建时选择标题文本，而非通过 UI 槽位。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者的工作上下文——点击展开</summary>

无。

</details>

**运行时不变式：** 不发布伴生入口。本包不保留可变状态，两个 slot occupant 通过同一个事务性 effect 安装和释放。

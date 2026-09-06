---
description: "面向侧栏的嘉迅软件品牌填充，在所有非官方构建中生效；供维护本部署标志与名称的人阅读。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-brand-kasyun

[English](README.md) | 中文

## 概述

本包向品牌槽位——`sidebar.brand.mark`、`sidebar.brand.name`，以及空白会话首屏的 `conversation.hero.brand.mark`——填充嘉迅软件的标志与名称。除了以 `official` profile 构建的客户端 bundle 之外，它在所有构建中注册这些填充，恰好是 [`dsh-client-ui-brand-official`](../ui-brand-official/README.zh.md) 的补集：两个包共享一份 bundle 名单，却永远不会占据同一个格子，因此 `official` 构建显示官方品牌，其余构建显示嘉迅的品牌。标志是公司网站上的轮廓，以网站的蓝到绿渐变填充；名称旁边是 `HARNESS` 徽章，下方是外壳的构建戳（版本、提交、dirty 标记），本地构建不会丢失回退原本携带的任何信息。首屏标志是同一轮廓按首屏尺寸绘制，不带回退鱼的悬停动画。浏览器标签页在本包之外完成品牌化：外壳的 `apps/web/public/favicon.svg` 与 web manifest 以静态资产携带标志与名称，`kasyun` 客户端构建 profile 固定标签页文字。它不保留任何运行时状态，也不向模型请求贡献任何内容。

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

### 更换品牌

标志的几何与渐变在 [`src/client/mark.ts`](src/client/mark.ts)：路径是 `https://www.kasyunsoft.com/assets/mark.svg` 平移到原点后的结果，渐变是它的九个色标。[`src/client/Brand.tsx`](src/client/Brand.tsx) 按宿主界面要求的宽度绘制它们。名称是 [`src/client/locales.ts`](src/client/locales.ts) 中的 `brand.name` 键，旁边的徽章是 `brand.tag`，每个发布语言（zh、en、ja）各一条；`verify-client-ui-i18n` 会拒绝直接写进组件的产品文案。在探测运行中的 `dsh web` 服务器之前先重建 bundle（`pnpm --filter @deepseek-ai/dsh-client-ui-brand-kasyun bundle`）。

### 命名浏览器标签页

标签页文字不是槽位：外壳在构建时读取 `DSH_CLIENT_TITLE`（index 页面与 document 标题都用它），缺省时回退到本地构建标签。仓库的 `kasyun` 客户端构建 profile（`scripts/client-build-environment.ts`）把 `DSH_CLIENT_TITLE=KASYUN` 与 `DSH_CLIENT_BUILD_PROFILE=kasyun` 固定在一起，根 `build` 脚本默认选用它，因此每次 `pnpm run build` 都会命名标签页，无需环境变量。标签页图标是外壳的静态 `favicon.svg`，直接携带标志。

### 选择 profile

`DSH_CLIENT_BUILD_PROFILE` 决定渲染哪个品牌。`official` 构建把两个槽位都留给官方包；任何其他取值（包括未设置）都会注册本包的填充。两种情况下插件都会照常加载并通过校验；只有注册受 profile 门控。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

两个侧栏填充作为一组声明感知的注册安装：嵌套的 `ctx.slots.inject()` 调用等待侧栏声明，因此无论本行在声明者之前还是之后激活，这组注册都能工作；声明消失时两个填充一并撤回，HMR 期间也不会留下残缺的品牌混合。首屏填充是独立的一组 `ctx.slots.inject()`，因为声明那个槽位的是会话条目而非侧栏。标志的渐变定义在它自己的 svg 内，id 由 `useId` 派生，因为展开的品牌行、折叠的 rail 与首屏会同时挂载这个标志，固定 id 会冲突。名称填充以 `brand` locale 命名空间注册，其字典由插件在同一个 apply 中通过 `ctx.locale` 注册；构建戳读取每个客户端 bundle 都携带的 `DSH_CLIENT_*` define。浏览器半部是 [`src/client/index.ts`](src/client/index.ts)；node 半部是一个空 Loader 座位。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

当品牌面不够用时阅读以下页面。它们从本包占据的槽位进入渲染这些槽位的外壳。

- [ui-brand-official](../ui-brand-official/README.zh.md)——`official` 构建下与本包互补的填充集合。
- [ui-sidebar](../ui-sidebar/README.zh.md)——声明 `sidebar.brand.mark` 与 `sidebar.brand.name` 并渲染其回退。
- [ui-conversation](../ui-conversation/README.zh.md)——在空白会话首屏声明 `conversation.hero.brand.mark`。
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
- **渐变是固定的**——标志在两种主题下都保持网站的颜色，不跟随主题的标签或品牌 token。
- **浏览器标签页不受 profile 门控**——favicon 与 web manifest 是静态宿主资产，因此本仓库的 `official` 构建也会带上嘉迅图标与 manifest 名称；标签页文字则跟随所选 profile。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者的工作上下文——点击展开</summary>

无。

</details>

**运行时不变式：** 不发布伴生入口。本包不保留可变状态，各 slot occupant 通过各自的声明感知 effect 安装和释放。

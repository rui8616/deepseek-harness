# Agent Note: Deployment brand occupants for the sidebar slots

Status: implemented

[English](2026-09-06-deployment-brand-sidebar-occupants.md) | 中文

## Problem

侧栏品牌行由两个 `single` 槽位组合而成——`sidebar.brand.mark` 与 `sidebar.brand.name`——而唯一发布的填充 `dsh-client-ui-brand-official` 在 `official` 客户端构建之外不注册任何内容。因此其余所有构建显示的都是外壳回退——鱼形标志、`brand.localBuild` 标签和构建戳——除了改 `SidebarRoot.tsx` 或去掉官方包的构建门控之外，没有受支持的途径把部署自己的身份放进去。槽位参考把 `single` 格子记为替换点，官方 README 也说自有品牌的部署"在相同槽位中组合另一个包"，但当时并不存在可供照抄的这样一个包，而第一版尝试（以更低优先级无条件注册）会连 `official` 构建中的官方品牌一起遮蔽。

## Decision

`packages/client/ui-brand-custom`（`@deepseek-ai/dsh-client-ui-brand-custom`）占据两个侧栏品牌槽位，并在 web-app bundle 中挂载于官方包旁边。它的注册门控恰好是官方包门控的补集：当 `DSH_CLIENT_BUILD_PROFILE === 'official'` 时 `apply` 直接返回，因此两行永远不会注册进同一个格子，也不需要优先级仲裁。两个填充作为一组声明感知的集合安装（嵌套 `ctx.slots.inject`、生成器 yield 出的注册），无论侧栏在本行之前还是之后声明都能到位，并在释放时一并离开。

标志复用官方鲸鱼几何（`dsh-client-ui-primitives` 为组合标志导出的 `FISH_LOGO_PATH` 与 `FISH_LOGO_VIEWBOX`），以主题的 DeepSeek 品牌蓝别名（`--dsw-alias-brand-primary-new-colorprimary-new-color`）填充，因此侧栏显示的是 DeepSeek 的蓝色鲸鱼，而外壳回退显示的是同一轮廓的墨色版本。名称以 `brand` locale 命名空间注册：`brand.name` 旁边是 `brand.tag` 徽章（`HARNESS`，仿官方字标 svg 里画死的那块徽章——它是 `BrandWordmark` 内部的图形而非组件，这正是此前任何非官方构建都看不到它的原因），下方是与外壳回退相同的构建戳——版本、提交、`dirty`——数据来自客户端 tsdown 预设烘焙进每个 bundle 的 `DSH_CLIENT_*` define。随包发布的是占位名称值（`DSH Custom` 及其 zh/ja 对应项）；部署方编辑 `Brand.tsx` 与 `locales.ts`。

`apps/web/tests/built-boot.expected.e2e.ts` 是真实组合测试：其非官方分支现在断言品牌蓝鲸鱼、`HARNESS` 徽章出现、本地构建标签缺席；官方分支保持不变。

## Alternatives considered

**以低于官方填充的优先级无条件注册。** `single` 格子的优先级遮蔽是有文档的，也能让 bundle 保持纯增量，但它会让自定义品牌在 `official` 构建里也胜出，使官方行沦为死重，并破坏 e2e 的官方分支。否决，改用互补门控。

**在 web-app bundle 中替换掉官方行。** 这是官方 README 对自有品牌部署的字面指示。否决，因为它会让 fork 的 bundle 在一个已发布的行上偏离上游，并失去从同一份名单构建 `official` 客户端的能力；互补门控对非官方构建给出相同结果，却不用移除任何东西。

**编辑 `SidebarRoot.tsx` 中的外壳回退，或去掉官方包的构建门控。** 两者都把品牌放进宿主源码而不是可组合的填充，与槽位参考的扩展规则和官方包声明的替换路径相悖。

**只有名称，不带构建戳。** 更简单，但本地构建会丢掉回退原本携带的提交戳，而那正是测试部署从这一行需要的唯一信息。

**自绘的几何标志。** 第一版发布的是圆角方块加四角星。替换的原因是需求是一个符合 DeepSeek 自身标准的标志，而导出的鲸鱼几何加品牌蓝 token 无需新作画即可满足；`BRAND_GUIDELINES.md` 是商标使用文档而非视觉规范，包 README 已指引非 DeepSeek 的部署替换轮廓。

## Consequences

非官方构建显示自定义品牌而非鱼形标志与本地构建标签；e2e 期望随之移动。更换品牌是源码编辑加 bundle 重建，而非配置——已记为已知限制。本包新增一个 `brand` locale 命名空间，并给 web-app 名单及其依赖列表各增加一行。覆盖由本包自己的 `browser-plugin.client.spec.tsx`（两侧门控、先后声明、释放、字典、戳格式）加上发布组合的装配启动 e2e 承担。

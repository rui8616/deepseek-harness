# Agent Note: Deployment brand occupants for the sidebar slots

Status: implemented

[English](2026-09-06-deployment-brand-sidebar-occupants.md) | 中文

## Problem

侧栏品牌行由两个 `single` 槽位组合而成——`sidebar.brand.mark` 与 `sidebar.brand.name`——而唯一发布的填充 `dsh-client-ui-brand-official` 在 `official` 客户端构建之外不注册任何内容。因此其余所有构建显示的都是外壳回退——鱼形标志、`brand.localBuild` 标签和构建戳——除了改 `SidebarRoot.tsx` 或去掉官方包的构建门控之外，没有受支持的途径把部署自己的身份放进去。槽位参考把 `single` 格子记为替换点，官方 README 也说自有品牌的部署"在相同槽位中组合另一个包"，但当时并不存在可供照抄的这样一个包，而第一版尝试（以更低优先级无条件注册）会连 `official` 构建中的官方品牌一起遮蔽。

## Decision

`packages/client/ui-brand-kasyun`（`@deepseek-ai/dsh-client-ui-brand-kasyun`）以嘉迅软件的品牌占据两个侧栏品牌槽位和空白会话首屏的 `conversation.hero.brand.mark`，并在 web-app bundle 中挂载于官方包旁边。它的注册门控恰好是官方包门控的补集：当 `DSH_CLIENT_BUILD_PROFILE === 'official'` 时 `apply` 直接返回，因此两行永远不会注册进同一个格子，也不需要优先级仲裁。侧栏填充作为一组声明感知的集合安装（嵌套 `ctx.slots.inject`、生成器 yield 出的注册），无论侧栏在本行之前还是之后声明都能到位，并在释放时一并离开；首屏填充是独立的一组 `ctx.slots.inject`，因为声明那个槽位的是会话条目。官方包把首屏留给动画鱼回退是因为那个回退本身就是官方标志；本包没有这层理由，因此首屏按其要求的尺寸静态显示嘉迅标志。浏览器标签页图标是同一门控下的一个 `ctx.effect`：把外壳的 `link[rel="icon"]` 指向补成正方形的标志的 `data:` svg，释放时还原外壳图标。标签页文字仍是外壳已经支持的构建期 `DSH_CLIENT_TITLE`（`DSH_CLIENT_TITLE=KASYUN pnpm run build`）；默认构建会透传继承的 `DSH_CLIENT_*` 值，因此不需要新的 profile。

标志是 `https://www.kasyunsoft.com/assets/mark.svg` 里的轮廓——一条 evenodd 路径、五个直边子路径——平移到包围盒起于原点（`KASYUN_MARK_PATH`，viewBox `382.53 × 216.07`），以网站的九色标蓝到绿渐变填充；渐变定义在标志自己的 svg 内，id 由 `useId` 派生，因为展开行与折叠 rail 会同时挂载这个标志。名称以 `brand` locale 命名空间注册：`brand.name`（`KASYUN` / `嘉迅` / `嘉迅`）旁边是 `brand.tag` 徽章（`HARNESS`，仿官方字标 svg 里画死的那块徽章——它是 `BrandWordmark` 内部的图形而非组件，这正是此前任何非官方构建都看不到它的原因），下方是与外壳回退相同的构建戳——版本、提交、`dirty`——数据来自客户端 tsdown 预设烘焙进每个 bundle 的 `DSH_CLIENT_*` define。

`apps/web/tests/built-boot.expected.e2e.ts` 是真实组合测试：其非官方分支现在断言至少两个嘉迅标志（侧栏与首屏）出现、所有鱼形 svg 缺席、`KASYUN` 名称与 `HARNESS` 徽章出现、本地构建标签缺席；官方分支保持不变。

## Alternatives considered

**以低于官方填充的优先级无条件注册。** `single` 格子的优先级遮蔽是有文档的，也能让 bundle 保持纯增量，但它会让自定义品牌在 `official` 构建里也胜出，使官方行沦为死重，并破坏 e2e 的官方分支。否决，改用互补门控。

**在 web-app bundle 中替换掉官方行。** 这是官方 README 对自有品牌部署的字面指示。否决，因为它会让 fork 的 bundle 在一个已发布的行上偏离上游，并失去从同一份名单构建 `official` 客户端的能力；互补门控对非官方构建给出相同结果，却不用移除任何东西。

**编辑 `SidebarRoot.tsx` 中的外壳回退，或去掉官方包的构建门控。** 两者都把品牌放进宿主源码而不是可组合的填充，与槽位参考的扩展规则和官方包声明的替换路径相悖。

**只有名称，不带构建戳。** 更简单，但本地构建会丢掉回退原本携带的提交戳，而那正是测试部署从这一行需要的唯一信息。

**DeepSeek 品牌蓝的官方鲸鱼。** 第二版复用了 `FISH_LOGO_PATH` 加主题的品牌蓝别名。替换的原因是 `BRAND_GUIDELINES.md` 要求非 DeepSeek 自身的部署不要把官方标志呈现为官方背书，而这个部署在自己的网站上有自己的标志。

**通用包名（`ui-brand-custom`）加占位值。** 前两版以模板形态发布。改名的原因是本包现在承载的是一个部署的真实标志与名称，模板名会误述它；别的部署应当把自己的包组合进同样的槽位，而不是编辑这一个。

**替换 `apps/web/public/favicon.svg` 作为标签页图标。** 零运行时代码，也能覆盖到 web manifest，但它是所有构建 profile 共用的宿主资产，`official` 构建也会带上嘉迅图标。运行时 effect 让图标与填充处在同一门控之下；manifest 记为已知限制。

**通过 `common` 字典的 `brand.localBuild` 重命名标签页文字。** 支持多语言且无需构建参数，但这个键表示的是外壳的本地构建标签，`ui-sidebar` 的快照固定了它，而且一个 locale 命名空间只有一个所有者，插件无法覆盖。`DSH_CLIENT_TITLE` 是外壳文档化的标题输入。

**跟随主题的单色而非网站渐变。** `currentColor` 或品牌 token 会与侧栏其他图标一致，但渐变正是这个标志的识别部分；去掉之后轮廓只是一个无名的角形。

## Consequences

非官方构建显示嘉迅品牌而非鱼形标志与本地构建标签；e2e 期望随之移动。更换品牌是源码编辑加 bundle 重建，而非配置——已记为已知限制，与主题无关的渐变也是。本包新增一个 `brand` locale 命名空间，并给 web-app 名单及其依赖列表各增加一行。覆盖由本包自己的 `browser-plugin.client.spec.tsx`（两侧门控、先后声明、释放、字典、渐变与 id 唯一性、戳格式）加上发布组合的装配启动 e2e 承担。

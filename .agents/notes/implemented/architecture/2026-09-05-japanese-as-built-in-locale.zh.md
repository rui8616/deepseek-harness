# Agent Note: 日语作为内置 locale

Status: implemented

[English](2026-09-05-japanese-as-built-in-locale.md) | 中文

## Problem

Client 内置 locale 只有 `zh` 与 `en`，[全量接入决策](2026-07-30-client-locale-full-rollout.zh.md)有意封闭了这个集合：其余语言应当以语言包插件的形式到来，调用 `addLanguage` 并逐命名空间做单 locale 字典注册。而日语的需求是产品级支持，不是可选语言包。语言包无法提供这一点：单 locale 的 `register(ns, locale, dict)` 形式接受未类型化的 `LocaleDict`，因此语言包未覆盖的命名空间——包括语言包写成之后新增的每一个命名空间——都会静默回退到英文。这正是[文案归 locale 所有的决策](2026-08-23-locale-owned-client-ui-copy.zh.md)要消除的混合语言 UI，且没有任何门禁能发现它。

## Decision

**`ja` 作为第三个内置 locale 加入 `LOCALE_IDS`。** `BuiltInLocaleId` 随之扩展，因此带类型的 `register(ns, dicts)` 重载现在要求 `Record<'zh' | 'en' | 'ja', LocaleDictOf<N>>`。35 个注册点在其命名空间补齐日语字典之前全部是编译错误，只在一个 locale 中增删的 key 也无法通过编译。完整性由编译器负责，而非评审者。这里接受的代价是：第三方 client 插件若使用带类型的形式，今后必须提供三份字典；单 locale 形式对它们和语言包依然可用。

`zh` 仍是 key 集的真源（仓库的中文优先约定），`en` 仍是 `FALLBACK_LOCALE`。英语同时承担两个角色——浏览器未指名任何已注册语言时的开场 locale，以及生效 locale 缺 key 时查阅的字典——因为每份已发布字典在三个 id 上声明同一个 key 集；而浏览器未指名已注册语言的读者，恰是最不可能读中文或日文的读者。

**文档标签成为 locale 自身的属性。** `LocaleDefinition` 与 `LanguageRegistration` 新增可选的 `documentLang`，按 BCP 47 样式校验。`zh` 声明 `zh-CN`；`en` 与 `ja` 用自身 id 即无歧义。`syncDocumentLanguage` 改为读取生效定义，不再对单个 id 做特例，因此 id 本身不适合作 `<html lang>` 的语言包现在可以自行声明。

**日语拥有独立字体栈。** 基础字体栈点名的是简体中文字族（`PingFang SC`、`Hiragino Sans GB`、`Microsoft YaHei`）。两种语言共用的汉字在这些字体文件中呈现中文字形——直、骨、今、令、海等许多字都不同——而 `<html lang>` 只选择文档语言，不选择字形变体，字形取决于哪个字体文件先被解析到。因此 `ui-theme` 的 `base.css` 在 `:root:lang(ja)` 下覆盖 `--dsw-font-family` 与 `--ds-font-family-code`，读取的正是 locale 插件已在维护的 `lang` 属性。

**对等性门禁改为逐个内置 locale 与基准比对。** `locale-dictionary-parity.spec.ts` 现在持有 `SHIPPED_LOCALES` 与 `BASE_LOCALE`，不再硬编码 `zh`/`en` 这一对：发现逻辑在原有的四种命名形态上一并接纳 `ja`，内联注册表按 locale 数量而非字面量 2 判定，每个 locale 的 key 集都与基准比对，因此一条报告即可点名发生漂移的字典。缺少任一内置 locale 的分组是错误，而不是跳过。

## Verification

对等性门禁覆盖 `zh`/`en`/`ja` 上全部 35 个已发现的字典分组。`LocaleRuntime` 的规格把外部语言用例从 `ja` 改为本包不注册的 `ko`，并断言三 locale 目录及其文档标签。文档语言规格钉住 `ja` 解析为裸 `ja` 标签，而 `zh` 仍解析为 `zh-CN`。

## Alternatives considered

**以语言包插件形式提供日语。** 这是[先前决策](2026-07-30-client-locale-full-rollout.zh.md)预留的路径，且不触动现有包。就产品级支持而言予以否决：单 locale 注册形式不带 key 集检查，语言包遗漏的命名空间会渲染英文而不触发任何失败。若新增门禁断言语言包覆盖了每个已发现的命名空间，则等于在类型系统之外重新实现带类型重载已经强制的完整性。

**保持集合封闭，为语言包提供带类型的注册形式。** `register<N>(ns, locale, LocaleDictOf<N>)` 重载可以让语言包字典受类型检查。予以否决：语言包届时必须 type-import 每个 client 包来合并 `LocaleNamespaceMap`，把对 33 个包的反向依赖集中到一处；而且新增命名空间时，仍没有任何东西强制语言包跟进。

## Consequences

- 新增 client 命名空间需要三份字典而非两份；编译器会在注册点点名遗漏。
- 使用带类型 `register` 重载的第三方 client 插件必须提供日语字典。单 locale 形式不受影响。
- `addLanguage({ id: 'ja', … })` 现在抛出 `already registered`；面向日语的语言包改为贡献字典。
- 语言行列出三个选项，`ja-JP` 浏览器在没有已存偏好时解析为日语。

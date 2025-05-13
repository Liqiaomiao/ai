# tsconfig.json 中 references 配置与 d.ts 文件 reference 标签的区别

## 问题
在 TypeScript 项目开发中，`tsconfig.json` 文件中的 `references` 配置和 `.d.ts` 文件中的 `/// <reference />` 标签有何区别？它们各自的作用是什么？

## 答案
### 1. tsconfig.json 中的 references 配置
- 主要用于**项目引用（Project References）**，适用于大型项目或 monorepo 场景。
- 通过 `references` 字段，可以将项目拆分为多个子项目，每个子项目有独立的 tsconfig 文件。
- 优势：
  - 支持**增量编译**，只编译变更部分，提升编译效率。
  - 明确依赖关系，便于管理和维护。
- 示例：
```json
{
  "references": [{ "path": "./tsconfig.node.json" }]
}
```
- 相关配置如 `composite: true` 需在被引用项目的 tsconfig 中开启。

### 2. .d.ts 文件中的 reference 标签
- 通过 `/// <reference path="..." />` 或 `/// <reference types="..." />`，用于**显式声明类型依赖**。
- 常见于早期 TypeScript 项目或需要手动引入类型声明文件时。
- 优势：
  - 控制类型文件的加载顺序。
  - 解决类型找不到的问题。
- 示例：
```ts
/// <reference path="./types/global.d.ts" />
```

### 总结
- `tsconfig.json` 的 `references` 用于**项目级别的依赖管理和增量编译**，适合大型工程结构优化。
- `.d.ts` 文件的 `reference` 标签用于**类型声明文件之间的依赖**，解决类型可见性问题。
- 两者关注点不同，前者面向项目结构，后者面向类型声明。
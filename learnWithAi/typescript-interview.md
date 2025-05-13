# TypeScript 配置与类型系统面试题

## 1. TypeScript的类型系统是如何工作的？

**问题**：请解释TypeScript的类型系统是如何工作的，以及如何通过配置文件控制类型检查？

**答案**：
TypeScript的类型系统主要通过以下几个方面工作：

1. **类型定义库（Lib）**：
   - 通过`tsconfig.json`中的`lib`配置控制可用的类型定义
   - 常用配置如：`["DOM", "DOM.Iterable", "ESNext"]`
   - DOM提供浏览器API类型
   - ESNext提供最新JavaScript特性类型

2. **严格类型检查**：
   - 通过`strict: true`启用全套严格检查
   - 包含null检查、函数类型检查等
   - 帮助在编译时捕获潜在错误

3. **模块解析**：
   - 使用`moduleResolution: "node"`进行模块查找
   - 支持`.ts`、`.tsx`、`.d.ts`文件
   - 可以直接导入JSON文件（需启用`resolveJsonModule`）

## 2. TypeScript的严格模式包含哪些检查？

**问题**：在`tsconfig.json`中启用`strict: true`会开启哪些检查？为什么要使用严格模式？

**答案**：
严格模式包含以下主要检查：

1. **空值检查**（strictNullChecks）
   - 明确处理null和undefined
   - 防止空引用错误

2. **函数类型检查**（strictFunctionTypes）
   - 更严格的参数类型检查
   - 确保类型安全的函数调用

3. **类属性检查**（strictPropertyInitialization）
   - 确保类属性在构造函数中初始化
   - 防止未初始化属性的使用

4. **绑定检查**（strictBindCallApply）
   - 确保bind、call、apply方法使用正确的参数类型

## 3. 如何优化TypeScript的编译性能？

**问题**：在大型项目中，如何通过tsconfig.json配置优化TypeScript的编译性能？

**答案**：
主要通过以下配置优化：

1. **跳过库检查**：
```json
{
  "skipLibCheck": true
}
```
   - 跳过对.d.ts文件的类型检查
   - 适用于大型项目，减少不必要的类型检查

2. **增量编译**：
```json
{
  "incremental": true
}
```
   - 只重新编译修改的文件
   - 保存编译信息到.tsbuildinfo文件
3.  **项目引用**：  
```json
{
 "references": [{ "path": "./tsconfig.node.json" }]
}
``` 
   - 将项目分割成小块
   - 支持增量编译

## 4. TypeScript中的模块解析策略有哪些？
**问题**：请解释TypeScript中的模块解析策略，以及如何配置？
**答案**：TypeScript支持两种主要的模块解析策略：
1. **Node.js风格**：
    - 模仿Node.js的模块解析逻辑
        - 支持`.js`、`.jsx`、`.ts`、`.tsx`文件
        - 查找`package.json`中的`main`字段
        - 查找`index.js`、`index.ts`等文件
  
2. **Classic风格**：
   - 仅支持`.js`、`.jsx`文件
   - 查找`index.js`文件
可以通过`moduleResolution`配置选择解析策略：
```json
{
  "moduleResolution": "node" // 或 "classic"
}
```
## 5. TypeScript项目中如何处理JSON导入？
**问题**：在TypeScript项目中如何处理JSON导入，以及如何配置？
**答案**：
TypeScript默认不支持JSON导入，需要使用第三方库或配置。
1. **使用第三方库**：
   - 安装`@types/json`或`json`类型定义
   - 导入JSON文件：`import data from './data.json'`

2. **配置TypeScript**：
   - 在`tsconfig.json`中添加`resolveJsonModule: true`
   - 导入JSON文件：`import data from './data.json'`
   
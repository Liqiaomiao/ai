# React Profiler 学习指南

## 1. 什么是React Profiler？
React Profiler是一个用于测量React组件树渲染性能的工具，可以程序化地收集渲染时间数据。

## 2. 基本用法是什么？
```jsx
<Profiler id="App" onRender={onRender}>
  <App />
</Profiler>
```
需要两个props：
- id: 标识被测量的UI部分
- onRender: 组件更新时React调用的回调函数

## 3. onRender回调有哪些参数？
```js
function onRender(id, phase, actualDuration, baseDuration, startTime, commitTime) {
  // 参数说明:
  // id: Profiler树的id
  // phase: "mount"|"update"|"nested-update"
  // actualDuration: 当前更新花费的毫秒数
  // baseDuration: 无优化情况下的预估渲染时间
  // startTime: 开始渲染的时间戳
  // commitTime: 提交更新的时间戳
}
```

## 4. 有哪些注意事项？
- 性能分析会增加额外开销
- 生产环境默认禁用，需要特殊构建启用
- 应谨慎使用，仅在需要时添加

## 5. 如何测量应用的不同部分？
可以使用多个Profiler组件：
```jsx
<App>
  <Profiler id="Sidebar" onRender={onRender}>
    <Sidebar />
  </Profiler>
  <Profiler id="Content" onRender={onRender}>
    <Content />
  </Profiler>
</App>
```

## 6. Profiler与开发者工具中的性能分析有何不同？
- <Profiler>是程序化测量
- 开发者工具提供交互式分析界面

## 7. 实际应用示例
```jsx
function App() {
  const onRender = (id, phase, actualDuration) => {
    console.log(`${id} ${phase} took ${actualDuration}ms`);
  };

  return (
    <Profiler id="App" onRender={onRender}>
      <MainContent />
    </Profiler>
  );
}
```
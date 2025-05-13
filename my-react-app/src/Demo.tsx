

import   { Profiler, useState } from "react";

function heavyCalculation(n: number) {
  let sum = 0;
  for (let i = 0; i < n * 1000000; i++) {
    sum += i % 10;
  }
  return sum;
}

function Demo() {
  const [profileData, setProfileData] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [enableHeavy, setEnableHeavy] = useState(false);

  const onRender = (
    id: string,
    phase: "mount" | "update" | "nested-update",
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    // setProfileData((prev) => [
    //   ...prev,
    //   { id, phase, actualDuration, baseDuration, startTime, commitTime }
    // ]);
    console.log("id", id);
    console.log("phase", phase);
    console.log("actualDuration", actualDuration);
    console.log("baseDuration", baseDuration);
    console.log("startTime", startTime);
    console.log("commitTime", commitTime);
  };

  return (
    <div>
      <h2>Demo 页面</h2>
      <button onClick={() => setCount((c) => c +  1)}>增加计数（触发 update）</button>
      <button onClick={() => setEnableHeavy((v) => !v)}>
        {enableHeavy ? "关闭" : "开启"} 性能消耗操作
      </button>
      <Profiler id="Demo" onRender={onRender}>
        <div>
          <p>这是一个用于演示路由功能的 Demo 页面。</p>
          <p>计数值: {count}</p>
          {enableHeavy && <p>耗时计算结果: {heavyCalculation(10)}</p>}
        </div>
      </Profiler>
      <h3>Profiler 性能分析数据：</h3>
      <ul>
        {profileData.map((item, idx) => (
          <li key={idx}>
            <strong>阶段:</strong> {item.phase} | <strong>实际耗时:</strong> {item.actualDuration.toFixed(2)}ms | <strong>基准耗时:</strong> {item.baseDuration.toFixed(2)}ms | <strong>开始时间:</strong> {item.startTime.toFixed(2)} | <strong>提交时间:</strong> {item.commitTime.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Demo;
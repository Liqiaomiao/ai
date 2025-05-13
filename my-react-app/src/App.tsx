import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import data from './name.json'
import Demo from './Demo'
import MasterGoPage from './MasterGoPage'
import WatermarkRemover from './WatermarkRemover'
import ImageOverlayEditor from './ImageOverlayEditor'

console.log(data.version)
function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <nav style={{ marginBottom: 20 }}>
        <Link to="/">首页</Link> | <Link to="/demo">Demo 页面</Link> | <Link to="/mastergo">MasterGo 页面</Link> | <Link to="/watermark-remover">水印移除工具</Link> | <Link to="/image-overlay">图片覆盖编辑器</Link>
      </nav>
      <Routes>
        <Route path="/" element={
          <>
            <div>
              <a href="https://vite.dev" target="_blank">
                <img src={viteLogo} className="logo" alt="Vite logo" />
              </a>
              <a href="https://react.dev" target="_blank">
                <img src={reactLogo} className="logo react" alt="React logo" />
              </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
              <button onClick={() => setCount((count) => count + 1)}>
                count is {count}
              </button>
              <p>
                Edit <code>src/App.jsx</code> and save to test HMR
              </p>
            </div>
            <p className="read-the-docs">
              Click on the Vite and React logos to learn more
            </p>
          </>
        } />
        <Route path="/demo" element={<Demo />} />
        <Route path="/mastergo" element={<MasterGoPage />} />
        <Route path="/watermark-remover" element={<WatermarkRemover />} />
        <Route path="/image-overlay" element={<ImageOverlayEditor />} />
      </Routes>
    </Router>
  )
}

export default App

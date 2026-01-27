import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AIChat } from '@pages/AIChat'
import './App.css'

/**
 * 简化版应用
 * 只有 AIChat 页面（梦境解析）
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 所有路由都指向 AIChat 页面 */}
        <Route path="/" element={<AIChat />} />
        <Route path="*" element={<AIChat />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

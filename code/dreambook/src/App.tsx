import { HashRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '@pages/HomePage'
import { NavigationPage } from '@pages/NavigationPage'
import { DetailPage } from '@pages/DetailPage'
import { AIChat } from '@pages/AIChat'
import AdminTrigger from '@/components/AdminTrigger/AdminTrigger'
import './App.css'

function App() {
  // 在 Electron 环境中使用 HashRouter，因为 file:// 协议不支持 BrowserRouter
  return (
    <HashRouter>
      {/* 管理员触发器：右上角点击5次打开管理面板 */}
      <AdminTrigger />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/navigation" element={<NavigationPage />} />
        <Route path="/dream/:id" element={<DetailPage />} />
        <Route path="/ai-chat" element={<AIChat />} />
      </Routes>
    </HashRouter>
  )
}

export default App

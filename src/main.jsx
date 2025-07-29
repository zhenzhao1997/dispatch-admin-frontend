// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'          // 新增
import { store } from './store/index.js'        // 新增
import './index.css'
import 'leaflet/dist/leaflet.css'               // 新增：导入Leaflet CSS
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
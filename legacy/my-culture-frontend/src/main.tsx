import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/i18n.js'
import App from './App.jsx'

const root = createRoot(document.getElementById("root")!);
root.render(
    <App />
);
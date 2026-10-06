import { createRoot } from 'react-dom/client'
// import { ThemeContextProvider } from './context/ThemeContext.jsx';
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './context/toastContext.jsx'


createRoot(document.getElementById('root')).render(
    // <ThemeContextProvider>
       <ToastProvider>
        <App />
      </ToastProvider>
    //   </ThemeContextProvider>
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom';
// import DecentralizedExamSystem from './App';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
      {/* <DecentralizedExamSystem /> */}
    </Router>
  </React.StrictMode>,
)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootEl);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
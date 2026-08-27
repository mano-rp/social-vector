import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DatasetProvider } from './context/DatasetContext';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <DatasetProvider>
          <App />
        </DatasetProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

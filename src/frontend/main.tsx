import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { installImagePolicy } from './utils/imagePolicy';
import './index.css';

installImagePolicy();

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

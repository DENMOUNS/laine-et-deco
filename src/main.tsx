import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './frontend/App';
import { installImagePolicy } from './frontend/utils/imagePolicy';
import './frontend/index.css';

installImagePolicy();

const tree = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  import.meta.env.DEV ? <React.StrictMode>{tree}</React.StrictMode> : tree
);

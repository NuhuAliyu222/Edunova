import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LmsProvider } from './context/LmsContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LmsProvider>
      <App />
    </LmsProvider>
  </StrictMode>,
);

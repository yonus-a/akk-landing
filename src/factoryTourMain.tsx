import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FactoryTourPage } from './features/factory-tour';
import './features/factory-tour/presentation/standalone.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FactoryTourPage />
  </StrictMode>,
);

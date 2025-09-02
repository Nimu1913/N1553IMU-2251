// my-app/client/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Update this import to the correct path where AuthProvider is exported
import { AuthProvider } from '@/hooks/use-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);
import { Outlet } from 'react-router';
import { ThemeProvider } from '../components/ThemeProvider';
import { Toaster } from '../components/ui/sonner';
import { Background } from '../components/Background';
import { RAGProvider } from '../context/RAGContext';

export function RootLayout() {
  return (
    <ThemeProvider>
      <RAGProvider>
        <Toaster />
        <Background />
        <Outlet />
      </RAGProvider>
    </ThemeProvider>
  );
}

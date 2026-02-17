import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './Sidebar';
import { HeaderActions } from '@features/editor';
import { useThemeStore } from '@stores/useThemeStore'; // <-- 1. Import the store
import { ThemeToggle } from '../ui/ThemeToggle';

export function MainLayout() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  // 2. THE DOM SYNC ENGINE
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    // Notice how we use our new semantic colors here! bg-canvas replaces bg-white
    <div className="flex h-screen w-full bg-canvas overflow-hidden font-sans transition-colors duration-300">
       <Sidebar />
      <Toaster position="bottom-right" reverseOrder={false} />
      {/* We use border-line to subtly separate the editor from the sidebar */}
      <div className="flex-1 flex flex-col min-w-0 border-l border-line">
        <header className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ink text-canvas rounded flex items-center justify-center font-bold font-serif text-lg shadow-sm">
              S
            </div>
            <span className="font-semibold text-ink tracking-tight">Smart Editor</span>
          </div>
          <HeaderActions />
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-10 pb-20">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}
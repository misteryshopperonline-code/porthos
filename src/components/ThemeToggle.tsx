'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
     // Return a skeleton that matches the button structure to avoid layout shift
    return <div className="w-full px-4 py-3 h-12 opacity-0 border border-transparent"></div>; 
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      className="flex w-full items-center justify-start rounded-lg px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-zinc-200 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-gray-100 transition-all font-medium border border-transparent"
      title="Cambiar Tema"
    >
      {currentTheme === 'dark' ? (
        <>
          <Sun className="h-5 w-5 mr-3" />
          <span>Modo Claro</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 mr-3" />
          <span className="text-zinc-700">Modo Oscuro</span>
        </>
      )}
    </button>
  );
}

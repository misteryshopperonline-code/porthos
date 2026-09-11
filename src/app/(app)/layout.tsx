import Sidebar from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden pt-8 px-6 pb-8 bg-zinc-50 dark:bg-dark-bg relative">
        {children}
      </main>
    </div>
  );
}

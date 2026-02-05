import { NavigationBar } from './NavigationBar';
import { GlobalSidebar } from './GlobalSidebar';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <GlobalSidebar />
      <div className="flex flex-col flex-1">
        <NavigationBar />
        <main
          aria-label="Main content"
          className="flex-1 p-6 overflow-y-auto bg-surface-canvas"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

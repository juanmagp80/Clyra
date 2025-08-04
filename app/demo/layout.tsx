import DemoSidebar from './components/DemoSidebar';

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen bg-background">
      <DemoSidebar />
      <main className="pl-64 h-full overflow-auto">
        {children}
      </main>
    </div>
  );
}

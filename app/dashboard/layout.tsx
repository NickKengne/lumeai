import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}


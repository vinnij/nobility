/* eslint-disable react/jsx-no-undef */
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/navigation/app-sidebar"
import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs"
import { Suspense } from "react"

export const metadata = {
    title: {
        template: "%s | Noble Rust Admin",
        default: "Noble Rust Admin",
    },
    description: "Admin panel for Noble Rust",
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Suspense fallback={<div>Loading...</div>}>
                            <DynamicBreadcrumbs />
                        </Suspense>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 py-6">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
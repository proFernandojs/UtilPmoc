"use client"

import { AppProvider, useApp } from "@/lib/app-context"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardPage } from "@/components/dashboard-page"
import { EdificacoesPage } from "@/components/edificacoes-page"
import { EquipamentosPage } from "@/components/equipamentos-page"
import { PlanosPage } from "@/components/planos-page"
import { TecnicosPage } from "@/components/tecnicos-page"
import { PmocPage } from "@/components/pmoc-page"
import { OrdensPage } from "@/components/ordens-page"
import { QrCodesPage } from "@/components/qrcodes-page"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

const pageNames: Record<string, string> = {
  dashboard: "Dashboard",
  edificacoes: "Edificacoes",
  equipamentos: "Equipamentos",
  planos: "Planos de Manutencao",
  tecnicos: "Tecnicos",
  pmoc: "Gerar PMOC",
  qrcodes: "Etiquetas QR Code",
  ordens: "Ordens de Servico",
}

function AppContent() {
  const { activePage } = useApp()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium">
                  {pageNames[activePage] || "Dashboard"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {activePage === "dashboard" && <DashboardPage />}
          {activePage === "edificacoes" && <EdificacoesPage />}
          {activePage === "equipamentos" && <EquipamentosPage />}
          {activePage === "planos" && <PlanosPage />}
          {activePage === "tecnicos" && <TecnicosPage />}
          {activePage === "pmoc" && <PmocPage />}
          {activePage === "qrcodes" && <QrCodesPage />}
          {activePage === "ordens" && <OrdensPage />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function Page() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

"use client"

import {
  Building2,
  LayoutDashboard,
  AirVent,
  ClipboardList,
  Users,
  FileText,
  Wrench,
  Wind,
  QrCode,
} from "lucide-react"
import { useApp, type ActivePage } from "@/lib/app-context"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"

const mainNav = [
  { key: "dashboard" as ActivePage, label: "Dashboard", icon: LayoutDashboard },
  { key: "edificacoes" as ActivePage, label: "Edificacoes", icon: Building2 },
  { key: "equipamentos" as ActivePage, label: "Equipamentos", icon: AirVent },
  { key: "planos" as ActivePage, label: "Planos de Manutencao", icon: ClipboardList },
  { key: "tecnicos" as ActivePage, label: "Tecnicos", icon: Users },
]

const actions = [
  { key: "pmoc" as ActivePage, label: "Gerar PMOC", icon: FileText },
  { key: "qrcodes" as ActivePage, label: "Etiquetas QR Code", icon: QrCode },
  { key: "ordens" as ActivePage, label: "Ordens de Servico", icon: Wrench },
]

export function AppSidebar() {
  const { activePage, setActivePage, planos } = useApp()
  const { setOpenMobile } = useSidebar()

  const atrasados = planos.filter(p => p.status === "Atrasado").length

  function handleMenuNavigation(page: ActivePage) {
    setActivePage(page)
    setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => handleMenuNavigation("dashboard")}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-center size-8 md:size-10 rounded-lg overflow-hidden bg-sidebar-primary ring-2 ring-sidebar-ring shadow-sm">
                <img
                  src="images/logo-util-pmoc.jpg"
                  alt="UTIL PMOC"
                  className="size-7 md:size-9 object-contain"
                />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-bold text-[11px] md:text-xs tracking-tight">UTIL PMOC</span>
                <span className="text-[9px] md:text-[10px] text-sidebar-foreground/60">Gestao de Climatizacao</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegacao</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={activePage === item.key}
                    onClick={() => handleMenuNavigation(item.key)}
                    tooltip={item.label}
                    className="cursor-pointer text-xs md:text-sm"
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.key === "planos" && atrasados > 0 && (
                    <SidebarMenuBadge className="bg-destructive text-destructive-foreground rounded-full text-[10px] px-1.5 min-w-5 flex items-center justify-center">
                      {atrasados}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Acoes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {actions.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={activePage === item.key}
                    onClick={() => handleMenuNavigation(item.key)}
                    tooltip={item.label}
                    className="cursor-pointer text-xs md:text-sm"
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-xs text-sidebar-foreground/50 cursor-default">
              <span>Lei 13.589/2018</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

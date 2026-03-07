"use client"

import { Building2, AirVent, ClipboardList, AlertTriangle, Users, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/app-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Pie, PieChart, Tooltip } from "recharts"

export function DashboardPage() {
  const { edificacoes, equipamentos, planos, tecnicos, ordensServico, setActivePage } = useApp()
  const isMobile = useIsMobile()

  const totalEdificacoes = edificacoes.length
  const totalEquipamentos = equipamentos.length
  const totalPlanos = planos.length
  const planosAtrasados = planos.filter(p => p.status === "Atrasado").length
  const planosEmDia = planos.filter(p => p.status === "Em Dia").length
  const planosPendentes = planos.filter(p => p.status === "Pendente").length

  const totalBtu = equipamentos.reduce((acc, eq) => acc + eq.capacidadeBtu, 0)

  const osAbertas = ordensServico.filter(o => o.status === "Aberta" || o.status === "Em Andamento").length
  const osConcluidas = ordensServico.filter(o => o.status === "Concluida").length

  // Data for charts
  const statusData = [
    { name: "Em Dia", value: planosEmDia, color: "var(--color-chart-2)", dotClass: "bg-chart-2" },
    { name: "Atrasado", value: planosAtrasados, color: "var(--color-destructive)", dotClass: "bg-destructive" },
    { name: "Pendente", value: planosPendentes, color: "var(--color-chart-3)", dotClass: "bg-chart-3" },
  ]

  const equipByEdificacao = edificacoes.map(ed => ({
    name: ed.nome.length > 20 ? ed.nome.substring(0, 20) + "..." : ed.nome,
    equipamentos: equipamentos.filter(eq => eq.edificacaoId === ed.id).length,
  }))

  const equipByTipo = equipamentos.reduce((acc, eq) => {
    const existing = acc.find(a => a.name === eq.tipo)
    if (existing) {
      existing.value++
    } else {
      acc.push({ name: eq.tipo, value: 1 })
    }
    return acc
  }, [] as { name: string; value: number }[])

  const stats = [
    {
      title: "Edificacoes",
      value: totalEdificacoes,
      icon: Building2,
      description: "Cadastradas no sistema",
      onClick: () => setActivePage("edificacoes"),
    },
    {
      title: "Equipamentos",
      value: totalEquipamentos,
      icon: AirVent,
      description: `${(totalBtu / 1000).toFixed(0)}k BTU total`,
      onClick: () => setActivePage("equipamentos"),
    },
    {
      title: "Planos de Manutencao",
      value: totalPlanos,
      icon: ClipboardList,
      description: `${planosEmDia} em dia`,
      onClick: () => setActivePage("planos"),
    },
    {
      title: "Alertas",
      value: planosAtrasados,
      icon: AlertTriangle,
      description: "Manutencoes atrasadas",
      onClick: () => setActivePage("planos"),
      alert: planosAtrasados > 0,
    },
  ]

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Visao geral do sistema de climatizacao</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className={`cursor-pointer transition-shadow hover:shadow-md ${stat.alert ? 'border-destructive/50' : ''}`}
            onClick={stat.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3 md:pb-2 md:px-6 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground line-clamp-1">{stat.title}</CardTitle>
              <stat.icon className={`size-3.5 md:size-4 ${stat.alert ? 'text-destructive' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
              <div className={`text-xl md:text-3xl font-bold ${stat.alert ? 'text-destructive' : 'text-foreground'}`}>{stat.value}</div>
              <p className="text-[11px] md:text-xs text-muted-foreground mt-1 line-clamp-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Status dos Planos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status dos Planos</CardTitle>
            <CardDescription>Distribuicao dos planos de manutencao</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[180px] md:h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 36 : 50}
                    outerRadius={isMobile ? 58 : 80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--color-card-foreground)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-2 md:gap-4 mt-2 flex-wrap">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className={`size-2.5 rounded-full ${item.dotClass}`} />
                  <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Equipamentos por Edificacao */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle className="text-base">Equipamentos por Edificacao</CardTitle>
            <CardDescription>Quantidade de equipamentos cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={equipByEdificacao} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--color-card-foreground)",
                    }}
                  />
                  <Bar dataKey="equipamentos" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Ordens de Servico Recentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Ordens de Servico Recentes</CardTitle>
            <CardDescription>{osAbertas} abertas, {osConcluidas} concluidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {ordensServico.slice(0, isMobile ? 3 : 5).map((os) => {
                const equip = equipamentos.find(e => e.id === os.equipamentoId)
                const tecnico = tecnicos.find(t => t.id === os.tecnicoId)
                return (
                  <div key={os.id} className="flex items-center gap-2 md:gap-3 rounded-lg border border-border p-2.5 md:p-3">
                    <div className="flex items-center justify-center size-7 md:size-8 rounded-full bg-secondary">
                      {os.status === "Concluida" ? (
                        <CheckCircle2 className="size-3.5 md:size-4 text-chart-2" />
                      ) : os.status === "Em Andamento" ? (
                        <Clock className="size-3.5 md:size-4 text-chart-3" />
                      ) : (
                        <XCircle className="size-3.5 md:size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs md:text-sm font-medium text-foreground truncate">{equip?.tag || os.equipamentoId}</p>
                        <Badge variant={os.tipo === "Preventiva" ? "secondary" : "destructive"} className="text-[10px] shrink-0">
                          {os.tipo}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{os.descricao}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge
                        variant={
                          os.status === "Concluida"
                            ? "default"
                            : os.status === "Em Andamento"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {os.status}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{tecnico?.nome.split(' ').slice(0, 2).join(' ')}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tecnicos */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle className="text-base">Equipe Tecnica</CardTitle>
            <CardDescription>{tecnicos.length} tecnicos cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {tecnicos.map((tec) => {
                const planosCount = planos.filter(p => p.tecnicoId === tec.id).length
                return (
                  <div key={tec.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-9 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {tec.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tec.nome}</p>
                      <p className="text-xs text-muted-foreground">{tec.empresa}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {planosCount} planos
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

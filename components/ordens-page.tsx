"use client"

import { useState } from "react"
import { Wrench, Plus, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useApp } from "@/lib/app-context"
import type { OrdemServico } from "@/lib/store"
import { QrBaixaServicoCard } from "@/components/qr-baixa-servico-card"

export function OrdensPage() {
  const { ordensServico, equipamentos, tecnicos, planos, addOrdemServico, updateOrdemServico } = useApp()
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState({
    equipamentoId: "",
    tecnicoId: "",
    tipo: "" as OrdemServico["tipo"],
    descricao: "",
    observacoes: "",
  })

  function handleSubmit() {
    if (!form.equipamentoId || !form.tecnicoId || !form.tipo) return
    const newOs: OrdemServico = {
      id: `os-${Date.now()}`,
      planoId: "",
      equipamentoId: form.equipamentoId,
      tecnicoId: form.tecnicoId,
      tipo: form.tipo,
      dataAbertura: new Date().toISOString().split("T")[0],
      dataConclusao: "",
      status: "Aberta",
      descricao: form.descricao,
      observacoes: form.observacoes,
    }
    addOrdemServico(newOs)
    setForm({ equipamentoId: "", tecnicoId: "", tipo: "" as OrdemServico["tipo"], descricao: "", observacoes: "" })
    setOpen(false)
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "Concluida": return <CheckCircle2 className="size-4 text-chart-2" />
      case "Em Andamento": return <Clock className="size-4 text-chart-3" />
      case "Aberta": return <AlertCircle className="size-4 text-primary" />
      case "Cancelada": return <XCircle className="size-4 text-muted-foreground" />
      default: return null
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "Concluida": return "default"
      case "Em Andamento": return "secondary"
      case "Aberta": return "outline"
      case "Cancelada": return "destructive"
      default: return "outline"
    }
  }

  function handleBaixaDireta(os: OrdemServico) {
    if (os.status === "Concluida" || os.status === "Cancelada") return

    const observacaoBaixa = `Baixa manual na tela de ordens em ${new Date().toLocaleString("pt-BR")}`
    const observacoes = os.observacoes ? `${os.observacoes}\n${observacaoBaixa}` : observacaoBaixa

    updateOrdemServico(os.id, {
      status: "Concluida",
      dataConclusao: new Date().toISOString().split("T")[0],
      observacoes,
    })
  }

  const ordensValidas = ordensServico.filter((os) => {
    const equipamentoExiste = equipamentos.some((eq) => eq.id === os.equipamentoId)
    const planoExiste = !os.planoId || planos.some((plano) => plano.id === os.planoId)
    return equipamentoExiste && planoExiste
  })

  const abertas = ordensValidas.filter(o => o.status === "Aberta").length
  const emAndamento = ordensValidas.filter(o => o.status === "Em Andamento").length
  const concluidas = ordensValidas.filter(o => o.status === "Concluida").length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ordens de Servico</h1>
          <p className="text-muted-foreground">Gerencie as ordens de servico preventivas e corretivas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Nova Ordem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Ordem de Servico</DialogTitle>
              <DialogDescription>Abra uma nova ordem de servico</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Equipamento</Label>
                  <Select value={form.equipamentoId} onValueChange={(v) => setForm({ ...form, equipamentoId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {equipamentos.map(eq => (
                        <SelectItem key={eq.id} value={eq.id}>{eq.tag} - {eq.marca}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tecnico</Label>
                  <Select value={form.tecnicoId} onValueChange={(v) => setForm({ ...form, tecnicoId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {tecnicos.map(tec => (
                        <SelectItem key={tec.id} value={tec.id}>{tec.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as OrdemServico["tipo"] })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventiva">Preventiva</SelectItem>
                    <SelectItem value="Corretiva">Corretiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descricao</Label>
                <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descricao da ordem de servico" />
              </div>
              <div>
                <Label>Observacoes</Label>
                <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Observacoes adicionais" rows={2} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSubmit}>Abrir OS</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <QrBaixaServicoCard />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="size-5 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{abertas}</p>
              <p className="text-xs text-muted-foreground">Abertas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="size-5 text-chart-3" />
            <div>
              <p className="text-2xl font-bold text-foreground">{emAndamento}</p>
              <p className="text-xs text-muted-foreground">Em Andamento</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="size-5 text-chart-2" />
            <div>
              <p className="text-2xl font-bold text-foreground">{concluidas}</p>
              <p className="text-xs text-muted-foreground">Concluidas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>OS</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Tecnico</TableHead>
                  <TableHead>Descricao</TableHead>
                  <TableHead>Abertura</TableHead>
                  <TableHead>Conclusao</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordensValidas.map((os) => {
                  const equip = equipamentos.find(e => e.id === os.equipamentoId)
                  const tecnico = tecnicos.find(t => t.id === os.tecnicoId)
                  return (
                    <TableRow key={os.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(os.status)}
                          <Badge variant={getStatusBadge(os.status) as "default" | "secondary" | "outline" | "destructive"} className="text-[10px]">
                            {os.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium">{os.id.toUpperCase()}</TableCell>
                      <TableCell>
                        <Badge variant={os.tipo === "Preventiva" ? "secondary" : "destructive"} className="text-[10px]">
                          {os.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">{equip?.tag}</div>
                        <div className="text-xs text-muted-foreground">{equip?.marca}</div>
                      </TableCell>
                      <TableCell className="text-sm">{tecnico?.nome.split(' ').slice(0, 2).join(' ')}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{os.descricao}</TableCell>
                      <TableCell className="text-sm font-mono">{os.dataAbertura}</TableCell>
                      <TableCell className="text-sm font-mono">{os.dataConclusao || "-"}</TableCell>
                      <TableCell className="text-right">
                        {os.status === "Concluida" || os.status === "Cancelada" ? (
                          <span className="text-xs text-muted-foreground">Sem acao</span>
                        ) : (
                          <Button size="sm" onClick={() => handleBaixaDireta(os)}>
                            Dar baixa
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {ordensValidas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Wrench className="size-8 mb-2" />
              <p className="text-sm">Nenhuma ordem de servico registrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

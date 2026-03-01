"use client"

import { useState } from "react"
import { ClipboardList, Plus, Trash2, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
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
import type { PlanoManutencao } from "@/lib/store"

export function PlanosPage() {
  const { planos, edificacoes, equipamentos, tecnicos, addPlano, removePlano } = useApp()
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState({
    edificacaoId: "",
    equipamentoId: "",
    tecnicoId: "",
    atividade: "",
    periodicidade: "" as PlanoManutencao["periodicidade"],
    proximaExecucao: "",
    observacoes: "",
  })

  const filteredEquips = form.edificacaoId 
    ? equipamentos.filter(e => e.edificacaoId === form.edificacaoId) 
    : equipamentos

  function handleSubmit() {
    if (!form.equipamentoId || !form.tecnicoId || !form.atividade || !form.periodicidade) return
    const newPlano: PlanoManutencao = {
      id: `pm-${Date.now()}`,
      edificacaoId: form.edificacaoId,
      equipamentoId: form.equipamentoId,
      tecnicoId: form.tecnicoId,
      atividade: form.atividade,
      periodicidade: form.periodicidade,
      ultimaExecucao: "",
      proximaExecucao: form.proximaExecucao,
      status: "Pendente",
      observacoes: form.observacoes,
    }
    addPlano(newPlano)
    setForm({ edificacaoId: "", equipamentoId: "", tecnicoId: "", atividade: "", periodicidade: "" as PlanoManutencao["periodicidade"], proximaExecucao: "", observacoes: "" })
    setOpen(false)
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "Em Dia": return <CheckCircle2 className="size-4 text-chart-2" />
      case "Atrasado": return <AlertTriangle className="size-4 text-destructive" />
      case "Pendente": return <Clock className="size-4 text-chart-3" />
      default: return <CheckCircle2 className="size-4 text-muted-foreground" />
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "Em Dia": return "default"
      case "Atrasado": return "destructive"
      case "Pendente": return "secondary"
      default: return "outline"
    }
  }

  const atrasados = planos.filter(p => p.status === "Atrasado").length
  const emDia = planos.filter(p => p.status === "Em Dia").length
  const pendentes = planos.filter(p => p.status === "Pendente").length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Planos de Manutencao</h1>
          <p className="text-muted-foreground">Gerencie os planos de manutencao preventiva e corretiva</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Plano de Manutencao</DialogTitle>
              <DialogDescription>Defina um novo plano de manutencao para um equipamento</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Edificacao (opcional filtro)</Label>
                <Select value={form.edificacaoId} onValueChange={(v) => setForm({ ...form, edificacaoId: v, equipamentoId: "" })}>
                  <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    {edificacoes.map(ed => (
                      <SelectItem key={ed.id} value={ed.id}>{ed.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Equipamento</Label>
                  <Select value={form.equipamentoId} onValueChange={(v) => setForm({ ...form, equipamentoId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {filteredEquips.map(eq => (
                        <SelectItem key={eq.id} value={eq.id}>{eq.tag} - {eq.marca}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tecnico Responsavel</Label>
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
                <Label>Atividade</Label>
                <Input value={form.atividade} onChange={(e) => setForm({ ...form, atividade: e.target.value })} placeholder="Descricao da atividade de manutencao" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Periodicidade</Label>
                  <Select value={form.periodicidade} onValueChange={(v) => setForm({ ...form, periodicidade: v as PlanoManutencao["periodicidade"] })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mensal">Mensal</SelectItem>
                      <SelectItem value="Trimestral">Trimestral</SelectItem>
                      <SelectItem value="Semestral">Semestral</SelectItem>
                      <SelectItem value="Anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Proxima Execucao</Label>
                  <Input type="date" value={form.proximaExecucao} onChange={(e) => setForm({ ...form, proximaExecucao: e.target.value })} />
                </div>
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
              <Button onClick={handleSubmit}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-chart-2/30 bg-chart-2/5">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="size-5 text-chart-2" />
            <div>
              <p className="text-2xl font-bold text-foreground">{emDia}</p>
              <p className="text-xs text-muted-foreground">Em Dia</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="size-5 text-destructive" />
            <div>
              <p className="text-2xl font-bold text-foreground">{atrasados}</p>
              <p className="text-xs text-muted-foreground">Atrasados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-chart-3/30 bg-chart-3/5">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="size-5 text-chart-3" />
            <div>
              <p className="text-2xl font-bold text-foreground">{pendentes}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
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
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Periodicidade</TableHead>
                  <TableHead>Tecnico</TableHead>
                  <TableHead>Proxima Execucao</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planos.map((plano) => {
                  const equip = equipamentos.find(e => e.id === plano.equipamentoId)
                  const tecnico = tecnicos.find(t => t.id === plano.tecnicoId)
                  return (
                    <TableRow key={plano.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(plano.status)}
                          <Badge variant={getStatusBadge(plano.status) as "default" | "destructive" | "secondary" | "outline"} className="text-[10px]">
                            {plano.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs font-medium">{equip?.tag}</div>
                        <div className="text-xs text-muted-foreground">{equip?.marca} {equip?.modelo}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-[200px] truncate">{plano.atividade}</div>
                        {plano.observacoes && (
                          <div className="text-xs text-muted-foreground max-w-[200px] truncate">{plano.observacoes}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{plano.periodicidade}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{tecnico?.nome.split(' ').slice(0, 2).join(' ')}</TableCell>
                      <TableCell className="text-sm font-mono">{plano.proximaExecucao}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => removePlano(plano.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {planos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ClipboardList className="size-8 mb-2" />
              <p className="text-sm">Nenhum plano de manutencao cadastrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

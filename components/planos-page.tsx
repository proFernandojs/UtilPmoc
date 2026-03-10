"use client"

import { useState } from "react"
import { ClipboardList, Plus, Trash2, AlertTriangle, CheckCircle2, Clock, Pencil } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

type BulkPlanoItem = {
  equipamentoId: string
  selected: boolean
  periodicidade: PlanoManutencao["periodicidade"]
  proximaExecucao: string
}

export function PlanosPage() {
  const { planos, edificacoes, equipamentos, tecnicos, addPlano, updatePlano, removePlano } = useApp()
  const [open, setOpen] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openBulk, setOpenBulk] = useState(false)
  const [editingPlanoId, setEditingPlanoId] = useState<string | null>(null)
  const [singleError, setSingleError] = useState("")
  const [editError, setEditError] = useState("")
  const [bulkInfo, setBulkInfo] = useState("")

  const [form, setForm] = useState({
    edificacaoId: "",
    equipamentoId: "",
    tecnicoId: "",
    atividade: "",
    periodicidade: "" as PlanoManutencao["periodicidade"],
    proximaExecucao: "",
    observacoes: "",
  })

  const [editForm, setEditForm] = useState({
    edificacaoId: "",
    equipamentoId: "",
    tecnicoId: "",
    atividade: "",
    periodicidade: "" as PlanoManutencao["periodicidade"],
    proximaExecucao: "",
    observacoes: "",
  })

  const [bulkForm, setBulkForm] = useState({
    tecnicoId: "",
    atividade: "",
    observacoes: "",
    periodicidadePadrao: "Mensal" as PlanoManutencao["periodicidade"],
    proximaExecucaoPadrao: "",
  })
  const [bulkItems, setBulkItems] = useState<BulkPlanoItem[]>([])

  const filteredEquips = form.edificacaoId 
    ? equipamentos.filter(e => e.edificacaoId === form.edificacaoId) 
    : equipamentos

  const filteredEditEquips = editForm.edificacaoId
    ? equipamentos.filter(e => e.edificacaoId === editForm.edificacaoId)
    : equipamentos

  const allBulkSelected = bulkItems.length > 0 && bulkItems.every((item) => item.selected)

  function normalizeProximaExecucao(input: string) {
    if (/^\d{4}-\d{2}$/.test(input)) return `${input}-01`
    return input
  }

  function getMonthKey(data: string) {
    const normalizada = normalizeProximaExecucao(data)
    return normalizada ? normalizada.slice(0, 7) : ""
  }

  function hasDuplicatePlano(params: {
    equipamentoId: string
    periodicidade: PlanoManutencao["periodicidade"]
    proximaExecucao: string
    ignorePlanoId?: string
  }) {
    const targetMonth = getMonthKey(params.proximaExecucao)
    return planos.some((plano) => {
      if (params.ignorePlanoId && plano.id === params.ignorePlanoId) return false
      return (
        plano.equipamentoId === params.equipamentoId
        && plano.periodicidade === params.periodicidade
        && getMonthKey(plano.proximaExecucao) === targetMonth
      )
    })
  }

  function getStatusByProximaExecucao(proximaExecucao: string): PlanoManutencao["status"] {
    const normalizada = normalizeProximaExecucao(proximaExecucao)
    if (!normalizada) return "Pendente"
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataExecucao = new Date(`${normalizada}T00:00:00`)
    if (Number.isNaN(dataExecucao.getTime())) return "Pendente"
    return dataExecucao < hoje ? "Atrasado" : "Em Dia"
  }

  function handleOpenBulk() {
    setBulkInfo("")
    setBulkForm({
      tecnicoId: "",
      atividade: "",
      observacoes: "",
      periodicidadePadrao: "Mensal",
      proximaExecucaoPadrao: "",
    })
    setBulkItems(
      equipamentos.map((equipamento) => ({
        equipamentoId: equipamento.id,
        selected: true,
        periodicidade: "Mensal",
        proximaExecucao: "",
      }))
    )
    setOpenBulk(true)
  }

  function updateBulkItem(equipamentoId: string, updates: Partial<BulkPlanoItem>) {
    setBulkItems((prev) => prev.map((item) => (item.equipamentoId === equipamentoId ? { ...item, ...updates } : item)))
  }

  function applyBulkDefaultsToSelected() {
    setBulkItems((prev) =>
      prev.map((item) =>
        item.selected
          ? {
              ...item,
              periodicidade: bulkForm.periodicidadePadrao,
              proximaExecucao: bulkForm.proximaExecucaoPadrao || item.proximaExecucao,
            }
          : item
      )
    )
  }

  function toggleBulkSelectAll(checked: boolean) {
    setBulkItems((prev) => prev.map((item) => ({ ...item, selected: checked })))
  }

  function handleBulkSubmit() {
    if (!bulkForm.tecnicoId || !bulkForm.atividade) return

    const selecionados = bulkItems.filter((item) => item.selected)
    if (selecionados.length === 0) return

    let addedCount = 0
    let skippedCount = 0

    selecionados.forEach((item, index) => {
      const equipamento = equipamentos.find((eq) => eq.id === item.equipamentoId)
      if (!equipamento) return
      const proximaExecucao = normalizeProximaExecucao(item.proximaExecucao)

      const duplicated = hasDuplicatePlano({
        equipamentoId: equipamento.id,
        periodicidade: item.periodicidade,
        proximaExecucao,
      })
      if (duplicated) {
        skippedCount += 1
        return
      }

      addPlano({
        id: `pm-${Date.now()}-${index}`,
        edificacaoId: equipamento.edificacaoId,
        equipamentoId: equipamento.id,
        tecnicoId: bulkForm.tecnicoId,
        atividade: bulkForm.atividade,
        periodicidade: item.periodicidade,
        ultimaExecucao: "",
        proximaExecucao,
        status: getStatusByProximaExecucao(proximaExecucao),
        observacoes: bulkForm.observacoes,
      })
      addedCount += 1
    })

    if (addedCount === 0) {
      setBulkInfo("Nenhum plano criado: todos ja existem para a combinacao maquina + periodicidade + mes.")
      return
    }

    if (skippedCount > 0) {
      setBulkInfo(`${addedCount} plano(s) criado(s). ${skippedCount} duplicado(s) foram ignorados.`)
    } else {
      setBulkInfo(`${addedCount} plano(s) criado(s) com sucesso.`)
    }

    setOpenBulk(false)
  }

  function handleSubmit() {
    if (!form.equipamentoId || !form.tecnicoId || !form.atividade || !form.periodicidade) return

    const proximaExecucaoNormalizada = normalizeProximaExecucao(form.proximaExecucao)
    const duplicated = hasDuplicatePlano({
      equipamentoId: form.equipamentoId,
      periodicidade: form.periodicidade,
      proximaExecucao: proximaExecucaoNormalizada,
    })
    if (duplicated) {
      setSingleError("Ja existe plano para esta maquina, periodicidade e mes.")
      return
    }

    const newPlano: PlanoManutencao = {
      id: `pm-${Date.now()}`,
      edificacaoId: form.edificacaoId,
      equipamentoId: form.equipamentoId,
      tecnicoId: form.tecnicoId,
      atividade: form.atividade,
      periodicidade: form.periodicidade,
      ultimaExecucao: "",
      proximaExecucao: proximaExecucaoNormalizada,
      status: getStatusByProximaExecucao(proximaExecucaoNormalizada),
      observacoes: form.observacoes,
    }
    addPlano(newPlano)
    setSingleError("")
    setForm({ edificacaoId: "", equipamentoId: "", tecnicoId: "", atividade: "", periodicidade: "" as PlanoManutencao["periodicidade"], proximaExecucao: "", observacoes: "" })
    setOpen(false)
  }

  function handleOpenEdit(plano: PlanoManutencao) {
    const equipamento = equipamentos.find((eq) => eq.id === plano.equipamentoId)
    setEditingPlanoId(plano.id)
    setEditForm({
      edificacaoId: equipamento?.edificacaoId ?? plano.edificacaoId,
      equipamentoId: plano.equipamentoId,
      tecnicoId: plano.tecnicoId,
      atividade: plano.atividade,
      periodicidade: plano.periodicidade,
      proximaExecucao: plano.proximaExecucao,
      observacoes: plano.observacoes,
    })
    setEditError("")
    setOpenEdit(true)
  }

  function handleEditSubmit() {
    if (!editingPlanoId || !editForm.equipamentoId || !editForm.tecnicoId || !editForm.atividade || !editForm.periodicidade) return

    const proximaExecucaoNormalizada = normalizeProximaExecucao(editForm.proximaExecucao)
    const duplicated = hasDuplicatePlano({
      equipamentoId: editForm.equipamentoId,
      periodicidade: editForm.periodicidade,
      proximaExecucao: proximaExecucaoNormalizada,
      ignorePlanoId: editingPlanoId,
    })
    if (duplicated) {
      setEditError("Ja existe plano para esta maquina, periodicidade e mes.")
      return
    }

    updatePlano(editingPlanoId, {
      edificacaoId: editForm.edificacaoId,
      equipamentoId: editForm.equipamentoId,
      tecnicoId: editForm.tecnicoId,
      atividade: editForm.atividade,
      periodicidade: editForm.periodicidade,
      proximaExecucao: proximaExecucaoNormalizada,
      status: getStatusByProximaExecucao(proximaExecucaoNormalizada),
      observacoes: editForm.observacoes,
    })
    setEditError("")
    setOpenEdit(false)
    setEditingPlanoId(null)
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleOpenBulk}>Reutilizar Maquinas</Button>
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
                {singleError && <p className="text-xs text-destructive">{singleError}</p>}
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
      </div>

      <Dialog open={openBulk} onOpenChange={setOpenBulk}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Plano em Lote por Maquina</DialogTitle>
            <DialogDescription>
              Reutilize todas as maquinas cadastradas e escolha quais terao manutencao mensal, trimestral, semestral ou anual.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label>Tecnico Responsavel</Label>
                <Select value={bulkForm.tecnicoId} onValueChange={(v) => setBulkForm({ ...bulkForm, tecnicoId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {tecnicos.map(tec => (
                      <SelectItem key={tec.id} value={tec.id}>{tec.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Periodicidade Padrao</Label>
                <Select
                  value={bulkForm.periodicidadePadrao}
                  onValueChange={(v) => setBulkForm({ ...bulkForm, periodicidadePadrao: v as PlanoManutencao["periodicidade"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                    <SelectItem value="Trimestral">Trimestral</SelectItem>
                    <SelectItem value="Semestral">Semestral</SelectItem>
                    <SelectItem value="Anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mes Padrao (opcional)</Label>
                <Input
                  type="month"
                  value={bulkForm.proximaExecucaoPadrao}
                  onChange={(e) => setBulkForm({ ...bulkForm, proximaExecucaoPadrao: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Atividade</Label>
                <Input
                  value={bulkForm.atividade}
                  onChange={(e) => setBulkForm({ ...bulkForm, atividade: e.target.value })}
                  placeholder="Ex.: Limpeza de filtros e verificacao geral"
                />
              </div>
              <div>
                <Label>Observacoes</Label>
                <Input
                  value={bulkForm.observacoes}
                  onChange={(e) => setBulkForm({ ...bulkForm, observacoes: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-2">
                <Checkbox checked={allBulkSelected} onCheckedChange={(checked) => toggleBulkSelectAll(checked === true)} />
                <span className="text-sm">Selecionar todas as maquinas</span>
              </div>
              <Button variant="secondary" size="sm" onClick={applyBulkDefaultsToSelected}>
                Aplicar padrao nas selecionadas
              </Button>
            </div>

            <div className="max-h-[340px] overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70px]">Usar</TableHead>
                    <TableHead>Maquina</TableHead>
                    <TableHead>Periodicidade</TableHead>
                    <TableHead>Mes da Proxima</TableHead>
                    <TableHead className="w-[120px]">Planos Atuais</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkItems.map((item) => {
                    const equipamento = equipamentos.find((eq) => eq.id === item.equipamentoId)
                    if (!equipamento) return null
                    const planosDoEquipamento = planos.filter((plano) => plano.equipamentoId === equipamento.id).length

                    return (
                      <TableRow key={item.equipamentoId}>
                        <TableCell>
                          <Checkbox
                            checked={item.selected}
                            onCheckedChange={(checked) => updateBulkItem(item.equipamentoId, { selected: checked === true })}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs font-medium">{equipamento.tag}</div>
                          <div className="text-xs text-muted-foreground">{equipamento.marca} {equipamento.modelo}</div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.periodicidade}
                            onValueChange={(v) => updateBulkItem(item.equipamentoId, { periodicidade: v as PlanoManutencao["periodicidade"] })}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mensal">Mensal</SelectItem>
                              <SelectItem value="Trimestral">Trimestral</SelectItem>
                              <SelectItem value="Semestral">Semestral</SelectItem>
                              <SelectItem value="Anual">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="month"
                            value={item.proximaExecucao}
                            onChange={(e) => updateBulkItem(item.equipamentoId, { proximaExecucao: e.target.value })}
                            className="w-[170px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{planosDoEquipamento}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            {bulkInfo && <p className="text-xs text-muted-foreground">{bulkInfo}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleBulkSubmit}>Criar Planos Selecionados</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Editar Plano de Manutencao</DialogTitle>
                <DialogDescription>Atualize os dados do plano selecionado</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Edificacao (opcional filtro)</Label>
                  <Select value={editForm.edificacaoId} onValueChange={(v) => setEditForm({ ...editForm, edificacaoId: v, equipamentoId: "" })}>
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
                    <Select value={editForm.equipamentoId} onValueChange={(v) => setEditForm({ ...editForm, equipamentoId: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {filteredEditEquips.map(eq => (
                          <SelectItem key={eq.id} value={eq.id}>{eq.tag} - {eq.marca}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tecnico Responsavel</Label>
                    <Select value={editForm.tecnicoId} onValueChange={(v) => setEditForm({ ...editForm, tecnicoId: v })}>
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
                  <Input value={editForm.atividade} onChange={(e) => setEditForm({ ...editForm, atividade: e.target.value })} placeholder="Descricao da atividade de manutencao" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Periodicidade</Label>
                    <Select value={editForm.periodicidade} onValueChange={(v) => setEditForm({ ...editForm, periodicidade: v as PlanoManutencao["periodicidade"] })}>
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
                    <Input type="date" value={editForm.proximaExecucao} onChange={(e) => setEditForm({ ...editForm, proximaExecucao: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Observacoes</Label>
                  <Textarea value={editForm.observacoes} onChange={(e) => setEditForm({ ...editForm, observacoes: e.target.value })} placeholder="Observacoes adicionais" rows={2} />
                </div>
                {editError && <p className="text-xs text-destructive">{editError}</p>}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleEditSubmit}>Salvar Alteracoes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  <TableHead className="w-[90px]"></TableHead>
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
                          className="size-7"
                          onClick={() => handleOpenEdit(plano)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
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

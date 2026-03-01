"use client"

import { useState } from "react"
import { AirVent, Plus, Trash2, Search, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import type { Equipamento } from "@/lib/store"

const tiposEquipamento: Equipamento["tipo"][] = [
  "Split", "Split Hi-Wall", "Split Piso-Teto", "Split Cassete", "Split Duto",
  "VRF", "Self-Contained", "Chiller", "Fancoil", "ACJ", "Outro"
]

export function EquipamentosPage() {
  const { equipamentos, edificacoes, ambientes, addEquipamento, removeEquipamento } = useApp()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filterEdificacao, setFilterEdificacao] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const [form, setForm] = useState({
    edificacaoId: "",
    ambienteId: "",
    tag: "",
    tipo: "" as Equipamento["tipo"],
    marca: "",
    modelo: "",
    capacidadeBtu: "",
    potenciaKw: "",
    fluido: "",
    dataInstalacao: "",
    garantia: "",
    localizacao: "",
  })

  const filteredEquipamentos = equipamentos.filter(eq => {
    const matchSearch = search === "" || 
      eq.tag.toLowerCase().includes(search.toLowerCase()) ||
      eq.marca.toLowerCase().includes(search.toLowerCase()) ||
      eq.modelo.toLowerCase().includes(search.toLowerCase())
    const matchEdificacao = filterEdificacao === "all" || eq.edificacaoId === filterEdificacao
    const matchStatus = filterStatus === "all" || eq.status === filterStatus
    return matchSearch && matchEdificacao && matchStatus
  })

  const filteredAmbientes = form.edificacaoId
    ? ambientes.filter(a => a.edificacaoId === form.edificacaoId)
    : []

  function handleSubmit() {
    if (!form.tag || !form.edificacaoId || !form.tipo) return
    const newEquip: Equipamento = {
      id: `eq-${Date.now()}`,
      edificacaoId: form.edificacaoId,
      ambienteId: form.ambienteId,
      tag: form.tag,
      tipo: form.tipo,
      marca: form.marca,
      modelo: form.modelo,
      capacidadeBtu: Number(form.capacidadeBtu) || 0,
      potenciaKw: Number(form.potenciaKw) || 0,
      fluido: form.fluido,
      dataInstalacao: form.dataInstalacao,
      garantia: form.garantia,
      status: "Ativo",
      localizacao: form.localizacao,
    }
    addEquipamento(newEquip)
    setForm({ edificacaoId: "", ambienteId: "", tag: "", tipo: "" as Equipamento["tipo"], marca: "", modelo: "", capacidadeBtu: "", potenciaKw: "", fluido: "", dataInstalacao: "", garantia: "", localizacao: "" })
    setOpen(false)
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "Ativo": return "default"
      case "Inativo": return "secondary"
      case "Manutencao": return "destructive"
      default: return "outline"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Equipamentos</h1>
          <p className="text-muted-foreground">Inventario de equipamentos de climatizacao</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Novo Equipamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Equipamento</DialogTitle>
              <DialogDescription>Cadastre um novo equipamento de climatizacao</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Edificacao</Label>
                  <Select value={form.edificacaoId} onValueChange={(v) => setForm({ ...form, edificacaoId: v, ambienteId: "" })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {edificacoes.map(ed => (
                        <SelectItem key={ed.id} value={ed.id}>{ed.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ambiente</Label>
                  <Select value={form.ambienteId} onValueChange={(v) => setForm({ ...form, ambienteId: v })} disabled={!form.edificacaoId}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {filteredAmbientes.map(amb => (
                        <SelectItem key={amb.id} value={amb.id}>{amb.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>TAG</Label>
                  <Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="AC-REC-001" />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as Equipamento["tipo"] })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {tiposEquipamento.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Marca</Label>
                  <Input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} placeholder="Daikin" />
                </div>
                <div>
                  <Label>Modelo</Label>
                  <Input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} placeholder="FTX60" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Capacidade (BTU)</Label>
                  <Input type="number" value={form.capacidadeBtu} onChange={(e) => setForm({ ...form, capacidadeBtu: e.target.value })} placeholder="60000" />
                </div>
                <div>
                  <Label>Potencia (kW)</Label>
                  <Input type="number" value={form.potenciaKw} onChange={(e) => setForm({ ...form, potenciaKw: e.target.value })} placeholder="5.2" />
                </div>
                <div>
                  <Label>Fluido</Label>
                  <Input value={form.fluido} onChange={(e) => setForm({ ...form, fluido: e.target.value })} placeholder="R-410A" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data de Instalacao</Label>
                  <Input type="date" value={form.dataInstalacao} onChange={(e) => setForm({ ...form, dataInstalacao: e.target.value })} />
                </div>
                <div>
                  <Label>Garantia ate</Label>
                  <Input type="date" value={form.garantia} onChange={(e) => setForm({ ...form, garantia: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Localizacao</Label>
                <Input value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} placeholder="Recepcao - Parede Leste" />
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

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por TAG, marca ou modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterEdificacao} onValueChange={setFilterEdificacao}>
          <SelectTrigger className="w-[200px]">
            <Filter className="size-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Edificacao" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Edificacoes</SelectItem>
            {edificacoes.map(ed => (
              <SelectItem key={ed.id} value={ed.id}>{ed.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
            <SelectItem value="Manutencao">Manutencao</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TAG</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Marca / Modelo</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Fluido</TableHead>
                  <TableHead>Edificacao</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipamentos.map((eq) => {
                  const ed = edificacoes.find(e => e.id === eq.edificacaoId)
                  return (
                    <TableRow key={eq.id}>
                      <TableCell className="font-medium font-mono text-xs">{eq.tag}</TableCell>
                      <TableCell className="text-sm">{eq.tipo}</TableCell>
                      <TableCell>
                        <div className="text-sm">{eq.marca}</div>
                        <div className="text-xs text-muted-foreground">{eq.modelo}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{(eq.capacidadeBtu / 1000).toFixed(0)}k BTU</div>
                        <div className="text-xs text-muted-foreground">{eq.potenciaKw} kW</div>
                      </TableCell>
                      <TableCell className="text-sm">{eq.fluido}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ed?.nome || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(eq.status) as "default" | "secondary" | "destructive" | "outline"}>{eq.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => removeEquipamento(eq.id)}
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
          {filteredEquipamentos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AirVent className="size-8 mb-2" />
              <p className="text-sm">Nenhum equipamento encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

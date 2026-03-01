"use client"

import { useState } from "react"
import { Users, Plus, Trash2, Phone, Mail, Briefcase } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { useApp } from "@/lib/app-context"
import type { Tecnico } from "@/lib/store"

export function TecnicosPage() {
  const { tecnicos, planos, addTecnico, removeTecnico } = useApp()
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState({
    nome: "",
    crea: "",
    especialidade: "",
    telefone: "",
    email: "",
    empresa: "",
    art: "",
  })

  function handleSubmit() {
    if (!form.nome || !form.crea) return
    const newTecnico: Tecnico = {
      id: `tec-${Date.now()}`,
      ...form,
    }
    addTecnico(newTecnico)
    setForm({ nome: "", crea: "", especialidade: "", telefone: "", email: "", empresa: "", art: "" })
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tecnicos Responsaveis</h1>
          <p className="text-muted-foreground">Equipe tecnica responsavel pela manutencao</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Novo Tecnico
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Tecnico</DialogTitle>
              <DialogDescription>Cadastre um tecnico responsavel</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Nome Completo</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Eng. Ricardo Mendes" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CREA</Label>
                  <Input value={form.crea} onChange={(e) => setForm({ ...form, crea: e.target.value })} placeholder="SP-123456/D" />
                </div>
                <div>
                  <Label>Especialidade</Label>
                  <Input value={form.especialidade} onChange={(e) => setForm({ ...form, especialidade: e.target.value })} placeholder="Engenharia Mecanica" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Telefone</Label>
                  <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99876-5432" />
                </div>
                <div>
                  <Label>E-mail</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@empresa.com.br" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Empresa</Label>
                  <Input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} placeholder="Clima Engenharia Ltda" />
                </div>
                <div>
                  <Label>ART</Label>
                  <Input value={form.art} onChange={(e) => setForm({ ...form, art: e.target.value })} placeholder="ART-2024-001234" />
                </div>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tecnicos.map((tec) => {
          const planosCount = planos.filter(p => p.tecnicoId === tec.id).length
          const planosAtrasados = planos.filter(p => p.tecnicoId === tec.id && p.status === "Atrasado").length
          return (
            <Card key={tec.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {tec.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{tec.nome}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{tec.especialidade}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => removeTecnico(tec.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Briefcase className="size-3" />
                  <span>{tec.empresa}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="size-3" />
                  <span>{tec.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="size-3" />
                  <span>{tec.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 pt-2.5 border-t border-border">
                  <Badge variant="outline" className="text-[10px] font-mono">{tec.crea}</Badge>
                  <Badge variant="outline" className="text-[10px] font-mono">{tec.art}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{planosCount} planos</Badge>
                  {planosAtrasados > 0 && (
                    <Badge variant="destructive" className="text-[10px]">{planosAtrasados} atrasados</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

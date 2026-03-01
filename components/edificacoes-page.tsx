"use client"

import { useState } from "react"
import { Building2, Plus, Trash2, MapPin, Phone, Mail } from "lucide-react"
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
import type { Edificacao } from "@/lib/store"

export function EdificacoesPage() {
  const { edificacoes, ambientes, equipamentos, addEdificacao, removeEdificacao } = useApp()
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState({
    nome: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    cnpj: "",
    responsavel: "",
    telefone: "",
    email: "",
  })

  function handleSubmit() {
    if (!form.nome || !form.endereco) return
    const newEdificacao: Edificacao = {
      id: `ed-${Date.now()}`,
      ...form,
      createdAt: new Date().toISOString().split("T")[0],
    }
    addEdificacao(newEdificacao)
    setForm({ nome: "", endereco: "", cidade: "", estado: "", cep: "", cnpj: "", responsavel: "", telefone: "", email: "" })
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edificacoes</h1>
          <p className="text-muted-foreground">Gerencie as edificacoes e ambientes climatizados</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Nova Edificacao
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Edificacao</DialogTitle>
              <DialogDescription>Cadastre uma nova edificacao no sistema</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="nome">Nome da Edificacao</Label>
                  <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Edificio Corporativo" />
                </div>
                <div>
                  <Label htmlFor="endereco">Endereco</Label>
                  <Input id="endereco" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Ex: Av. Paulista, 1000" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Sao Paulo" />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input id="estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} placeholder="SP" />
                </div>
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} placeholder="01310-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="12.345.678/0001-90" />
                </div>
                <div>
                  <Label htmlFor="responsavel">Responsavel</Label>
                  <Input id="responsavel" value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} placeholder="Nome do responsavel" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 3456-7890" />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@empresa.com.br" />
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
        {edificacoes.map((ed) => {
          const ambCount = ambientes.filter(a => a.edificacaoId === ed.id).length
          const eqCount = equipamentos.filter(e => e.edificacaoId === ed.id).length
          const totalBtu = equipamentos.filter(e => e.edificacaoId === ed.id).reduce((acc, eq) => acc + eq.capacidadeBtu, 0)

          return (
            <Card key={ed.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                      <Building2 className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold leading-tight">{ed.nome}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{ed.cnpj}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => removeEdificacao(ed.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  <span>{ed.endereco}, {ed.cidade}/{ed.estado}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="size-3" />
                  <span>{ed.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="size-3" />
                  <span>{ed.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px]">{ambCount} ambientes</Badge>
                  <Badge variant="secondary" className="text-[10px]">{eqCount} equipamentos</Badge>
                  <Badge variant="outline" className="text-[10px]">{(totalBtu / 1000).toFixed(0)}k BTU</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

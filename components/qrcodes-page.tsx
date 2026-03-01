"use client"

import { useState, useRef, useCallback, useMemo } from "react"
import { QrCode, Printer, Check, Download, Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from "@/lib/app-context"
import { QrCodeLabel } from "@/components/qr-code-label"
import type { Equipamento } from "@/lib/store"

type LabelSize = "micro" | "mini" | "small" | "medium" | "large"

const sizeLabels: Record<LabelSize, string> = {
  micro: "Micro (20x60 mm)",
  mini: "Mini (30x70 mm)",
  small: "Pequena (60x40 mm)",
  medium: "Media (90x50 mm)",
  large: "Grande (120x70 mm)",
}

const sizeInMillimeters: Record<LabelSize, { width: number; height: number }> = {
  micro: { width: 20, height: 60 },
  mini: { width: 30, height: 70 },
  small: { width: 60, height: 40 },
  medium: { width: 90, height: 50 },
  large: { width: 120, height: 70 },
}

const sizeDescriptions: Record<LabelSize, string> = {
  micro: "Ultra compacta para espacos reduzidos",
  mini: "Etiqueta vertical estreita para colar no equipamento",
  small: "Ideal para equipamentos pequenos",
  medium: "Tamanho padrao recomendado",
  large: "Para uso em paineis e equipamentos grandes",
}

const btuRanges = [
  { label: "Todos", value: "all" },
  { label: "Ate 9.000 BTU", value: "0-9000" },
  { label: "9.000 - 12.000 BTU", value: "9000-12000" },
  { label: "12.000 - 18.000 BTU", value: "12000-18000" },
  { label: "18.000 - 24.000 BTU", value: "18000-24000" },
  { label: "24.000 - 36.000 BTU", value: "24000-36000" },
  { label: "36.000 - 48.000 BTU", value: "36000-48000" },
  { label: "48.000 - 60.000 BTU", value: "48000-60000" },
  { label: "60.000 - 120.000 BTU", value: "60000-120000" },
  { label: "Acima de 120.000 BTU", value: "120000-999999999" },
]

interface Filters {
  search: string
  edificacao: string
  tipo: string
  marca: string
  modelo: string
  btuRange: string
  fluido: string
  status: string
  ambiente: string
}

const defaultFilters: Filters = {
  search: "",
  edificacao: "all",
  tipo: "all",
  marca: "all",
  modelo: "all",
  btuRange: "all",
  fluido: "all",
  status: "all",
  ambiente: "all",
}

export function QrCodesPage() {
  const { equipamentos, edificacoes, ambientes } = useApp()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [labelSize, setLabelSize] = useState<LabelSize>("medium")
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  // Extract unique values for dropdowns
  const uniqueValues = useMemo(() => {
    const tipos = [...new Set(equipamentos.map(eq => eq.tipo))].sort()
    const marcas = [...new Set(equipamentos.map(eq => eq.marca))].sort()

    // Models filtered by selected brand
    const modelos = [...new Set(
      equipamentos
        .filter(eq => filters.marca === "all" || eq.marca === filters.marca)
        .map(eq => eq.modelo)
    )].sort()

    const fluidos = [...new Set(equipamentos.map(eq => eq.fluido))].sort()

    // Ambientes filtered by selected edificacao
    const filteredAmbientes = ambientes.filter(
      a => filters.edificacao === "all" || a.edificacaoId === filters.edificacao
    )

    return { tipos, marcas, modelos, fluidos, filteredAmbientes }
  }, [equipamentos, ambientes, filters.marca, filters.edificacao])

  // Apply all filters
  const filteredEquipamentos = useMemo(() => {
    return equipamentos.filter(eq => {
      // Search by TAG, marca, modelo
      if (filters.search) {
        const s = filters.search.toLowerCase()
        const matchSearch =
          eq.tag.toLowerCase().includes(s) ||
          eq.marca.toLowerCase().includes(s) ||
          eq.modelo.toLowerCase().includes(s) ||
          eq.tipo.toLowerCase().includes(s) ||
          eq.fluido.toLowerCase().includes(s) ||
          eq.localizacao.toLowerCase().includes(s)
        if (!matchSearch) return false
      }

      if (filters.edificacao !== "all" && eq.edificacaoId !== filters.edificacao) return false
      if (filters.tipo !== "all" && eq.tipo !== filters.tipo) return false
      if (filters.marca !== "all" && eq.marca !== filters.marca) return false
      if (filters.modelo !== "all" && eq.modelo !== filters.modelo) return false
      if (filters.fluido !== "all" && eq.fluido !== filters.fluido) return false
      if (filters.status !== "all" && eq.status !== filters.status) return false
      if (filters.ambiente !== "all" && eq.ambienteId !== filters.ambiente) return false

      if (filters.btuRange !== "all") {
        const [minStr, maxStr] = filters.btuRange.split("-")
        const min = Number(minStr)
        const max = Number(maxStr)
        if (eq.capacidadeBtu < min || eq.capacidadeBtu > max) return false
      }

      return true
    })
  }, [equipamentos, filters])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.edificacao !== "all") count++
    if (filters.tipo !== "all") count++
    if (filters.marca !== "all") count++
    if (filters.modelo !== "all") count++
    if (filters.btuRange !== "all") count++
    if (filters.fluido !== "all") count++
    if (filters.status !== "all") count++
    if (filters.ambiente !== "all") count++
    return count
  }, [filters])

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters(prev => {
      const next = { ...prev, [key]: value }
      // Reset dependent filters
      if (key === "edificacao") {
        next.ambiente = "all"
      }
      if (key === "marca") {
        next.modelo = "all"
      }
      return next
    })
    setSelectedIds(new Set())
  }

  function clearFilters() {
    setFilters(defaultFilters)
    setSelectedIds(new Set())
  }

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    if (selectedIds.size === filteredEquipamentos.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredEquipamentos.map(eq => eq.id)))
    }
  }, [selectedIds.size, filteredEquipamentos])

  const selectedEquipamentos = equipamentos.filter(eq => selectedIds.has(eq.id))

  function handlePrint() {
    if (selectedEquipamentos.length === 0) return
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const mm = sizeInMillimeters[labelSize]

    const labelsHtml = selectedEquipamentos.map(eq => {
      const canvasEl = document.querySelector(`[data-equip-id="${eq.id}"] canvas`) as HTMLCanvasElement | null
      const imgSrc = canvasEl?.toDataURL("image/png") || ""
      const ed = edificacoes.find(e => e.id === eq.edificacaoId)
      const amb = ambientes.find(a => a.id === eq.ambienteId)

      return `
        <div class="label-container" style="width: ${mm.width}mm; height: ${mm.height}mm;">
          ${imgSrc ? `<img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: contain;" />` : `
            <div class="label-fallback">
              <strong>${eq.tag}</strong><br/>
              ${eq.tipo} - ${eq.marca} ${eq.modelo}<br/>
              ${(eq.capacidadeBtu / 1000).toFixed(0)}k BTU | ${eq.fluido}<br/>
              ${ed?.nome || ""} ${amb ? "- " + amb.nome : ""}
            </div>
          `}
        </div>
      `
    }).join("")

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Etiquetas QR Code - UTIL PMOC</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Inter, system-ui, sans-serif; padding: 10mm; }
          .labels-grid { display: flex; flex-wrap: wrap; gap: 8mm; justify-content: flex-start; }
          .label-container { page-break-inside: avoid; break-inside: avoid; display: block; }
          .label-fallback { border: 1px solid #CBD5E1; border-radius: 6px; padding: 2mm; font-size: 2.8mm; width: 100%; height: 100%; overflow: hidden; }
          @media print { body { padding: 5mm; } .labels-grid { gap: 5mm; } }
        </style>
      </head>
      <body>
        <div class="labels-grid">${labelsHtml}</div>
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  function handleDownloadAll() {
    selectedEquipamentos.forEach(eq => {
      const canvasEl = document.querySelector(`[data-equip-id="${eq.id}"] canvas`) as HTMLCanvasElement | null
      if (!canvasEl) return
      const link = document.createElement("a")
      link.download = `etiqueta-${eq.tag}.png`
      link.href = canvasEl.toDataURL("image/png")
      link.click()
    })
  }

  const allSelected = filteredEquipamentos.length > 0 && selectedIds.size === filteredEquipamentos.length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Etiquetas QR Code</h1>
          <p className="text-muted-foreground">Gere e imprima etiquetas com QR Code para seus equipamentos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownloadAll} disabled={selectedIds.size === 0}>
            <Download className="size-4 mr-2" />
            Baixar PNG
          </Button>
          <Button onClick={handlePrint} disabled={selectedIds.size === 0}>
            <Printer className="size-4 mr-2" />
            Imprimir {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
          </Button>
        </div>
      </div>

      {/* Search bar + filter toggle + size + select all */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar TAG, marca, modelo, tipo..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9"
          />
        </div>

        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0"
        >
          <SlidersHorizontal className="size-4 mr-2" />
          Filtros
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px] bg-background/20 text-primary-foreground">
              {activeFilterCount}
            </Badge>
          )}
          {showFilters ? <ChevronUp className="size-3.5 ml-1" /> : <ChevronDown className="size-3.5 ml-1" />}
        </Button>

        <Select value={labelSize} onValueChange={(v) => setLabelSize(v as LabelSize)}>
          <SelectTrigger className="w-[200px]">
            <QrCode className="size-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Tamanho da etiqueta" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(sizeLabels) as LabelSize[]).map(s => (
              <SelectItem key={s} value={s}>
                {sizeLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={selectAll} className="shrink-0">
          <Check className="size-3.5 mr-2" />
          {allSelected ? "Desmarcar Todos" : "Selecionar Todos"}
        </Button>

        {selectedIds.size > 0 && (
          <Badge variant="secondary" className="shrink-0">
            {selectedIds.size} selecionado{selectedIds.size > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-primary" />
                <CardTitle className="text-sm">Filtros Avancados</CardTitle>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {activeFilterCount} ativo{activeFilterCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-muted-foreground hover:text-destructive">
                  <X className="size-3 mr-1" />
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Edificacao */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Edificacao</Label>
                <Select value={filters.edificacao} onValueChange={(v) => updateFilter("edificacao", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Edificacoes</SelectItem>
                    {edificacoes.map(ed => (
                      <SelectItem key={ed.id} value={ed.id}>{ed.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ambiente */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Ambiente</Label>
                <Select value={filters.ambiente} onValueChange={(v) => updateFilter("ambiente", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Ambientes</SelectItem>
                    {uniqueValues.filteredAmbientes.map(amb => (
                      <SelectItem key={amb.id} value={amb.id}>{amb.nome} ({amb.andar})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Tipo de Equipamento</Label>
                <Select value={filters.tipo} onValueChange={(v) => updateFilter("tipo", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Tipos</SelectItem>
                    {uniqueValues.tipos.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Marca */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Marca</Label>
                <Select value={filters.marca} onValueChange={(v) => updateFilter("marca", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Marcas</SelectItem>
                    {uniqueValues.marcas.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Modelo */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Modelo</Label>
                <Select value={filters.modelo} onValueChange={(v) => updateFilter("modelo", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Modelos</SelectItem>
                    {uniqueValues.modelos.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Faixa de BTU */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Capacidade (BTU)</Label>
                <Select value={filters.btuRange} onValueChange={(v) => updateFilter("btuRange", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {btuRanges.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fluido */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Fluido Refrigerante</Label>
                <Select value={filters.fluido} onValueChange={(v) => updateFilter("fluido", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Fluidos</SelectItem>
                    {uniqueValues.fluidos.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                <Select value={filters.status} onValueChange={(v) => updateFilter("status", v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                    <SelectItem value="Manutencao">Em Manutencao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filter tags */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Filtros ativos:</span>
                {filters.edificacao !== "all" && (
                  <FilterTag
                    label={`Edificacao: ${edificacoes.find(e => e.id === filters.edificacao)?.nome || ""}`}
                    onRemove={() => updateFilter("edificacao", "all")}
                  />
                )}
                {filters.ambiente !== "all" && (
                  <FilterTag
                    label={`Ambiente: ${ambientes.find(a => a.id === filters.ambiente)?.nome || ""}`}
                    onRemove={() => updateFilter("ambiente", "all")}
                  />
                )}
                {filters.tipo !== "all" && (
                  <FilterTag label={`Tipo: ${filters.tipo}`} onRemove={() => updateFilter("tipo", "all")} />
                )}
                {filters.marca !== "all" && (
                  <FilterTag label={`Marca: ${filters.marca}`} onRemove={() => updateFilter("marca", "all")} />
                )}
                {filters.modelo !== "all" && (
                  <FilterTag label={`Modelo: ${filters.modelo}`} onRemove={() => updateFilter("modelo", "all")} />
                )}
                {filters.btuRange !== "all" && (
                  <FilterTag
                    label={`BTU: ${btuRanges.find(r => r.value === filters.btuRange)?.label || ""}`}
                    onRemove={() => updateFilter("btuRange", "all")}
                  />
                )}
                {filters.fluido !== "all" && (
                  <FilterTag label={`Fluido: ${filters.fluido}`} onRemove={() => updateFilter("fluido", "all")} />
                )}
                {filters.status !== "all" && (
                  <FilterTag label={`Status: ${filters.status}`} onRemove={() => updateFilter("status", "all")} />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{filteredEquipamentos.length} equipamento{filteredEquipamentos.length !== 1 ? "s" : ""} encontrado{filteredEquipamentos.length !== 1 ? "s" : ""}</span>
        {activeFilterCount > 0 && (
          <span>com {activeFilterCount} filtro{activeFilterCount > 1 ? "s" : ""} aplicado{activeFilterCount > 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Equipment selection + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment list */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Equipamentos</CardTitle>
            <CardDescription>{filteredEquipamentos.length} disponive{filteredEquipamentos.length !== 1 ? "is" : "l"}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {filteredEquipamentos.map(eq => {
                const ed = edificacoes.find(e => e.id === eq.edificacaoId)
                const isSelected = selectedIds.has(eq.id)
                return (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => toggleSelect(eq.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-left border-b border-border transition-colors hover:bg-secondary/50 ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(eq.id)}
                      className="shrink-0"
                      aria-label={`Selecionar ${eq.tag}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-semibold text-foreground">{eq.tag}</span>
                        <Badge
                          variant={eq.status === "Ativo" ? "default" : eq.status === "Manutencao" ? "destructive" : "secondary"}
                          className="text-[9px] px-1.5"
                        >
                          {eq.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {eq.tipo} - {eq.marca} {eq.modelo} - {(eq.capacidadeBtu / 1000).toFixed(0)}k BTU
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 truncate">
                        {ed?.nome || ""} | {eq.fluido}
                      </p>
                    </div>
                  </button>
                )
              })}
              {filteredEquipamentos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <QrCode className="size-8 mb-2 opacity-50" />
                  <p className="text-sm">Nenhum equipamento encontrado</p>
                  {activeFilterCount > 0 && (
                    <Button variant="link" size="sm" onClick={clearFilters} className="mt-1 text-xs">
                      Limpar filtros
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Label preview */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Preview das Etiquetas</CardTitle>
                <CardDescription>
                  {selectedEquipamentos.length > 0
                    ? `${selectedEquipamentos.length} etiqueta${selectedEquipamentos.length > 1 ? "s" : ""} pronta${selectedEquipamentos.length > 1 ? "s" : ""} para impressao`
                    : "Selecione equipamentos para visualizar as etiquetas"
                  }
                </CardDescription>
              </div>
              <p className="text-xs text-muted-foreground">{sizeDescriptions[labelSize]}</p>
            </div>
          </CardHeader>
          <CardContent>
            {selectedEquipamentos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground rounded-lg border-2 border-dashed border-border">
                <QrCode className="size-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">Nenhum equipamento selecionado</p>
                <p className="text-xs mt-1">Selecione equipamentos na lista ao lado para gerar as etiquetas</p>
              </div>
            ) : (
              <div ref={printRef} className="flex flex-wrap gap-4">
                {selectedEquipamentos.map(eq => {
                  const ed = edificacoes.find(e => e.id === eq.edificacaoId)
                  const amb = ambientes.find(a => a.id === eq.ambienteId)
                  return (
                    <div key={eq.id} data-equip-id={eq.id}>
                      <QrCodeLabel
                        equipamento={eq}
                        edificacao={ed}
                        ambiente={amb}
                        size={labelSize}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
        aria-label={`Remover filtro ${label}`}
      >
        <X className="size-3" />
      </button>
    </span>
  )
}

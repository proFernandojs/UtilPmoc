"use client"

import { useState, useRef } from "react"
import { FileText, Download, Building2, AirVent, ClipboardList, Users, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useApp } from "@/lib/app-context"

export function PmocPage() {
  const { edificacoes, ambientes, equipamentos, tecnicos, planos } = useApp()
  const [selectedEdificacao, setSelectedEdificacao] = useState<string>("")
  const [showPreview, setShowPreview] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const ed = edificacoes.find(e => e.id === selectedEdificacao)
  const edAmbientes = ambientes.filter(a => a.edificacaoId === selectedEdificacao)
  const edEquipamentos = equipamentos.filter(e => e.edificacaoId === selectedEdificacao)
  const edPlanos = planos.filter(p => p.edificacaoId === selectedEdificacao)

  const tecnicoIds = [...new Set(edPlanos.map(p => p.tecnicoId))]
  const edTecnicos = tecnicos.filter(t => tecnicoIds.includes(t.id))

  const totalBtu = edEquipamentos.reduce((acc, eq) => acc + eq.capacidadeBtu, 0)

  function handlePrint() {
    if (!printRef.current) return
    const printContent = printRef.current.innerHTML
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>PMOC - ${ed?.nome || "Relatorio"}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', Arial, sans-serif; color: #1a1a2e; padding: 40px; font-size: 11px; line-height: 1.5; }
          .pmoc-header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3b5fcc; padding-bottom: 20px; }
          .pmoc-header h1 { font-size: 22px; color: #3b5fcc; margin-bottom: 4px; }
          .pmoc-header h2 { font-size: 14px; color: #555; font-weight: normal; }
          .pmoc-header p { font-size: 10px; color: #888; margin-top: 6px; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 13px; font-weight: 700; color: #3b5fcc; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; font-size: 10px; }
          th { background-color: #f0f3ff; color: #3b5fcc; font-weight: 600; }
          tr:nth-child(even) { background-color: #fafbff; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
          .info-item { display: flex; gap: 6px; }
          .info-label { font-weight: 600; color: #555; min-width: 120px; }
          .info-value { color: #333; }
          .footer { margin-top: 40px; text-align: center; font-size: 9px; color: #999; border-top: 1px solid #ddd; padding-top: 12px; }
          .signature-area { margin-top: 60px; display: flex; justify-content: space-around; }
          .signature-line { text-align: center; width: 200px; }
          .signature-line hr { border: none; border-top: 1px solid #333; margin-bottom: 4px; }
          .signature-line p { font-size: 10px; color: #555; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Gerar PMOC</h1>
        <p className="text-muted-foreground">Plano de Manutencao, Operacao e Controle - Lei 13.589/2018</p>
      </div>

      {/* Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selecione a Edificacao</CardTitle>
          <CardDescription>Escolha a edificacao para gerar o relatorio PMOC completo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 max-w-md">
              <Select value={selectedEdificacao} onValueChange={(v) => { setSelectedEdificacao(v); setShowPreview(false) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma edificacao" />
                </SelectTrigger>
                <SelectContent>
                  {edificacoes.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedEdificacao && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                  <Eye className="size-4 mr-2" />
                  {showPreview ? "Ocultar" : "Visualizar"}
                </Button>
                <Button onClick={handlePrint} disabled={!selectedEdificacao}>
                  <Download className="size-4 mr-2" />
                  Imprimir / Salvar PDF
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {selectedEdificacao && ed && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Building2 className="size-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">{edAmbientes.length}</p>
                <p className="text-xs text-muted-foreground">Ambientes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <AirVent className="size-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">{edEquipamentos.length}</p>
                <p className="text-xs text-muted-foreground">Equipamentos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <ClipboardList className="size-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">{edPlanos.length}</p>
                <p className="text-xs text-muted-foreground">Planos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="size-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">{edTecnicos.length}</p>
                <p className="text-xs text-muted-foreground">Tecnicos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PMOC Preview */}
      {showPreview && ed && (
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div ref={printRef}>
              {/* Header */}
              <div className="pmoc-header" style={{ textAlign: "center", marginBottom: 24, borderBottom: "3px solid var(--color-primary)", paddingBottom: 16 }}>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-primary)" }}>PMOC - Plano de Manutencao, Operacao e Controle</h1>
                <h2 style={{ fontSize: 14, color: "var(--color-muted-foreground)", fontWeight: 400, marginTop: 4 }}>{ed.nome}</h2>
                <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 6 }}>
                  Conforme Lei Federal no 13.589/2018 e Portaria MS no 3.523/1998
                </p>
                <p style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>
                  Gerado por UTIL PMOC em {new Date().toLocaleDateString("pt-BR")}
                </p>
              </div>

              {/* 1. Dados da Edificacao */}
              <div className="section" style={{ marginBottom: 24 }}>
                <h3 className="section-title" style={{ fontSize: 14, fontWeight: 700, color: "var(--color-primary)", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid var(--color-border)" }}>
                  1. Dados da Edificacao
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex gap-2">
                    <span className="font-semibold text-muted-foreground min-w-[120px]">Nome:</span>
                    <span className="text-foreground">{ed.nome}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-muted-foreground min-w-[120px]">CNPJ:</span>
                    <span className="text-foreground">{ed.cnpj}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-muted-foreground min-w-[120px]">Endereco:</span>
                    <span className="text-foreground">{ed.endereco}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-muted-foreground min-w-[120px]">Cidade/UF:</span>
                    <span className="text-foreground">{ed.cidade}/{ed.estado}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-muted-foreground min-w-[120px]">CEP:</span>
                    <span className="text-foreground">{ed.cep}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-muted-foreground min-w-[120px]">Responsavel:</span>
                    <span className="text-foreground">{ed.responsavel}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-muted-foreground min-w-[120px]">Telefone:</span>
                    <span className="text-foreground">{ed.telefone}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-muted-foreground min-w-[120px]">E-mail:</span>
                    <span className="text-foreground">{ed.email}</span>
                  </div>
                </div>
              </div>

              {/* 2. Ambientes Climatizados */}
              <div className="section" style={{ marginBottom: 24 }}>
                <h3 className="section-title" style={{ fontSize: 14, fontWeight: 700, color: "var(--color-primary)", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid var(--color-border)" }}>
                  2. Ambientes Climatizados
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-secondary">
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Ambiente</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Andar</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Area (m2)</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Ocupacao Max.</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Atividade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {edAmbientes.map(amb => (
                        <tr key={amb.id}>
                          <td className="border border-border p-2 text-xs">{amb.nome}</td>
                          <td className="border border-border p-2 text-xs">{amb.andar}</td>
                          <td className="border border-border p-2 text-xs">{amb.area}</td>
                          <td className="border border-border p-2 text-xs">{amb.ocupacaoMaxima}</td>
                          <td className="border border-border p-2 text-xs">{amb.atividade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Inventario de Equipamentos */}
              <div className="section" style={{ marginBottom: 24 }}>
                <h3 className="section-title" style={{ fontSize: 14, fontWeight: 700, color: "var(--color-primary)", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid var(--color-border)" }}>
                  3. Inventario de Equipamentos de Climatizacao
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-secondary">
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">TAG</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Tipo</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Marca</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Modelo</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">BTU</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">kW</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Fluido</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Localizacao</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {edEquipamentos.map(eq => (
                        <tr key={eq.id}>
                          <td className="border border-border p-2 text-xs font-mono">{eq.tag}</td>
                          <td className="border border-border p-2 text-xs">{eq.tipo}</td>
                          <td className="border border-border p-2 text-xs">{eq.marca}</td>
                          <td className="border border-border p-2 text-xs">{eq.modelo}</td>
                          <td className="border border-border p-2 text-xs">{eq.capacidadeBtu.toLocaleString("pt-BR")}</td>
                          <td className="border border-border p-2 text-xs">{eq.potenciaKw}</td>
                          <td className="border border-border p-2 text-xs">{eq.fluido}</td>
                          <td className="border border-border p-2 text-xs">{eq.localizacao}</td>
                          <td className="border border-border p-2 text-xs">{eq.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Capacidade total instalada: {totalBtu.toLocaleString("pt-BR")} BTU/h ({(totalBtu * 0.000293071).toFixed(1)} kW)
                </p>
              </div>

              {/* 4. Plano de Manutencao */}
              <div className="section" style={{ marginBottom: 24 }}>
                <h3 className="section-title" style={{ fontSize: 14, fontWeight: 700, color: "var(--color-primary)", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid var(--color-border)" }}>
                  4. Plano de Atividades de Manutencao
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-secondary">
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Equipamento</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Atividade</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Periodicidade</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Tecnico</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Ultima Exec.</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Proxima Exec.</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {edPlanos.map(plano => {
                        const eq = equipamentos.find(e => e.id === plano.equipamentoId)
                        const tec = tecnicos.find(t => t.id === plano.tecnicoId)
                        return (
                          <tr key={plano.id}>
                            <td className="border border-border p-2 text-xs font-mono">{eq?.tag}</td>
                            <td className="border border-border p-2 text-xs">{plano.atividade}</td>
                            <td className="border border-border p-2 text-xs">{plano.periodicidade}</td>
                            <td className="border border-border p-2 text-xs">{tec?.nome.split(' ').slice(0, 2).join(' ')}</td>
                            <td className="border border-border p-2 text-xs">{plano.ultimaExecucao || "-"}</td>
                            <td className="border border-border p-2 text-xs">{plano.proximaExecucao}</td>
                            <td className="border border-border p-2 text-xs">{plano.status}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. Responsaveis Tecnicos */}
              <div className="section" style={{ marginBottom: 24 }}>
                <h3 className="section-title" style={{ fontSize: 14, fontWeight: 700, color: "var(--color-primary)", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid var(--color-border)" }}>
                  5. Responsaveis Tecnicos
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-secondary">
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Nome</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">CREA</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Especialidade</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Empresa</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">ART</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Contato</th>
                      </tr>
                    </thead>
                    <tbody>
                      {edTecnicos.map(tec => (
                        <tr key={tec.id}>
                          <td className="border border-border p-2 text-xs">{tec.nome}</td>
                          <td className="border border-border p-2 text-xs font-mono">{tec.crea}</td>
                          <td className="border border-border p-2 text-xs">{tec.especialidade}</td>
                          <td className="border border-border p-2 text-xs">{tec.empresa}</td>
                          <td className="border border-border p-2 text-xs font-mono">{tec.art}</td>
                          <td className="border border-border p-2 text-xs">{tec.telefone} / {tec.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 6. Parametros e Normas */}
              <div className="section" style={{ marginBottom: 24 }}>
                <h3 className="section-title" style={{ fontSize: 14, fontWeight: 700, color: "var(--color-primary)", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid var(--color-border)" }}>
                  6. Parametros de Qualidade do Ar e Normas Aplicaveis
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-secondary">
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Parametro</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Referencia</th>
                        <th className="border border-border p-2 text-left text-xs font-semibold text-foreground">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-2 text-xs">Temperatura</td>
                        <td className="border border-border p-2 text-xs">ANVISA RE no 9/2003</td>
                        <td className="border border-border p-2 text-xs">23oC a 26oC (verao) / 20oC a 22oC (inverno)</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 text-xs">Umidade Relativa</td>
                        <td className="border border-border p-2 text-xs">ANVISA RE no 9/2003</td>
                        <td className="border border-border p-2 text-xs">40% a 65%</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 text-xs">Velocidade do Ar</td>
                        <td className="border border-border p-2 text-xs">NBR 16401</td>
                        <td className="border border-border p-2 text-xs">{'< 0,25 m/s'}</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 text-xs">Taxa de Renovacao de Ar</td>
                        <td className="border border-border p-2 text-xs">ANVISA RE no 9/2003</td>
                        <td className="border border-border p-2 text-xs">27 m3/h/pessoa</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 text-xs">CO2</td>
                        <td className="border border-border p-2 text-xs">ANVISA RE no 9/2003</td>
                        <td className="border border-border p-2 text-xs">{'< 1000 ppm'}</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 text-xs">Fungos</td>
                        <td className="border border-border p-2 text-xs">ANVISA RE no 9/2003</td>
                        <td className="border border-border p-2 text-xs">{'< 750 UFC/m3'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Normas */}
              <div className="section" style={{ marginBottom: 24 }}>
                <h3 className="section-title" style={{ fontSize: 14, fontWeight: 700, color: "var(--color-primary)", marginBottom: 12, paddingBottom: 4, borderBottom: "1px solid var(--color-border)" }}>
                  7. Fundamentacao Legal
                </h3>
                <ul className="list-disc pl-5 text-xs text-muted-foreground flex flex-col gap-1.5">
                  <li>Lei Federal no 13.589/2018 - Dispoe sobre a manutencao de instalacoes e equipamentos de sistemas de climatizacao</li>
                  <li>Portaria MS no 3.523/1998 - Regulamento tecnico sobre qualidade do ar de interiores em ambientes climatizados</li>
                  <li>Resolucao ANVISA RE no 9/2003 - Orientacao tecnica sobre padroes referenciais de qualidade do ar interior</li>
                  <li>NBR 16401 - Instalacoes de ar-condicionado - Sistemas centrais e unitarios</li>
                  <li>NBR 13971 - Sistemas de refrigeracao, condicionamento de ar, ventilacao e aquecimento - Manutencao programada</li>
                  <li>Portaria IBAMA no 387/2023 - Uso e comercializacao de substancias que destroem a camada de ozonio</li>
                </ul>
              </div>

              {/* Signatures */}
              <div style={{ marginTop: 60, display: "flex", justifyContent: "space-around" }}>
                <div style={{ textAlign: "center", width: 200 }}>
                  <Separator className="mb-2" />
                  <p className="text-xs text-muted-foreground">Responsavel pela Edificacao</p>
                  <p className="text-xs text-foreground mt-1">{ed.responsavel}</p>
                </div>
                {edTecnicos[0] && (
                  <div style={{ textAlign: "center", width: 200 }}>
                    <Separator className="mb-2" />
                    <p className="text-xs text-muted-foreground">Responsavel Tecnico</p>
                    <p className="text-xs text-foreground mt-1">{edTecnicos[0].nome}</p>
                    <p className="text-[10px] text-muted-foreground">{edTecnicos[0].crea}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ marginTop: 30, textAlign: "center", fontSize: 10, color: "var(--color-muted-foreground)", borderTop: "1px solid var(--color-border)", paddingTop: 10 }}>
                <p>Documento gerado pelo sistema UTIL PMOC - {new Date().toLocaleDateString("pt-BR")} {new Date().toLocaleTimeString("pt-BR")}</p>
                <p>Este documento atende aos requisitos da Lei Federal no 13.589/2018</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedEdificacao && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FileText className="size-12 mb-4 text-muted-foreground/40" />
            <p className="text-lg font-medium text-foreground mb-1">Selecione uma Edificacao</p>
            <p className="text-sm text-center max-w-md">
              Escolha uma edificacao acima para visualizar e gerar o relatorio PMOC completo conforme a Lei 13.589/2018
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

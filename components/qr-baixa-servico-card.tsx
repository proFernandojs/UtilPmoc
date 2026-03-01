"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Camera, CameraOff, CheckCircle2, AlertTriangle, QrCode } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/app-context"
import type { Equipamento, OrdemServico, PlanoManutencao } from "@/lib/store"

type ScanResultType = "idle" | "success" | "warning" | "error"

type ScanMatch = {
  equipamentoId?: string
  tag?: string
}

type PendingBaixa = {
  equipamento: Equipamento
  ordem: OrdemServico
  plano?: PlanoManutencao
  programacao: "Mensal" | "Trimestral" | "Semestral" | "Anual" | "Quimica" | "Nao definida"
}

function parseQrPayload(decodedText: string): ScanMatch {
  const text = decodedText.trim()

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>
    const id = typeof parsed.id === "string" ? parsed.id : undefined
    const tag = typeof parsed.tag === "string" ? parsed.tag : undefined

    if (id || tag) {
      return { equipamentoId: id, tag }
    }
  } catch {
  }

  const idMatch = text.match(/eq-\d+/i)
  if (idMatch) {
    return { equipamentoId: idMatch[0].toLowerCase() }
  }

  return { tag: text }
}

function findOpenOrder(ordens: OrdemServico[], equipamentoId: string) {
  return ordens
    .filter(
      (os) =>
        os.equipamentoId === equipamentoId &&
        os.status !== "Concluida" &&
        os.status !== "Cancelada"
    )
    .sort((a, b) => b.dataAbertura.localeCompare(a.dataAbertura))[0]
}

function todayIsoDate() {
  return new Date().toISOString().split("T")[0]
}

function baixaNote() {
  return `Baixa via QR Code em ${new Date().toLocaleString("pt-BR")}`
}

function resolveProgramacao(plano?: PlanoManutencao, ordem?: OrdemServico): PendingBaixa["programacao"] {
  const texto = `${plano?.atividade || ""} ${ordem?.descricao || ""}`.toLowerCase()

  if (texto.includes("quim")) {
    return "Quimica"
  }

  if (plano?.periodicidade) {
    return plano.periodicidade
  }

  return "Nao definida"
}

export function QrBaixaServicoCard() {
  const { equipamentos, ordensServico, planos, updateOrdemServico } = useApp()

  const scannerId = useMemo(() => `qr-reader-${Math.random().toString(36).slice(2, 10)}`, [])
  const scannerRef = useRef<any>(null)
  const handlingRef = useRef(false)

  const [isScanning, setIsScanning] = useState(false)
  const [scanResultType, setScanResultType] = useState<ScanResultType>("idle")
  const [scanMessage, setScanMessage] = useState("Aponte a camera para a etiqueta QR do equipamento para dar baixa no servico.")
  const [lastDecodedText, setLastDecodedText] = useState("")
  const [pendingBaixa, setPendingBaixa] = useState<PendingBaixa | null>(null)

  async function stopScanner() {
    const scanner = scannerRef.current
    if (!scanner) {
      setIsScanning(false)
      return
    }

    try {
      await scanner.stop()
    } catch {
    }

    try {
      scanner.clear()
    } catch {
    }

    scannerRef.current = null
    setIsScanning(false)
  }

  async function handleDecoded(decodedText: string) {
    if (handlingRef.current) return
    handlingRef.current = true

    const { equipamentoId, tag } = parseQrPayload(decodedText)

    const equipamento = equipamentos.find((eq) => {
      if (equipamentoId) return eq.id === equipamentoId
      if (tag) return eq.tag.toLowerCase() === tag.toLowerCase()
      return false
    })

    if (!equipamento) {
      setScanResultType("error")
      setScanMessage("Equipamento nao encontrado para este QR Code.")
      handlingRef.current = false
      return
    }

    const ordem = findOpenOrder(ordensServico, equipamento.id)

    if (!ordem) {
      setScanResultType("warning")
      setScanMessage(`Equipamento ${equipamento.tag} encontrado, mas sem OS aberta/em andamento para baixa.`)
      handlingRef.current = false
      return
    }

    const plano = planos.find((p) => p.id === ordem.planoId)
    const programacao = resolveProgramacao(plano, ordem)

    setPendingBaixa({
      equipamento,
      ordem,
      plano,
      programacao,
    })

    setScanResultType("idle")
    setScanMessage(`Equipamento ${equipamento.tag} lido. Confirme abaixo se deseja realizar a baixa.`)

    handlingRef.current = false
  }

  function confirmarBaixa() {
    if (!pendingBaixa) return

    const { ordem, equipamento, programacao } = pendingBaixa
    const observacoesExtra = `${baixaNote()} | Programacao: ${programacao}`
    const observacoes = ordem.observacoes ? `${ordem.observacoes}\n${observacoesExtra}` : observacoesExtra

    updateOrdemServico(ordem.id, {
      status: "Concluida",
      dataConclusao: todayIsoDate(),
      observacoes,
    })

    setPendingBaixa(null)
    setScanResultType("success")
    setScanMessage(`OS ${ordem.id.toUpperCase()} concluida para o equipamento ${equipamento.tag}.`)
  }

  function cancelarBaixa() {
    setPendingBaixa(null)
    setScanResultType("warning")
    setScanMessage("Baixa cancelada pelo operador. Nenhuma alteracao foi feita.")
  }

  async function startScanner() {
    setScanResultType("idle")
    setScanMessage("Abrindo camera traseira...")

    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      const scanner = new Html5Qrcode(scannerId)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1 },
        async (decodedText: string) => {
          setLastDecodedText(decodedText)
          await handleDecoded(decodedText)
          await stopScanner()
        },
        () => {}
      )

      setIsScanning(true)
      setScanMessage("Camera ativa. Posicione o QR Code no centro da tela.")
    } catch {
      setScanResultType("error")
      setScanMessage("Nao foi possivel iniciar a camera. Verifique permissao no navegador do celular.")
      await stopScanner()
    }
  }

  useEffect(() => {
    return () => {
      void stopScanner()
    }
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <QrCode className="size-4" />
          Baixa de Servico por QR Code
        </CardTitle>
        <CardDescription>Leia a etiqueta do equipamento com a camera do celular para concluir a OS pendente.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {!isScanning ? (
            <Button onClick={startScanner} disabled={!!pendingBaixa}>
              <Camera className="size-4 mr-2" />
              Iniciar Camera
            </Button>
          ) : (
            <Button variant="destructive" onClick={stopScanner}>
              <CameraOff className="size-4 mr-2" />
              Parar Camera
            </Button>
          )}

          {scanResultType === "success" && (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="size-3" />
              Baixa realizada
            </Badge>
          )}

          {scanResultType === "warning" && (
            <Badge variant="secondary" className="gap-1">
              <AlertTriangle className="size-3" />
              Sem OS pendente
            </Badge>
          )}

          {scanResultType === "error" && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="size-3" />
              Erro de leitura
            </Badge>
          )}
        </div>

        <div id={scannerId} className="w-full max-w-sm overflow-hidden rounded-md border border-border bg-black/5 min-h-[260px]" />

        <p className="text-sm text-muted-foreground">{scanMessage}</p>

        {pendingBaixa && (
          <div className="rounded-md border border-border bg-card p-3 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Conferencia do Equipamento</Badge>
              <Badge variant="outline">Programacao: {pendingBaixa.programacao}</Badge>
              <Badge variant="outline">OS: {pendingBaixa.ordem.id.toUpperCase()}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-border/70 p-2 space-y-1">
                <p><span className="text-muted-foreground">TAG:</span> <span className="font-mono">{pendingBaixa.equipamento.tag}</span></p>
                <p><span className="text-muted-foreground">Tipo:</span> {pendingBaixa.equipamento.tipo}</p>
                <p><span className="text-muted-foreground">Marca/Modelo:</span> {pendingBaixa.equipamento.marca} {pendingBaixa.equipamento.modelo}</p>
                <p><span className="text-muted-foreground">Capacidade:</span> {(pendingBaixa.equipamento.capacidadeBtu / 1000).toFixed(0)}k BTU</p>
                <p><span className="text-muted-foreground">Local:</span> {pendingBaixa.equipamento.localizacao}</p>
              </div>

              <div className="rounded-md border border-border/70 p-2 space-y-1">
                <p><span className="text-muted-foreground">Tipo OS:</span> {pendingBaixa.ordem.tipo}</p>
                <p><span className="text-muted-foreground">Status atual:</span> {pendingBaixa.ordem.status}</p>
                <p><span className="text-muted-foreground">Abertura:</span> {pendingBaixa.ordem.dataAbertura}</p>
                <p><span className="text-muted-foreground">Descricao:</span> {pendingBaixa.ordem.descricao || "-"}</p>
                <p><span className="text-muted-foreground">Atividade planejada:</span> {pendingBaixa.plano?.atividade || "Nao vinculada a plano"}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Realizar baixa deste servico do mes?</span>
              <Button size="sm" onClick={confirmarBaixa}>Sim</Button>
              <Button size="sm" variant="outline" onClick={cancelarBaixa}>Nao</Button>
            </div>
          </div>
        )}

        {lastDecodedText && (
          <p className="text-xs text-muted-foreground/80 break-all">Ultimo QR lido: {lastDecodedText}</p>
        )}
      </CardContent>
    </Card>
  )
}

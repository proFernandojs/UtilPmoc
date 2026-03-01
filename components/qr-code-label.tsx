"use client"

import { useEffect, useRef } from "react"
import type { Equipamento, Edificacao, Ambiente } from "@/lib/store"

interface QrCodeLabelProps {
  equipamento: Equipamento
  edificacao?: Edificacao
  ambiente?: Ambiente
  size?: "micro" | "mini" | "small" | "medium" | "large"
}

export function QrCodeLabel({ equipamento, edificacao, ambiente, size = "medium" }: QrCodeLabelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const dimensions = {
    micro: { width: 76, height: 227, qrSize: 58, fontSize: 6, logoH: 9 },
    mini: { width: 113, height: 265, qrSize: 85, fontSize: 7, logoH: 12 },
    small: { width: 240, height: 140, qrSize: 80, fontSize: 8, logoH: 14 },
    medium: { width: 340, height: 200, qrSize: 120, fontSize: 10, logoH: 20 },
    large: { width: 440, height: 260, qrSize: 160, fontSize: 12, logoH: 26 },
  }

  const canvasSizeClasses = {
    micro: "w-[76px] h-[227px]",
    mini: "w-[113px] h-[265px]",
    small: "w-[240px] h-[140px]",
    medium: "w-[340px] h-[200px]",
    large: "w-[440px] h-[260px]",
  }

  const dim = dimensions[size]
  const isVertical = size === "mini" || size === "micro"

  useEffect(() => {
    async function generateLabel() {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const dpr = 2
      canvas.width = dim.width * dpr
      canvas.height = dim.height * dpr
      ctx.scale(dpr, dpr)

      // White background
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, dim.width, dim.height)

      // Border
      ctx.strokeStyle = "#CBD5E1"
      ctx.lineWidth = 1.5
      const r = 8
      ctx.beginPath()
      ctx.moveTo(r, 0.75)
      ctx.lineTo(dim.width - r, 0.75)
      ctx.arcTo(dim.width - 0.75, 0.75, dim.width - 0.75, r, r)
      ctx.lineTo(dim.width - 0.75, dim.height - r)
      ctx.arcTo(dim.width - 0.75, dim.height - 0.75, dim.width - r, dim.height - 0.75, r)
      ctx.lineTo(r, dim.height - 0.75)
      ctx.arcTo(0.75, dim.height - 0.75, 0.75, dim.height - r, r)
      ctx.lineTo(0.75, r)
      ctx.arcTo(0.75, 0.75, r, 0.75, r)
      ctx.closePath()
      ctx.stroke()

      // Top accent bar
      ctx.fillStyle = "#3b5fcc"
      ctx.beginPath()
      ctx.moveTo(r, 0.75)
      ctx.lineTo(dim.width - r, 0.75)
      ctx.arcTo(dim.width - 0.75, 0.75, dim.width - 0.75, r, r)
      ctx.lineTo(dim.width - 0.75, 5)
      ctx.lineTo(0.75, 5)
      ctx.lineTo(0.75, r)
      ctx.arcTo(0.75, 0.75, r, 0.75, r)
      ctx.closePath()
      ctx.fill()

      const padding = isVertical ? (size === "micro" ? 4 : 6) : 12
      const topOffset = isVertical ? (size === "micro" ? 6 : 8) : 10

      // Load logo
      let logoImg: HTMLImageElement | null = null
      try {
        logoImg = new Image()
        logoImg.crossOrigin = "anonymous"
        await new Promise<void>((resolve, reject) => {
          logoImg!.onload = () => resolve()
          logoImg!.onerror = () => reject()
          logoImg!.src = "/images/logo-util-pmoc.jpg"
        })
      } catch {
        logoImg = null
      }

      // Load QR code
      let qrImg: HTMLImageElement | null = null
      try {
        const QRCode = (await import("qrcode")).default
        const qrData = JSON.stringify({
          app: "UTIL PMOC",
          tag: equipamento.tag,
          id: equipamento.id,
          tipo: equipamento.tipo,
          marca: equipamento.marca,
          modelo: equipamento.modelo,
          btu: equipamento.capacidadeBtu,
          fluido: equipamento.fluido,
          edificacao: edificacao?.nome || "",
          ambiente: ambiente?.nome || "",
        })
        const qrDataUrl = await QRCode.toDataURL(qrData, {
          width: dim.qrSize * 2,
          margin: 1,
          color: { dark: "#1a2744", light: "#FFFFFF" },
          errorCorrectionLevel: "M",
        })
        qrImg = new Image()
        qrImg.crossOrigin = "anonymous"
        await new Promise<void>((resolve) => {
          qrImg!.onload = () => resolve()
          qrImg!.src = qrDataUrl
        })
      } catch {
        qrImg = null
      }

      const statusColors: Record<string, { bg: string; text: string }> = {
        Ativo: { bg: "#DCFCE7", text: "#166534" },
        Inativo: { bg: "#F1F5F9", text: "#475569" },
        Manutencao: { bg: "#FEE2E2", text: "#991B1B" },
      }
      const sc = statusColors[equipamento.status] || statusColors.Ativo
      const statusText = equipamento.status === "Manutencao" ? "Manut." : equipamento.status

      // ---------- VERTICAL LAYOUT (micro 2x6cm, mini 3x7cm) ----------
      if (isVertical) {
        const isMicro = size === "micro"
        const maxChars = isMicro ? 12 : 18
        let y = topOffset

        // Logo (centered)
        if (logoImg) {
          const logoW = (logoImg.width / logoImg.height) * dim.logoH
          const logoX = (dim.width - logoW) / 2
          ctx.drawImage(logoImg, logoX, y, logoW, dim.logoH)
        } else {
          ctx.fillStyle = "#3b5fcc"
          ctx.font = `bold ${dim.fontSize + (isMicro ? 0 : 1)}px Inter, system-ui, sans-serif`
          ctx.textAlign = "center"
          ctx.fillText("UTIL PMOC", dim.width / 2, y + dim.logoH - 2)
          ctx.textAlign = "left"
        }
        y += dim.logoH + (isMicro ? 3 : 5)

        // TAG (centered, bold)
        ctx.fillStyle = "#1a2744"
        ctx.font = `bold ${dim.fontSize + (isMicro ? 2 : 4)}px Inter, system-ui, sans-serif`
        ctx.textAlign = "center"
        const tagTrunc = equipamento.tag.length > maxChars ? equipamento.tag.substring(0, maxChars) + ".." : equipamento.tag
        ctx.fillText(tagTrunc, dim.width / 2, y + dim.fontSize + 2)
        y += dim.fontSize + (isMicro ? 6 : 10)

        // Separator
        ctx.strokeStyle = "#E2E8F0"
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(dim.width - padding, y)
        ctx.stroke()
        y += (isMicro ? 3 : 4)

        // Type (centered)
        ctx.fillStyle = "#475569"
        ctx.font = `${dim.fontSize - 1}px Inter, system-ui, sans-serif`
        const tipoTrunc = equipamento.tipo.length > maxChars ? equipamento.tipo.substring(0, maxChars) + ".." : equipamento.tipo
        ctx.fillText(tipoTrunc, dim.width / 2, y + dim.fontSize)
        y += dim.fontSize + (isMicro ? 2 : 3)

        // Brand + Model (centered)
        ctx.fillStyle = "#1a2744"
        ctx.font = `600 ${dim.fontSize - 1}px Inter, system-ui, sans-serif`
        const brandModel = `${equipamento.marca} ${equipamento.modelo}`
        const bmTrunc = brandModel.length > maxChars ? brandModel.substring(0, maxChars) + ".." : brandModel
        ctx.fillText(bmTrunc, dim.width / 2, y + dim.fontSize)
        y += dim.fontSize + (isMicro ? 2 : 3)

        // BTU (centered)
        ctx.fillStyle = "#475569"
        ctx.font = `${dim.fontSize - 1}px Inter, system-ui, sans-serif`
        ctx.fillText(`${(equipamento.capacidadeBtu / 1000).toFixed(0)}k BTU`, dim.width / 2, y + dim.fontSize)
        y += dim.fontSize + (isMicro ? 4 : 6)

        // QR Code (centered)
        const qrX = (dim.width - dim.qrSize) / 2
        if (qrImg) {
          ctx.drawImage(qrImg, qrX, y, dim.qrSize, dim.qrSize)
        } else {
          ctx.fillStyle = "#F1F5F9"
          ctx.fillRect(qrX, y, dim.qrSize, dim.qrSize)
        }
        y += dim.qrSize + (isMicro ? 3 : 5)

        // Status pill (centered)
        ctx.font = `600 ${dim.fontSize - (isMicro ? 2 : 2)}px Inter, system-ui, sans-serif`
        const sW = ctx.measureText(statusText).width + (isMicro ? 8 : 10)
        const pillX = (dim.width - sW) / 2
        const pillR = isMicro ? 2 : 3
        const pillH = dim.fontSize + (isMicro ? 1 : 2)
        ctx.fillStyle = sc.bg
        ctx.beginPath()
        ctx.moveTo(pillX + pillR, y)
        ctx.lineTo(pillX + sW - pillR, y)
        ctx.arcTo(pillX + sW, y, pillX + sW, y + pillR, pillR)
        ctx.lineTo(pillX + sW, y + pillH - pillR)
        ctx.arcTo(pillX + sW, y + pillH, pillX + sW - pillR, y + pillH, pillR)
        ctx.lineTo(pillX + pillR, y + pillH)
        ctx.arcTo(pillX, y + pillH, pillX, y + pillH - pillR, pillR)
        ctx.lineTo(pillX, y + pillR)
        ctx.arcTo(pillX, y, pillX + pillR, y, pillR)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = sc.text
        ctx.fillText(statusText, pillX + (isMicro ? 4 : 5), y + dim.fontSize - 1)
        ctx.textAlign = "left"

      } else {
        // ---------- HORIZONTAL LAYOUT (small, medium, large) ----------

        // Draw logo
        if (logoImg) {
          const logoW = (logoImg.width / logoImg.height) * dim.logoH
          ctx.drawImage(logoImg, padding, topOffset, logoW, dim.logoH)
        } else {
          ctx.fillStyle = "#3b5fcc"
          ctx.font = `bold ${dim.fontSize + 2}px Inter, system-ui, sans-serif`
          ctx.fillText("UTIL PMOC", padding, topOffset + dim.logoH - 4)
        }

        // QR Code area (right side)
        const qrX = dim.width - dim.qrSize - padding
        const qrY = topOffset + dim.logoH + 8

        if (qrImg) {
          ctx.drawImage(qrImg, qrX, qrY, dim.qrSize, dim.qrSize)
        } else {
          ctx.fillStyle = "#F1F5F9"
          ctx.fillRect(qrX, qrY, dim.qrSize, dim.qrSize)
          ctx.fillStyle = "#94A3B8"
          ctx.font = `${dim.fontSize}px Inter, system-ui, sans-serif`
          ctx.textAlign = "center"
          ctx.fillText("QR", qrX + dim.qrSize / 2, qrY + dim.qrSize / 2 + 3)
          ctx.textAlign = "left"
        }

        // Equipment info (left side)
        const infoX = padding
        let infoY = topOffset + dim.logoH + 16

        // TAG (large bold)
        ctx.fillStyle = "#1a2744"
        ctx.font = `bold ${dim.fontSize + 6}px Inter, system-ui, sans-serif`
        ctx.fillText(equipamento.tag, infoX, infoY)
        infoY += dim.fontSize + 12

        // Type
        ctx.fillStyle = "#475569"
        ctx.font = `${dim.fontSize}px Inter, system-ui, sans-serif`
        ctx.fillText(equipamento.tipo, infoX, infoY)
        infoY += dim.fontSize + 6

        // Brand + Model
        ctx.fillStyle = "#1a2744"
        ctx.font = `600 ${dim.fontSize}px Inter, system-ui, sans-serif`
        ctx.fillText(`${equipamento.marca} ${equipamento.modelo}`, infoX, infoY)
        infoY += dim.fontSize + 6

        // BTU + Fluido
        ctx.fillStyle = "#475569"
        ctx.font = `${dim.fontSize}px Inter, system-ui, sans-serif`
        const btuText = `${(equipamento.capacidadeBtu / 1000).toFixed(0)}k BTU | ${equipamento.fluido}`
        ctx.fillText(btuText, infoX, infoY)
        infoY += dim.fontSize + 8

        // Separator line
        const maxInfoWidth = qrX - padding - 8
        ctx.strokeStyle = "#E2E8F0"
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(infoX, infoY)
        ctx.lineTo(infoX + maxInfoWidth, infoY)
        ctx.stroke()
        infoY += 8

        // Edificacao
        if (edificacao) {
          ctx.fillStyle = "#64748B"
          ctx.font = `${dim.fontSize - 1}px Inter, system-ui, sans-serif`
          const edNome = edificacao.nome.length > 30 ? edificacao.nome.substring(0, 30) + "..." : edificacao.nome
          ctx.fillText(edNome, infoX, infoY)
          infoY += dim.fontSize + 2
        }

        // Ambiente
        if (ambiente) {
          ctx.fillStyle = "#94A3B8"
          ctx.font = `${dim.fontSize - 1}px Inter, system-ui, sans-serif`
          ctx.fillText(ambiente.nome, infoX, infoY)
        }

        // Status pill (bottom right)
        ctx.font = `600 ${dim.fontSize - 2}px Inter, system-ui, sans-serif`
        const statusW = ctx.measureText(statusText).width + 12
        const pillX = dim.width - padding - statusW
        const pillY = dim.height - padding - dim.fontSize
        ctx.fillStyle = sc.bg
        const pillR = 4
        ctx.beginPath()
        ctx.moveTo(pillX + pillR, pillY - 4)
        ctx.lineTo(pillX + statusW - pillR, pillY - 4)
        ctx.arcTo(pillX + statusW, pillY - 4, pillX + statusW, pillY - 4 + pillR, pillR)
        ctx.lineTo(pillX + statusW, pillY + dim.fontSize - 2 - pillR)
        ctx.arcTo(pillX + statusW, pillY + dim.fontSize - 2, pillX + statusW - pillR, pillY + dim.fontSize - 2, pillR)
        ctx.lineTo(pillX + pillR, pillY + dim.fontSize - 2)
        ctx.arcTo(pillX, pillY + dim.fontSize - 2, pillX, pillY + dim.fontSize - 2 - pillR, pillR)
        ctx.lineTo(pillX, pillY - 4 + pillR)
        ctx.arcTo(pillX, pillY - 4, pillX + pillR, pillY - 4, pillR)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = sc.text
        ctx.fillText(statusText, pillX + 6, pillY + dim.fontSize - 6)
      }
    }

    generateLabel()
  }, [equipamento, edificacao, ambiente, dim, size, isVertical])

  return (
    <canvas
      ref={canvasRef}
      className={`rounded-lg border border-border shadow-sm ${canvasSizeClasses[size]}`}
    />
  )
}

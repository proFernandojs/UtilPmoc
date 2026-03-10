"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type {
  Edificacao,
  Ambiente,
  Equipamento,
  Tecnico,
  PlanoManutencao,
  OrdemServico,
} from "./store"
import {
  demoEdificacoes,
  demoAmbientes,
  demoEquipamentos,
  demoTecnicos,
  demoPlanos,
  demoOrdensServico,
} from "./store"

export type ActivePage = 
  | "dashboard"
  | "edificacoes"
  | "equipamentos"
  | "planos"
  | "tecnicos"
  | "pmoc"
  | "qrcodes"
  | "ordens"

interface AppContextType {
  activePage: ActivePage
  setActivePage: (page: ActivePage) => void
  
  edificacoes: Edificacao[]
  ambientes: Ambiente[]
  equipamentos: Equipamento[]
  tecnicos: Tecnico[]
  planos: PlanoManutencao[]
  ordensServico: OrdemServico[]

  addEdificacao: (e: Edificacao) => void
  addAmbiente: (a: Ambiente) => void
  addEquipamento: (e: Equipamento) => void
  addTecnico: (t: Tecnico) => void
  addPlano: (p: PlanoManutencao) => void
  addOrdemServico: (o: OrdemServico) => void
  updateOrdemServico: (id: string, updates: Partial<OrdemServico>) => void
  updatePlano: (id: string, updates: Partial<PlanoManutencao>) => void

  removeEdificacao: (id: string) => void
  removeEquipamento: (id: string) => void
  removeTecnico: (id: string) => void
  removePlano: (id: string) => void

  selectedEdificacaoId: string | null
  setSelectedEdificacaoId: (id: string | null) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activePage, setActivePage] = useState<ActivePage>("dashboard")
  const [edificacoes, setEdificacoes] = useState<Edificacao[]>(demoEdificacoes)
  const [ambientes, setAmbientes] = useState<Ambiente[]>(demoAmbientes)
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>(demoEquipamentos)
  const [tecnicos, setTecnicos] = useState<Tecnico[]>(demoTecnicos)
  const [planos, setPlanos] = useState<PlanoManutencao[]>(demoPlanos)
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>(demoOrdensServico)
  const [selectedEdificacaoId, setSelectedEdificacaoId] = useState<string | null>(null)

  const addEdificacao = useCallback((e: Edificacao) => setEdificacoes(prev => [...prev, e]), [])
  const addAmbiente = useCallback((a: Ambiente) => setAmbientes(prev => [...prev, a]), [])
  const addEquipamento = useCallback((e: Equipamento) => setEquipamentos(prev => [...prev, e]), [])
  const addTecnico = useCallback((t: Tecnico) => setTecnicos(prev => [...prev, t]), [])
  const addPlano = useCallback((p: PlanoManutencao) => setPlanos(prev => [...prev, p]), [])
  const addOrdemServico = useCallback((o: OrdemServico) => setOrdensServico(prev => [...prev, o]), [])
  const updatePlano = useCallback((id: string, updates: Partial<PlanoManutencao>) => {
    setPlanos(prev => prev.map(plano => plano.id === id ? { ...plano, ...updates } : plano))
  }, [])
  const updateOrdemServico = useCallback((id: string, updates: Partial<OrdemServico>) => {
    setOrdensServico(prev => prev.map(ordem => ordem.id === id ? { ...ordem, ...updates } : ordem))
  }, [])

  const removeEdificacao = useCallback((id: string) => setEdificacoes(prev => prev.filter(e => e.id !== id)), [])
  const removeEquipamento = useCallback((id: string) => setEquipamentos(prev => prev.filter(e => e.id !== id)), [])
  const removeTecnico = useCallback((id: string) => setTecnicos(prev => prev.filter(t => t.id !== id)), [])
  const removePlano = useCallback((id: string) => setPlanos(prev => prev.filter(p => p.id !== id)), [])

  return (
    <AppContext.Provider
      value={{
        activePage, setActivePage,
        edificacoes, ambientes, equipamentos, tecnicos, planos, ordensServico,
        addEdificacao, addAmbiente, addEquipamento, addTecnico, addPlano, addOrdemServico, updateOrdemServico, updatePlano,
        removeEdificacao, removeEquipamento, removeTecnico, removePlano,
        selectedEdificacaoId, setSelectedEdificacaoId,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

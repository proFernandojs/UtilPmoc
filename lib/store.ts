// Types for the PMOC application
export interface Edificacao {
  id: string
  nome: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  cnpj: string
  responsavel: string
  telefone: string
  email: string
  createdAt: string
}

export interface Ambiente {
  id: string
  edificacaoId: string
  nome: string
  andar: string
  area: number // m²
  ocupacaoMaxima: number
  atividade: string
}

export interface Equipamento {
  id: string
  edificacaoId: string
  ambienteId: string
  tag: string
  tipo: 'Split' | 'Split Hi-Wall' | 'Split Piso-Teto' | 'Split Cassete' | 'Split Duto' | 'VRF' | 'Self-Contained' | 'Chiller' | 'Fancoil' | 'ACJ' | 'Outro'
  marca: string
  modelo: string
  capacidadeBtu: number
  potenciaKw: number
  fluido: string
  dataInstalacao: string
  garantia: string
  status: 'Ativo' | 'Inativo' | 'Manutencao'
  localizacao: string
}

export interface Tecnico {
  id: string
  nome: string
  crea: string
  especialidade: string
  telefone: string
  email: string
  empresa: string
  art: string // Anotação de Responsabilidade Técnica
}

export interface PlanoManutencao {
  id: string
  edificacaoId: string
  equipamentoId: string
  tecnicoId: string
  atividade: string
  periodicidade: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual'
  ultimaExecucao: string
  proximaExecucao: string
  status: 'Pendente' | 'Em Dia' | 'Atrasado' | 'Executado'
  observacoes: string
}

export interface OrdemServico {
  id: string
  planoId: string
  equipamentoId: string
  tecnicoId: string
  tipo: 'Preventiva' | 'Corretiva'
  dataAbertura: string
  dataConclusao: string
  status: 'Aberta' | 'Em Andamento' | 'Concluida' | 'Cancelada'
  descricao: string
  observacoes: string
}

// Demo data
export const demoEdificacoes: Edificacao[] = [
  {
    id: "ed-001",
    nome: "Edificio Corporativo Central",
    endereco: "Av. Paulista, 1000",
    cidade: "Sao Paulo",
    estado: "SP",
    cep: "01310-100",
    cnpj: "12.345.678/0001-90",
    responsavel: "Carlos Silva",
    telefone: "(11) 3456-7890",
    email: "carlos@empresa.com.br",
    createdAt: "2024-01-15"
  },
  {
    id: "ed-002",
    nome: "Shopping Center Norte",
    endereco: "Rua Augusta, 500",
    cidade: "Sao Paulo",
    estado: "SP",
    cep: "01305-000",
    cnpj: "98.765.432/0001-10",
    responsavel: "Maria Santos",
    telefone: "(11) 2345-6789",
    email: "maria@shopping.com.br",
    createdAt: "2024-02-10"
  },
  {
    id: "ed-003",
    nome: "Hospital Sao Lucas",
    endereco: "Rua da Consolacao, 200",
    cidade: "Sao Paulo",
    estado: "SP",
    cep: "01302-000",
    cnpj: "11.222.333/0001-44",
    responsavel: "Dr. Joao Pereira",
    telefone: "(11) 4567-8901",
    email: "joao@hospital.com.br",
    createdAt: "2024-03-05"
  }
]

export const demoAmbientes: Ambiente[] = [
  { id: "amb-001", edificacaoId: "ed-001", nome: "Recepcao", andar: "Terreo", area: 120, ocupacaoMaxima: 30, atividade: "Atendimento" },
  { id: "amb-002", edificacaoId: "ed-001", nome: "Escritorio 1o Andar", andar: "1o Andar", area: 250, ocupacaoMaxima: 50, atividade: "Administrativo" },
  { id: "amb-003", edificacaoId: "ed-001", nome: "Sala de Reunioes", andar: "2o Andar", area: 60, ocupacaoMaxima: 20, atividade: "Reunioes" },
  { id: "amb-004", edificacaoId: "ed-001", nome: "CPD", andar: "Subsolo", area: 40, ocupacaoMaxima: 5, atividade: "Data Center" },
  { id: "amb-005", edificacaoId: "ed-002", nome: "Praca de Alimentacao", andar: "Terreo", area: 800, ocupacaoMaxima: 300, atividade: "Alimentacao" },
  { id: "amb-006", edificacaoId: "ed-002", nome: "Loja Ancora 1", andar: "1o Andar", area: 400, ocupacaoMaxima: 100, atividade: "Comercio" },
  { id: "amb-007", edificacaoId: "ed-003", nome: "UTI", andar: "3o Andar", area: 200, ocupacaoMaxima: 20, atividade: "Hospitalar" },
  { id: "amb-008", edificacaoId: "ed-003", nome: "Centro Cirurgico", andar: "2o Andar", area: 150, ocupacaoMaxima: 10, atividade: "Hospitalar" },
]

export const demoEquipamentos: Equipamento[] = [
  { id: "eq-001", edificacaoId: "ed-001", ambienteId: "amb-001", tag: "AC-REC-001", tipo: "Split Hi-Wall", marca: "Daikin", modelo: "FTX60", capacidadeBtu: 60000, potenciaKw: 5.2, fluido: "R-410A", dataInstalacao: "2023-06-15", garantia: "2025-06-15", status: "Ativo", localizacao: "Recepcao - Parede Leste" },
  { id: "eq-002", edificacaoId: "ed-001", ambienteId: "amb-002", tag: "AC-ESC-001", tipo: "VRF", marca: "LG", modelo: "ARUN100LTE5", capacidadeBtu: 100000, potenciaKw: 10.5, fluido: "R-410A", dataInstalacao: "2023-03-20", garantia: "2026-03-20", status: "Ativo", localizacao: "Escritorio 1o Andar" },
  { id: "eq-003", edificacaoId: "ed-001", ambienteId: "amb-003", tag: "AC-REU-001", tipo: "Split Cassete", marca: "Carrier", modelo: "42BQA036", capacidadeBtu: 36000, potenciaKw: 3.5, fluido: "R-22", dataInstalacao: "2020-01-10", garantia: "2023-01-10", status: "Manutencao", localizacao: "Sala de Reunioes - Teto" },
  { id: "eq-004", edificacaoId: "ed-001", ambienteId: "amb-004", tag: "AC-CPD-001", tipo: "Split Duto", marca: "Daikin", modelo: "FBQ125", capacidadeBtu: 48000, potenciaKw: 4.8, fluido: "R-410A", dataInstalacao: "2023-09-01", garantia: "2026-09-01", status: "Ativo", localizacao: "CPD - Subsolo" },
  { id: "eq-005", edificacaoId: "ed-001", ambienteId: "amb-004", tag: "AC-CPD-002", tipo: "Split Duto", marca: "Daikin", modelo: "FBQ125", capacidadeBtu: 48000, potenciaKw: 4.8, fluido: "R-410A", dataInstalacao: "2023-09-01", garantia: "2026-09-01", status: "Ativo", localizacao: "CPD - Subsolo" },
  { id: "eq-006", edificacaoId: "ed-002", ambienteId: "amb-005", tag: "AC-PA-001", tipo: "Self-Contained", marca: "Hitachi", modelo: "RPC100", capacidadeBtu: 300000, potenciaKw: 30.0, fluido: "R-407C", dataInstalacao: "2022-11-20", garantia: "2025-11-20", status: "Ativo", localizacao: "Praca de Alimentacao" },
  { id: "eq-007", edificacaoId: "ed-002", ambienteId: "amb-006", tag: "AC-LJ-001", tipo: "Split Piso-Teto", marca: "Fujitsu", modelo: "ABBF45", capacidadeBtu: 45000, potenciaKw: 4.2, fluido: "R-410A", dataInstalacao: "2023-05-15", garantia: "2025-05-15", status: "Ativo", localizacao: "Loja Ancora 1" },
  { id: "eq-008", edificacaoId: "ed-003", ambienteId: "amb-007", tag: "AC-UTI-001", tipo: "Fancoil", marca: "Trane", modelo: "TWE120", capacidadeBtu: 120000, potenciaKw: 12.0, fluido: "R-134a", dataInstalacao: "2023-01-10", garantia: "2026-01-10", status: "Ativo", localizacao: "UTI - 3o Andar" },
  { id: "eq-009", edificacaoId: "ed-003", ambienteId: "amb-008", tag: "AC-CC-001", tipo: "Fancoil", marca: "Trane", modelo: "TWE080", capacidadeBtu: 80000, potenciaKw: 8.5, fluido: "R-134a", dataInstalacao: "2023-01-10", garantia: "2026-01-10", status: "Ativo", localizacao: "Centro Cirurgico - 2o Andar" },
  { id: "eq-010", edificacaoId: "ed-001", ambienteId: "amb-002", tag: "AC-ESC-002", tipo: "Split Hi-Wall", marca: "Samsung", modelo: "AR24", capacidadeBtu: 24000, potenciaKw: 2.2, fluido: "R-32", dataInstalacao: "2024-02-01", garantia: "2027-02-01", status: "Ativo", localizacao: "Escritorio 1o Andar - Sala B" },
]

export const demoTecnicos: Tecnico[] = [
  { id: "tec-001", nome: "Eng. Ricardo Mendes", crea: "SP-123456/D", especialidade: "Engenharia Mecanica", telefone: "(11) 99876-5432", email: "ricardo@climaeng.com.br", empresa: "Clima Engenharia Ltda", art: "ART-2024-001234" },
  { id: "tec-002", nome: "Eng. Fernanda Costa", crea: "SP-654321/D", especialidade: "Engenharia Mecanica", telefone: "(11) 98765-4321", email: "fernanda@artech.com.br", empresa: "ArTech Solucoes", art: "ART-2024-005678" },
  { id: "tec-003", nome: "Tec. Paulo Oliveira", crea: "SP-111222/T", especialidade: "Tecnico em Refrigeracao", telefone: "(11) 97654-3210", email: "paulo@refritec.com.br", empresa: "RefriTec Servicos", art: "ART-2024-009012" },
]

export const demoPlanos: PlanoManutencao[] = [
  { id: "pm-001", edificacaoId: "ed-001", equipamentoId: "eq-001", tecnicoId: "tec-001", atividade: "Limpeza de filtros e verificacao geral", periodicidade: "Mensal", ultimaExecucao: "2025-01-15", proximaExecucao: "2025-02-15", status: "Em Dia", observacoes: "" },
  { id: "pm-002", edificacaoId: "ed-001", equipamentoId: "eq-002", tecnicoId: "tec-001", atividade: "Verificacao de carga de gas e pressoes", periodicidade: "Trimestral", ultimaExecucao: "2024-12-20", proximaExecucao: "2025-03-20", status: "Em Dia", observacoes: "" },
  { id: "pm-003", edificacaoId: "ed-001", equipamentoId: "eq-003", tecnicoId: "tec-002", atividade: "Limpeza da serpentina e bandeja de condensado", periodicidade: "Semestral", ultimaExecucao: "2024-07-10", proximaExecucao: "2025-01-10", status: "Atrasado", observacoes: "Equipamento com fluido R-22, prever troca" },
  { id: "pm-004", edificacaoId: "ed-001", equipamentoId: "eq-004", tecnicoId: "tec-001", atividade: "Verificacao completa - ambiente critico", periodicidade: "Mensal", ultimaExecucao: "2025-01-20", proximaExecucao: "2025-02-20", status: "Em Dia", observacoes: "CPD - manter temperatura 22C +/- 1C" },
  { id: "pm-005", edificacaoId: "ed-002", equipamentoId: "eq-006", tecnicoId: "tec-003", atividade: "Manutencao preventiva completa", periodicidade: "Mensal", ultimaExecucao: "2024-12-10", proximaExecucao: "2025-01-10", status: "Atrasado", observacoes: "" },
  { id: "pm-006", edificacaoId: "ed-003", equipamentoId: "eq-008", tecnicoId: "tec-002", atividade: "Verificacao de filtros HEPA e parametros criticos", periodicidade: "Mensal", ultimaExecucao: "2025-01-25", proximaExecucao: "2025-02-25", status: "Pendente", observacoes: "Ambiente hospitalar - exige filtros HEPA" },
  { id: "pm-007", edificacaoId: "ed-003", equipamentoId: "eq-009", tecnicoId: "tec-002", atividade: "Verificacao de parametros e limpeza", periodicidade: "Mensal", ultimaExecucao: "2025-01-25", proximaExecucao: "2025-02-25", status: "Pendente", observacoes: "Centro Cirurgico - maximo rigor" },
  { id: "pm-008", edificacaoId: "ed-001", equipamentoId: "eq-005", tecnicoId: "tec-001", atividade: "Verificacao completa - ambiente critico", periodicidade: "Mensal", ultimaExecucao: "2025-01-20", proximaExecucao: "2025-02-20", status: "Em Dia", observacoes: "CPD - equipamento redundante" },
]

export const demoOrdensServico: OrdemServico[] = [
  { id: "os-001", planoId: "pm-001", equipamentoId: "eq-001", tecnicoId: "tec-001", tipo: "Preventiva", dataAbertura: "2025-01-15", dataConclusao: "2025-01-15", status: "Concluida", descricao: "Limpeza de filtros realizada", observacoes: "Filtros em bom estado" },
  { id: "os-002", planoId: "pm-003", equipamentoId: "eq-003", tecnicoId: "tec-002", tipo: "Corretiva", dataAbertura: "2025-01-12", dataConclusao: "", status: "Em Andamento", descricao: "Equipamento com baixa refrigeracao", observacoes: "Necessario recarga de gas R-22" },
  { id: "os-003", planoId: "pm-005", equipamentoId: "eq-006", tecnicoId: "tec-003", tipo: "Preventiva", dataAbertura: "2025-01-10", dataConclusao: "", status: "Aberta", descricao: "Manutencao preventiva mensal", observacoes: "" },
  { id: "os-004", planoId: "pm-004", equipamentoId: "eq-004", tecnicoId: "tec-001", tipo: "Preventiva", dataAbertura: "2025-01-20", dataConclusao: "2025-01-20", status: "Concluida", descricao: "Verificacao completa CPD", observacoes: "Temperatura estavel em 22C" },
]

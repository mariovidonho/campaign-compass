export type StatusCampanha = 'ativa' | 'pausada' | 'concluida';
export type StatusUpload = 'sucesso' | 'erro' | 'parcial';

export interface Campanha {
  id: string;
  nome_campanha: string;
  status: StatusCampanha;
  data_inicio: string;
  data_fim: string | null;
  gasto_total: number;
  leads_gerados: number;
  conversoes: number;
  receita_gerada: number;
  created_at: string;
  updated_at: string;
}

export interface Configuracoes {
  id: string;
  meta_mensal: number;
  alerta_cpl: number;
  budget_total: number;
  created_at: string;
  updated_at: string;
}

export interface HistoricoUpload {
  id: string;
  nome_arquivo: string;
  total_registros: number;
  data_upload: string;
  status: StatusUpload;
  detalhes_erro: string | null;
}

export interface CampanhaComMetricas extends Campanha {
  cpl: number;
  roi: number;
  taxa_conversao: number;
}

export type PeriodoFiltro = 'hoje' | '7dias' | '30dias' | 'customizado';

export interface FiltroData {
  periodo: PeriodoFiltro;
  dataInicio?: Date;
  dataFim?: Date;
}

export interface CSVRow {
  nome_campanha: string;
  status: string;
  data_inicio: string;
  data_fim?: string;
  gasto_total: string;
  leads_gerados: string;
  conversoes: string;
  receita_gerada: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

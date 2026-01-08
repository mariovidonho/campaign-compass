import { Campanha, CampanhaComMetricas } from '@/types';

export function calcularCPL(gastoTotal: number, leadsGerados: number): number {
  if (leadsGerados === 0) return 0;
  return gastoTotal / leadsGerados;
}

export function calcularROI(receitaGerada: number, gastoTotal: number): number {
  if (gastoTotal === 0) return 0;
  return ((receitaGerada - gastoTotal) / gastoTotal) * 100;
}

export function calcularTaxaConversao(conversoes: number, leadsGerados: number): number {
  if (leadsGerados === 0) return 0;
  return (conversoes / leadsGerados) * 100;
}

export function adicionarMetricas(campanha: Campanha): CampanhaComMetricas {
  return {
    ...campanha,
    cpl: calcularCPL(campanha.gasto_total, campanha.leads_gerados),
    roi: calcularROI(campanha.receita_gerada, campanha.gasto_total),
    taxa_conversao: calcularTaxaConversao(campanha.conversoes, campanha.leads_gerados),
  };
}

export function calcularMetricasGerais(campanhas: CampanhaComMetricas[]) {
  const totalGasto = campanhas.reduce((acc, c) => acc + c.gasto_total, 0);
  const totalLeads = campanhas.reduce((acc, c) => acc + c.leads_gerados, 0);
  const totalConversoes = campanhas.reduce((acc, c) => acc + c.conversoes, 0);
  const totalReceita = campanhas.reduce((acc, c) => acc + c.receita_gerada, 0);

  return {
    totalGasto,
    totalLeads,
    cplMedio: calcularCPL(totalGasto, totalLeads),
    roiTotal: calcularROI(totalReceita, totalGasto),
    taxaConversaoMedia: calcularTaxaConversao(totalConversoes, totalLeads),
    totalReceita,
    totalConversoes,
  };
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function formatarPorcentagem(valor: number): string {
  return `${valor.toFixed(1)}%`;
}

export function formatarNumero(valor: number): string {
  return new Intl.NumberFormat('pt-BR').format(valor);
}

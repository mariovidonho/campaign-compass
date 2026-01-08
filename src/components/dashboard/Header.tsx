import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart3, Settings, CalendarIcon, Download } from 'lucide-react';
import { FiltroData, PeriodoFiltro } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { CampanhaComMetricas } from '@/types';
import { formatarMoeda, formatarPorcentagem } from '@/lib/calculations';

interface HeaderProps {
  filtro: FiltroData;
  onFiltroChange: (filtro: FiltroData) => void;
  onOpenAdmin: () => void;
  campanhas: CampanhaComMetricas[];
}

export function Header({ filtro, onFiltroChange, onOpenAdmin, campanhas }: HeaderProps) {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: filtro.dataInicio,
    to: filtro.dataFim,
  });

  const periodos: { value: PeriodoFiltro; label: string }[] = [
    { value: 'hoje', label: 'Hoje' },
    { value: '7dias', label: '7 dias' },
    { value: '30dias', label: '30 dias' },
    { value: 'customizado', label: 'Customizado' },
  ];

  const handlePeriodoClick = (periodo: PeriodoFiltro) => {
    if (periodo === 'customizado') return;
    onFiltroChange({ periodo });
  };

  const handleDateSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    if (range.from && range.to) {
      onFiltroChange({
        periodo: 'customizado',
        dataInicio: range.from,
        dataFim: range.to,
      });
    }
  };

  const exportarRelatorio = (tipo: 'csv' | 'xlsx') => {
    const dados = campanhas.map((c) => ({
      'Nome da Campanha': c.nome_campanha,
      'Status': c.status,
      'Data Início': c.data_inicio,
      'Data Fim': c.data_fim || '',
      'Gasto Total': c.gasto_total,
      'Leads Gerados': c.leads_gerados,
      'Conversões': c.conversoes,
      'Receita Gerada': c.receita_gerada,
      'CPL': c.cpl.toFixed(2),
      'ROI (%)': c.roi.toFixed(1),
      'Taxa Conversão (%)': c.taxa_conversao.toFixed(1),
    }));

    const dataAtual = format(new Date(), 'yyyy-MM-dd');
    const nomeArquivo = `relatorio_campanhas_${dataAtual}`;

    if (tipo === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(dados);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Campanhas');
      XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
    } else {
      const ws = XLSX.utils.json_to_sheet(dados);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${nomeArquivo}.csv`;
      link.click();
    }
  };

  return (
    <header className="border-b bg-card px-6 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Dashboard de Métricas</h1>
            <p className="text-sm text-muted-foreground">Análise de campanhas publicitárias</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filters */}
          <div className="flex rounded-lg border bg-muted p-1">
            {periodos.slice(0, 3).map((p) => (
              <Button
                key={p.value}
                variant={filtro.periodo === p.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handlePeriodoClick(p.value)}
                className={cn(
                  'rounded-md text-xs',
                  filtro.periodo === p.value && 'shadow-sm'
                )}
              >
                {p.label}
              </Button>
            ))}
            
            {/* Custom Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={filtro.periodo === 'customizado' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-md text-xs"
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {filtro.periodo === 'customizado' && filtro.dataInicio && filtro.dataFim
                    ? `${format(filtro.dataInicio, 'dd/MM', { locale: ptBR })} - ${format(filtro.dataFim, 'dd/MM', { locale: ptBR })}`
                    : 'Customizado'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateSelect as any}
                  numberOfMonths={2}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Export Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2" align="end">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => exportarRelatorio('csv')}
              >
                Exportar CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => exportarRelatorio('xlsx')}
              >
                Exportar Excel
              </Button>
            </PopoverContent>
          </Popover>

          {/* Admin Button */}
          <Button onClick={onOpenAdmin} className="gradient-primary">
            <Settings className="mr-2 h-4 w-4" />
            Área ADM
          </Button>
        </div>
      </div>
    </header>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { CampanhaComMetricas, Configuracoes } from '@/types';
import { formatarMoeda } from '@/lib/calculations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartsProps {
  campanhas: CampanhaComMetricas[];
  configuracoes?: Configuracoes;
  isLoading?: boolean;
}

function ChartSkeleton() {
  return (
    <Card className="card-shadow">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

export function Charts({ campanhas, configuracoes, isLoading }: ChartsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  const alertaCPL = configuracoes?.alerta_cpl ?? 50;

  // Data for spend evolution chart
  const gastosData = campanhas
    .map((c) => ({
      data: format(new Date(c.data_inicio), 'dd/MM', { locale: ptBR }),
      gasto: c.gasto_total,
      nome: c.nome_campanha,
    }))
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  // Data for leads by campaign (top 10)
  const leadsData = [...campanhas]
    .sort((a, b) => b.leads_gerados - a.leads_gerados)
    .slice(0, 10)
    .map((c) => ({
      nome: c.nome_campanha.length > 15 ? c.nome_campanha.slice(0, 15) + '...' : c.nome_campanha,
      leads: c.leads_gerados,
    }));

  // Data for CPL comparison (sorted by CPL)
  const cplData = campanhas
    .filter((c) => c.leads_gerados > 0)
    .sort((a, b) => a.cpl - b.cpl)
    .map((c) => ({
      nome: c.nome_campanha.length > 12 ? c.nome_campanha.slice(0, 12) + '...' : c.nome_campanha,
      cpl: c.cpl,
      isAboveAlert: c.cpl > alertaCPL,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'gasto' || entry.name === 'cpl' 
                ? formatarMoeda(entry.value)
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spend Evolution */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Evolução do Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={gastosData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="data" className="text-xs" />
                <YAxis 
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} 
                  className="text-xs"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="gasto"
                  name="gasto"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leads by Campaign */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Leads por Campanha (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="nome" type="category" width={100} className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="leads"
                  fill="hsl(var(--success))"
                  radius={[0, 4, 4, 0]}
                  name="leads"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* CPL Comparison */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-lg">
            CPL por Campanha
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (Linha vermelha: Alerta CPL {formatarMoeda(alertaCPL)})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cplData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="nome" className="text-xs" angle={-45} textAnchor="end" height={80} />
              <YAxis tickFormatter={(value) => `R$ ${value}`} className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={alertaCPL}
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Bar
                dataKey="cpl"
                name="cpl"
                radius={[4, 4, 0, 0]}
                fill="hsl(var(--success))"
              >
                {cplData.map((entry, index) => (
                  <Bar
                    key={`bar-${index}`}
                    dataKey="cpl"
                    fill={entry.isAboveAlert ? 'hsl(var(--destructive))' : 'hsl(var(--success))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

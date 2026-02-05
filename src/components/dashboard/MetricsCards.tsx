import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Users, Target, TrendingUp, ArrowUpRight, ArrowDownRight, Percent } from 'lucide-react';
import { formatarMoeda, formatarPorcentagem, formatarNumero, calcularMetricasGerais } from '@/lib/calculations';
import { CampanhaComMetricas, Configuracoes } from '@/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricsCardsProps {
  campanhas: CampanhaComMetricas[];
  configuracoes?: Configuracoes;
  isLoading?: boolean;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  iconBgClass?: string;
}

function MetricCard({ icon, label, value, change, changeLabel, iconBgClass = 'bg-primary/10' }: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="card-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', iconBgClass)}>
            {icon}
          </div>
          {change !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {changeLabel && (
            <p className="mt-1 text-xs text-muted-foreground">{changeLabel}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCardSkeleton() {
  return (
    <Card className="card-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-8 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricsCards({ campanhas, configuracoes, isLoading }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const metricas = calcularMetricasGerais(campanhas);
  const budgetUsado = configuracoes
    ? (metricas.totalGasto / configuracoes.budget_total) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          label="Total Gasto"
          value={formatarMoeda(metricas.totalGasto)}
          iconBgClass="bg-primary/10"
        />
        <MetricCard
          icon={<Users className="h-6 w-6 text-success" />}
          label="Total de Leads"
          value={formatarNumero(metricas.totalLeads)}
          iconBgClass="bg-success/10"
        />
        <MetricCard
          icon={<Target className="h-6 w-6 text-warning" />}
          label="CPL Médio Geral"
          value={formatarMoeda(metricas.cplMedio)}
          iconBgClass="bg-warning/10"
        />
        <MetricCard
          icon={<TrendingUp className="h-6 w-6 text-primary" />}
          label="ROI Total"
          value={formatarPorcentagem(metricas.roiTotal)}
          iconBgClass="bg-primary/10"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          icon={<Percent className="h-6 w-6 text-success" />}
          label="Taxa de Conversão Média"
          value={formatarPorcentagem(metricas.taxaConversaoMedia)}
          iconBgClass="bg-success/10"
        />
        
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {budgetUsado.toFixed(1)}% usado
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">Budget Utilizado</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {formatarMoeda(metricas.totalGasto)}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  de {configuracoes ? formatarMoeda(configuracoes.budget_total) : 'R$ 0'}
                </span>
              </p>
              <Progress value={Math.min(budgetUsado, 100)} className="mt-3" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

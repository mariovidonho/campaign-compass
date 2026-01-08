import { Card, CardContent } from '@/components/ui/card';
import { Trophy, AlertTriangle, TrendingUp } from 'lucide-react';
import { CampanhaComMetricas, Configuracoes } from '@/types';
import { formatarMoeda } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';

interface InsightsProps {
  campanhas: CampanhaComMetricas[];
  configuracoes?: Configuracoes;
  isLoading?: boolean;
}

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: 'success' | 'warning' | 'info';
}

function InsightCard({ icon, title, description, variant }: InsightCardProps) {
  const bgColors = {
    success: 'bg-success/10 border-success/20',
    warning: 'bg-warning/10 border-warning/20',
    info: 'bg-primary/10 border-primary/20',
  };

  return (
    <Card className={`border ${bgColors[variant]}`}>
      <CardContent className="flex items-start gap-4 p-4">
        <div className="shrink-0">{icon}</div>
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function Insights({ campanhas, configuracoes, isLoading }: InsightsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const alertaCPL = configuracoes?.alerta_cpl ?? 50;

  // Find best campaign (lowest CPL with leads)
  const campanhasComLeads = campanhas.filter((c) => c.leads_gerados > 0);
  const melhorCampanha = campanhasComLeads.length > 0
    ? [...campanhasComLeads].sort((a, b) => a.cpl - b.cpl)[0]
    : null;

  // Count campaigns with high CPL
  const campanhasAlertaCPL = campanhasComLeads.filter((c) => c.cpl > alertaCPL);

  // Calculate trend (comparing first half vs second half of period)
  const metade = Math.floor(campanhas.length / 2);
  const primeiraMetade = campanhas.slice(0, metade);
  const segundaMetade = campanhas.slice(metade);
  
  const gastosPrimeira = primeiraMetade.reduce((acc, c) => acc + c.gasto_total, 0);
  const gastosSegunda = segundaMetade.reduce((acc, c) => acc + c.gasto_total, 0);
  
  const tendenciaGastos = gastosPrimeira > 0
    ? ((gastosSegunda - gastosPrimeira) / gastosPrimeira) * 100
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {melhorCampanha && (
        <InsightCard
          icon={<Trophy className="h-6 w-6 text-success" />}
          title={`🏆 Melhor Campanha: ${melhorCampanha.nome_campanha}`}
          description={`CPL de ${formatarMoeda(melhorCampanha.cpl)} - o mais baixo do período`}
          variant="success"
        />
      )}

      <InsightCard
        icon={<AlertTriangle className="h-6 w-6 text-warning" />}
        title={`⚠️ ${campanhasAlertaCPL.length} campanhas com CPL alto`}
        description={`Acima de ${formatarMoeda(alertaCPL)} - considere otimizar essas campanhas`}
        variant="warning"
      />

      <InsightCard
        icon={<TrendingUp className="h-6 w-6 text-primary" />}
        title={`📈 Tendência de Gastos`}
        description={
          tendenciaGastos >= 0
            ? `Gasto aumentou ${tendenciaGastos.toFixed(1)}% vs início do período`
            : `Gasto diminuiu ${Math.abs(tendenciaGastos).toFixed(1)}% vs início do período`
        }
        variant="info"
      />
    </div>
  );
}

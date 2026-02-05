import { useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { CampaignTable } from '@/components/dashboard/CampaignTable';
import { Charts } from '@/components/dashboard/Charts';
import { Insights } from '@/components/dashboard/Insights';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { useCampanhas, useDeletarCampanha } from '@/hooks/useCampanhas';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { FiltroData, CampanhaComMetricas } from '@/types';
import { toast } from 'sonner';

const Index = () => {
  const [filtro, setFiltro] = useState<FiltroData>({ periodo: '90dias' });
  const [adminOpen, setAdminOpen] = useState(false);
  const [editingCampanha, setEditingCampanha] = useState<CampanhaComMetricas | null>(null);

  const { data: campanhas = [], isLoading: loadingCampanhas } = useCampanhas(filtro);
  const { data: configuracoes, isLoading: loadingConfig } = useConfiguracoes();
  const deletarCampanha = useDeletarCampanha();

  const handleEdit = (campanha: CampanhaComMetricas) => {
    setEditingCampanha(campanha);
    setAdminOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletarCampanha.mutateAsync(id);
      toast.success('Campanha excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir campanha');
    }
  };

  const isLoading = loadingCampanhas || loadingConfig;

  return (
    <div className="min-h-screen bg-background">
      <Header
        filtro={filtro}
        onFiltroChange={setFiltro}
        onOpenAdmin={() => setAdminOpen(true)}
        campanhas={campanhas}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <MetricsCards
          campanhas={campanhas}
          configuracoes={configuracoes}
          isLoading={isLoading}
        />

        <CampaignTable
          campanhas={campanhas}
          configuracoes={configuracoes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        <Charts
          campanhas={campanhas}
          configuracoes={configuracoes}
          isLoading={isLoading}
        />

        <Insights
          campanhas={campanhas}
          configuracoes={configuracoes}
          isLoading={isLoading}
        />
      </main>

      <AdminPanel
        open={adminOpen}
        onClose={() => { setAdminOpen(false); setEditingCampanha(null); }}
        editingCampanha={editingCampanha}
        onClearEdit={() => setEditingCampanha(null)}
      />
    </div>
  );
};

export default Index;

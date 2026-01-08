import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, PlusCircle, History, Settings, List } from 'lucide-react';
import { UploadCSV } from './UploadCSV';
import { AddCampaignForm } from './AddCampaignForm';
import { UploadHistory } from './UploadHistory';
import { SettingsForm } from './SettingsForm';
import { ManageCampaigns } from './ManageCampaigns';
import { CampanhaComMetricas } from '@/types';

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
  editingCampanha?: CampanhaComMetricas | null;
  onClearEdit: () => void;
}

export function AdminPanel({ open, onClose, editingCampanha, onClearEdit }: AdminPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Área Administrativa</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={editingCampanha ? 'adicionar' : 'upload'} className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload CSV</span>
            </TabsTrigger>
            <TabsTrigger value="adicionar" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
            <TabsTrigger value="gerenciar" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Gerenciar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <UploadCSV />
          </TabsContent>
          <TabsContent value="adicionar" className="mt-6">
            <AddCampaignForm campanha={editingCampanha} onSuccess={() => { onClearEdit(); }} />
          </TabsContent>
          <TabsContent value="historico" className="mt-6">
            <UploadHistory />
          </TabsContent>
          <TabsContent value="config" className="mt-6">
            <SettingsForm />
          </TabsContent>
          <TabsContent value="gerenciar" className="mt-6">
            <ManageCampaigns />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

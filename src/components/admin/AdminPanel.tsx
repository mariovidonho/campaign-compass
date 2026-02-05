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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold">Área Administrativa</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={editingCampanha ? 'adicionar' : 'upload'} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-5 p-4 bg-muted/50">
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

          <div className="flex-1 overflow-y-auto p-6 pt-2">
            <TabsContent value="upload" className="mt-0 outline-none">
              <UploadCSV />
            </TabsContent>
            <TabsContent value="adicionar" className="mt-0 outline-none">
              <AddCampaignForm campanha={editingCampanha} onSuccess={() => { onClearEdit(); }} />
            </TabsContent>
            <TabsContent value="historico" className="mt-0 outline-none">
              <UploadHistory />
            </TabsContent>
            <TabsContent value="config" className="mt-0 outline-none">
              <SettingsForm />
            </TabsContent>
            <TabsContent value="gerenciar" className="mt-0 outline-none">
              <ManageCampaigns />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { useConfiguracoes, useAtualizarConfiguracoes } from '@/hooks/useConfiguracoes';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function SettingsForm() {
  const { data: config, isLoading } = useConfiguracoes();
  const atualizar = useAtualizarConfiguracoes();

  const form = useForm({
    defaultValues: { meta_mensal: 50000, alerta_cpl: 50, budget_total: 100000 },
  });

  useEffect(() => {
    if (config) {
      form.reset({
        meta_mensal: config.meta_mensal,
        alerta_cpl: config.alerta_cpl,
        budget_total: config.budget_total,
      });
    }
  }, [config, form]);

  const onSubmit = async (data: any) => {
    if (!config) return;
    try {
      await atualizar.mutateAsync({ id: config.id, ...data });
      toast.success('Configurações salvas!');
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  if (isLoading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="meta_mensal" render={({ field }) => (
          <FormItem>
            <FormLabel>Meta Mensal (R$)</FormLabel>
            <FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
            <FormDescription>Valor da meta mensal de faturamento</FormDescription>
          </FormItem>
        )} />
        <FormField control={form.control} name="alerta_cpl" render={({ field }) => (
          <FormItem>
            <FormLabel>Alerta de CPL (R$)</FormLabel>
            <FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
            <FormDescription>Campanhas acima deste valor serão destacadas em vermelho</FormDescription>
          </FormItem>
        )} />
        <FormField control={form.control} name="budget_total" render={({ field }) => (
          <FormItem>
            <FormLabel>Budget Total (R$)</FormLabel>
            <FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
            <FormDescription>Budget total disponível para campanhas</FormDescription>
          </FormItem>
        )} />
        <Button type="submit" disabled={atualizar.isPending} className="w-full gradient-primary">
          {atualizar.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Salvar Configurações
        </Button>
      </form>
    </Form>
  );
}

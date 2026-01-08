import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAdicionarCampanha, useAtualizarCampanha } from '@/hooks/useCampanhas';
import { CampanhaComMetricas, StatusCampanha } from '@/types';
import { toast } from 'sonner';
import { useEffect } from 'react';

const schema = z.object({
  nome_campanha: z.string().min(1, 'Nome é obrigatório'),
  status: z.enum(['ativa', 'pausada', 'concluida']),
  data_inicio: z.date({ required_error: 'Data de início é obrigatória' }),
  data_fim: z.date().optional(),
  gasto_total: z.number().min(0),
  leads_gerados: z.number().int().min(0),
  conversoes: z.number().int().min(0),
  receita_gerada: z.number().min(0),
}).refine((data) => data.conversoes <= data.leads_gerados, {
  message: 'Conversões não pode ser maior que leads',
  path: ['conversoes'],
});

type FormData = z.infer<typeof schema>;

interface AddCampaignFormProps {
  campanha?: CampanhaComMetricas | null;
  onSuccess?: () => void;
}

export function AddCampaignForm({ campanha, onSuccess }: AddCampaignFormProps) {
  const adicionar = useAdicionarCampanha();
  const atualizar = useAtualizarCampanha();
  const isEditing = !!campanha;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome_campanha: '',
      status: 'ativa' as StatusCampanha,
      gasto_total: 0,
      leads_gerados: 0,
      conversoes: 0,
      receita_gerada: 0,
    },
  });

  useEffect(() => {
    if (campanha) {
      form.reset({
        nome_campanha: campanha.nome_campanha,
        status: campanha.status,
        data_inicio: new Date(campanha.data_inicio),
        data_fim: campanha.data_fim ? new Date(campanha.data_fim) : undefined,
        gasto_total: campanha.gasto_total,
        leads_gerados: campanha.leads_gerados,
        conversoes: campanha.conversoes,
        receita_gerada: campanha.receita_gerada,
      });
    }
  }, [campanha, form]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        nome_campanha: data.nome_campanha,
        status: data.status,
        data_inicio: format(data.data_inicio, 'yyyy-MM-dd'),
        data_fim: data.data_fim ? format(data.data_fim, 'yyyy-MM-dd') : null,
        gasto_total: data.gasto_total,
        leads_gerados: data.leads_gerados,
        conversoes: data.conversoes,
        receita_gerada: data.receita_gerada,
      };

      if (isEditing && campanha) {
        await atualizar.mutateAsync({ id: campanha.id, ...payload });
        toast.success('Campanha atualizada!');
      } else {
        await adicionar.mutateAsync(payload);
        toast.success('Campanha criada!');
        form.reset();
      }
      onSuccess?.();
    } catch (error) {
      toast.error('Erro ao salvar campanha');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="nome_campanha" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome da Campanha *</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="pausada">Pausada</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )} />

          <FormField control={form.control} name="data_inicio" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data Início *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                      {field.value ? format(field.value, 'PPP', { locale: ptBR }) : 'Selecione'}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} className="pointer-events-auto" /></PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="gasto_total" render={({ field }) => (
            <FormItem>
              <FormLabel>Gasto Total (R$)</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="leads_gerados" render={({ field }) => (
            <FormItem>
              <FormLabel>Leads Gerados</FormLabel>
              <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="conversoes" render={({ field }) => (
            <FormItem>
              <FormLabel>Conversões</FormLabel>
              <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="receita_gerada" render={({ field }) => (
            <FormItem>
              <FormLabel>Receita Gerada (R$)</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
            </FormItem>
          )} />
        </div>

        <Button type="submit" disabled={adicionar.isPending || atualizar.isPending} className="w-full gradient-primary">
          {(adicionar.isPending || atualizar.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? 'Atualizar Campanha' : 'Salvar Campanha'}
        </Button>
      </form>
    </Form>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Campanha, CampanhaComMetricas, FiltroData, StatusCampanha } from '@/types';
import { adicionarMetricas } from '@/lib/calculations';
import { startOfDay, endOfDay, subDays } from 'date-fns';

function getDateRange(filtro: FiltroData): { start: Date; end: Date } {
  const hoje = new Date();
  
  switch (filtro.periodo) {
    case 'hoje':
      return { start: startOfDay(hoje), end: endOfDay(hoje) };
    case '7dias':
      return { start: startOfDay(subDays(hoje, 7)), end: endOfDay(hoje) };
    case '30dias':
      return { start: startOfDay(subDays(hoje, 30)), end: endOfDay(hoje) };
    case '90dias':
      return { start: startOfDay(subDays(hoje, 90)), end: endOfDay(hoje) };
    case 'customizado':
      return {
        start: filtro.dataInicio ? startOfDay(filtro.dataInicio) : startOfDay(subDays(hoje, 30)),
        end: filtro.dataFim ? endOfDay(filtro.dataFim) : endOfDay(hoje),
      };
    default:
      return { start: startOfDay(subDays(hoje, 30)), end: endOfDay(hoje) };
  }
}

export function useCampanhas(filtro: FiltroData) {
  const { start, end } = getDateRange(filtro);
  
  // Formata datas para YYYY-MM-DD considerando o fuso horário local
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const startStr = formatDate(start);
  const endStr = formatDate(end);

  return useQuery({
    queryKey: ['campanhas', filtro],
    queryFn: async (): Promise<CampanhaComMetricas[]> => {
      const { data, error } = await supabase
        .from('campanhas')
        .select('*')
        .gte('data_inicio', startStr)
        .lte('data_inicio', endStr)
        .order('data_inicio', { ascending: false });
      
      if (error) throw error;
      
      return (data as Campanha[]).map(adicionarMetricas);
    },
  });
}

export function useTodasCampanhas() {
  return useQuery({
    queryKey: ['todas-campanhas'],
    queryFn: async (): Promise<CampanhaComMetricas[]> => {
      const { data, error } = await supabase
        .from('campanhas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data as Campanha[]).map(adicionarMetricas);
    },
  });
}

export function useAdicionarCampanha() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campanha: Omit<Campanha, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('campanhas')
        .insert([campanha])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      queryClient.invalidateQueries({ queryKey: ['todas-campanhas'] });
    },
  });
}

export function useAtualizarCampanha() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...campanha }: Partial<Campanha> & { id: string }) => {
      const { data, error } = await supabase
        .from('campanhas')
        .update(campanha)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      queryClient.invalidateQueries({ queryKey: ['todas-campanhas'] });
    },
  });
}

export function useDeletarCampanha() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campanhas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      queryClient.invalidateQueries({ queryKey: ['todas-campanhas'] });
    },
  });
}

export function useImportarCampanhas() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campanhas: Omit<Campanha, 'id' | 'created_at' | 'updated_at'>[]) => {
      // Tenta inserir as campanhas. O Supabase retornará erro se houver duplicatas baseadas em políticas,
      // mas aqui estamos apenas inserindo.
      const { data, error } = await supabase
        .from('campanhas')
        .insert(campanhas)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Força a atualização de todas as queries relacionadas a campanhas
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      queryClient.invalidateQueries({ queryKey: ['todas-campanhas'] });
    },
  });
}

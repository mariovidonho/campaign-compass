import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Configuracoes } from '@/types';

export function useConfiguracoes() {
  return useQuery({
    queryKey: ['configuracoes'],
    queryFn: async (): Promise<Configuracoes> => {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .limit(1)
        .single();
      
      if (error) throw error;
      return data as Configuracoes;
    },
  });
}

export function useAtualizarConfiguracoes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: Partial<Configuracoes> & { id: string }) => {
      const { id, ...rest } = config;
      const { data, error } = await supabase
        .from('configuracoes')
        .update(rest)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HistoricoUpload, StatusUpload } from '@/types';

export function useHistoricoUploads() {
  return useQuery({
    queryKey: ['historico-uploads'],
    queryFn: async (): Promise<HistoricoUpload[]> => {
      const { data, error } = await supabase
        .from('historico_uploads')
        .select('*')
        .order('data_upload', { ascending: false });
      
      if (error) throw error;
      return data as HistoricoUpload[];
    },
  });
}

export function useRegistrarUpload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (upload: {
      nome_arquivo: string;
      total_registros: number;
      status: StatusUpload;
      detalhes_erro?: string;
    }) => {
      const { data, error } = await supabase
        .from('historico_uploads')
        .insert([upload])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historico-uploads'] });
    },
  });
}

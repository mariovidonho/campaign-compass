import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useHistoricoUploads } from '@/hooks/useHistoricoUploads';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export function UploadHistory() {
  const { data: uploads, isLoading } = useHistoricoUploads();

  if (isLoading) {
    return <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      sucesso: 'bg-success/10 text-success',
      erro: 'bg-destructive/10 text-destructive',
      parcial: 'bg-warning/10 text-warning',
    };
    return styles[status as keyof typeof styles] || '';
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Arquivo</TableHead>
            <TableHead>Registros</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uploads?.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum upload registrado</TableCell></TableRow>
          ) : (
            uploads?.map((upload) => (
              <TableRow key={upload.id}>
                <TableCell>{format(new Date(upload.data_upload), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                <TableCell>{upload.nome_arquivo}</TableCell>
                <TableCell>{upload.total_registros}</TableCell>
                <TableCell><Badge variant="outline" className={getStatusBadge(upload.status)}>{upload.status}</Badge></TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, ArrowUpDown, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { CampanhaComMetricas, Configuracoes } from '@/types';
import { formatarMoeda, formatarPorcentagem } from '@/lib/calculations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CampaignTableProps {
  campanhas: CampanhaComMetricas[];
  configuracoes?: Configuracoes;
  onEdit: (campanha: CampanhaComMetricas) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

type SortField = 'nome_campanha' | 'gasto_total' | 'leads_gerados' | 'cpl' | 'taxa_conversao' | 'roi';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export function CampaignTable({ campanhas, configuracoes, onEdit, onDelete, isLoading }: CampaignTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('nome_campanha');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const alertaCPL = configuracoes?.alerta_cpl ?? 50;

  // Find best and worst campaigns
  const { melhorCampanha, piorCampanha } = useMemo(() => {
    if (campanhas.length === 0) return { melhorCampanha: null, piorCampanha: null };
    
    const campanhasComLeads = campanhas.filter((c) => c.leads_gerados > 0);
    if (campanhasComLeads.length === 0) return { melhorCampanha: null, piorCampanha: null };

    const sorted = [...campanhasComLeads].sort((a, b) => a.cpl - b.cpl);
    return {
      melhorCampanha: sorted[0]?.id,
      piorCampanha: sorted[sorted.length - 1]?.id,
    };
  }, [campanhas]);

  // Filter and sort
  const campanhasFiltradas = useMemo(() => {
    let resultado = campanhas.filter((c) =>
      c.nome_campanha.toLowerCase().includes(search.toLowerCase())
    );

    resultado.sort((a, b) => {
      let valorA: any = a[sortField];
      let valorB: any = b[sortField];

      if (typeof valorA === 'string') {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return valorA > valorB ? 1 : -1;
      }
      return valorA < valorB ? 1 : -1;
    });

    return resultado;
  }, [campanhas, search, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(campanhasFiltradas.length / ITEMS_PER_PAGE);
  const campanhasPaginadas = campanhasFiltradas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ativa: 'bg-success/10 text-success border-success/20',
      pausada: 'bg-warning/10 text-warning border-warning/20',
      concluida: 'bg-muted text-muted-foreground border-muted',
    };
    return styles[status as keyof typeof styles] || styles.concluida;
  };

  const getRowClass = (campanha: CampanhaComMetricas) => {
    const classes = [];
    
    if (campanha.cpl > alertaCPL && campanha.leads_gerados > 0) {
      classes.push('bg-destructive/5');
    }
    if (campanha.id === melhorCampanha) {
      classes.push('ring-2 ring-success/50');
    }
    if (campanha.id === piorCampanha) {
      classes.push('ring-2 ring-destructive/50');
    }
    
    return classes.join(' ');
  };

  if (isLoading) {
    return (
      <Card className="card-shadow">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-semibold">Campanhas</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar campanha..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('nome_campanha')}
                  >
                    <div className="flex items-center gap-2">
                      Nome da Campanha
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead
                    className="cursor-pointer text-right"
                    onClick={() => handleSort('gasto_total')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Gasto
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-right"
                    onClick={() => handleSort('leads_gerados')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Leads
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-right"
                    onClick={() => handleSort('cpl')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      CPL
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-right"
                    onClick={() => handleSort('taxa_conversao')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Taxa Conv.
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-right"
                    onClick={() => handleSort('roi')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      ROI
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campanhasPaginadas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhuma campanha encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  campanhasPaginadas.map((campanha) => (
                    <TableRow key={campanha.id} className={cn('transition-colors', getRowClass(campanha))}>
                      <TableCell className="font-medium">{campanha.nome_campanha}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('capitalize', getStatusBadge(campanha.status))}>
                          {campanha.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(campanha.data_inicio), 'dd/MM/yy', { locale: ptBR })}
                        {campanha.data_fim && (
                          <> → {format(new Date(campanha.data_fim), 'dd/MM/yy', { locale: ptBR })}</>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatarMoeda(campanha.gasto_total)}</TableCell>
                      <TableCell className="text-right">{campanha.leads_gerados}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'font-medium',
                            campanha.cpl > alertaCPL && campanha.leads_gerados > 0 && 'text-destructive'
                          )}
                        >
                          {formatarMoeda(campanha.cpl)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatarPorcentagem(campanha.taxa_conversao)}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'font-medium',
                            campanha.roi >= 0 ? 'text-success' : 'text-destructive'
                          )}
                        >
                          {formatarPorcentagem(campanha.roi)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(campanha)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(campanha.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, campanhasFiltradas.length)} de{' '}
                {campanhasFiltradas.length} campanhas
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

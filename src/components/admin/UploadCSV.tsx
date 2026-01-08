import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { parseCSV, convertCSVRowToCampanha } from '@/lib/csvParser';
import { useImportarCampanhas } from '@/hooks/useCampanhas';
import { useRegistrarUpload } from '@/hooks/useHistoricoUploads';
import { CSVRow, ValidationError } from '@/types';
import { toast } from 'sonner';

export function UploadCSV() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const importarCampanhas = useImportarCampanhas();
  const registrarUpload = useRegistrarUpload();

  const handleFile = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const { data, errors } = await parseCSV(selectedFile);
      setPreview(data.slice(0, 5));
      setErrors(errors);
    } catch (error) {
      toast.error('Erro ao processar arquivo');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.txt'))) {
      handleFile(droppedFile);
    } else {
      toast.error('Por favor, selecione um arquivo CSV ou TXT');
    }
  }, [handleFile]);

  const handleImport = async () => {
    if (!file || errors.length > 0) return;
    
    try {
      const { data } = await parseCSV(file);
      const campanhas = data.map(convertCSVRowToCampanha);
      await importarCampanhas.mutateAsync(campanhas);
      await registrarUpload.mutateAsync({
        nome_arquivo: file.name,
        total_registros: campanhas.length,
        status: 'sucesso',
      });
      toast.success(`${campanhas.length} campanhas importadas com sucesso!`);
      setFile(null);
      setPreview([]);
      setErrors([]);
    } catch (error) {
      await registrarUpload.mutateAsync({
        nome_arquivo: file.name,
        total_registros: 0,
        status: 'erro',
        detalhes_erro: String(error),
      });
      toast.error('Erro ao importar campanhas');
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-muted'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Arraste seu arquivo CSV aqui</p>
          <p className="text-sm text-muted-foreground mb-4">ou</p>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
            id="csv-upload"
          />
          <Button variant="outline" asChild>
            <label htmlFor="csv-upload" className="cursor-pointer">Escolher Arquivo</label>
          </Button>
        </CardContent>
      </Card>

      {/* File Selected */}
      {file && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{file.name} ({preview.length} registros de prévia)</span>
            {errors.length === 0 ? (
              <span className="flex items-center text-success"><CheckCircle className="h-4 w-4 mr-1" /> Válido</span>
            ) : (
              <span className="flex items-center text-destructive"><XCircle className="h-4 w-4 mr-1" /> {errors.length} erros</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1">
              {errors.slice(0, 5).map((e, i) => (
                <li key={i}>Linha {e.row}: {e.field} - {e.message}</li>
              ))}
              {errors.length > 5 && <li>... e mais {errors.length - 5} erros</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Table */}
      {preview.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="font-medium mb-3">Prévia (primeiros 5 registros):</p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Gasto</TableHead>
                    <TableHead>Leads</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.nome_campanha}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.data_inicio}</TableCell>
                      <TableCell>{row.gasto_total}</TableCell>
                      <TableCell>{row.leads_gerados}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Button */}
      {file && (
        <Button
          onClick={handleImport}
          disabled={errors.length > 0 || importarCampanhas.isPending}
          className="w-full gradient-primary"
        >
          {importarCampanhas.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Confirmar Importação
        </Button>
      )}
    </div>
  );
}

import Papa from 'papaparse';
import { CSVRow, ValidationError, StatusCampanha } from '@/types';

const STATUS_VALIDOS: StatusCampanha[] = ['ativa', 'pausada', 'concluida'];

const COLUMN_MAP: Record<string, keyof CSVRow> = {
  'nome_campanha': 'nome_campanha',
  'campanha': 'nome_campanha',
  'nome': 'nome_campanha',
  'status': 'status',
  'data_inicio': 'data_inicio',
  'inicio': 'data_inicio',
  'data': 'data_inicio',
  'data_fim': 'data_fim',
  'fim': 'data_fim',
  'gasto_total': 'gasto_total',
  'gasto': 'gasto_total',
  'investimento': 'gasto_total',
  'leads_gerados': 'leads_gerados',
  'leads': 'leads_gerados',
  'conversoes': 'conversoes',
  'conversões': 'conversoes',
  'receita_gerada': 'receita_gerada',
  'receita': 'receita_gerada',
  'faturamento': 'receita_gerada',
};

export function parseCSV(file: File): Promise<{ data: CSVRow[]; errors: ValidationError[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      delimitersToGuess: [',', ';', '\t', '|'],
      transformHeader: (header) => {
        const normalized = header.toLowerCase().trim()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
          .replace(/\s+/g, '_');
        return COLUMN_MAP[normalized] || normalized;
      },
      complete: (results) => {
        // Filtra linhas vazias que o greedy pode ter deixado passar
        const data = (results.data as any[]).filter(row => 
          Object.values(row).some(val => val !== null && val !== undefined && String(val).trim() !== '')
        ) as CSVRow[];
        const errors = validateCSVData(data);
        resolve({ data, errors });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function validateCSVData(data: CSVRow[]): ValidationError[] {
  const errors: ValidationError[] = [];

  data.forEach((row, index) => {
    const rowNum = index + 2; // +2 because of header and 0-index

    // Validate nome_campanha
    if (!row.nome_campanha || row.nome_campanha.trim() === '') {
      errors.push({ row: rowNum, field: 'nome_campanha', message: 'Nome da campanha é obrigatório' });
    }

    // Validate status
    const statusNormalized = row.status?.toLowerCase().trim();
    if (!statusNormalized || !STATUS_VALIDOS.includes(statusNormalized as StatusCampanha)) {
      errors.push({ row: rowNum, field: 'status', message: 'Status deve ser: ativa, pausada ou concluida' });
    }

    // Validate data_inicio
    if (!row.data_inicio) {
      errors.push({ row: rowNum, field: 'data_inicio', message: 'Data de início é obrigatória' });
    } else if (!isValidDate(row.data_inicio)) {
      errors.push({ row: rowNum, field: 'data_inicio', message: 'Data de início inválida (use YYYY-MM-DD)' });
    }

    // Validate data_fim if provided
    if (row.data_fim && row.data_fim.trim() !== '' && !isValidDate(row.data_fim)) {
      errors.push({ row: rowNum, field: 'data_fim', message: 'Data de fim inválida (use YYYY-MM-DD)' });
    }

    // Validate dates order
    if (row.data_inicio && row.data_fim && isValidDate(row.data_inicio) && isValidDate(row.data_fim)) {
      if (new Date(row.data_fim) < new Date(row.data_inicio)) {
        errors.push({ row: rowNum, field: 'data_fim', message: 'Data de fim deve ser após data de início' });
      }
    }

    // Validate numeric fields
    if (row.gasto_total && !isValidNumber(row.gasto_total)) {
      errors.push({ row: rowNum, field: 'gasto_total', message: 'Gasto total deve ser um número válido' });
    }

    if (row.leads_gerados && !isValidInteger(row.leads_gerados)) {
      errors.push({ row: rowNum, field: 'leads_gerados', message: 'Leads gerados deve ser um número inteiro' });
    }

    if (row.conversoes && !isValidInteger(row.conversoes)) {
      errors.push({ row: rowNum, field: 'conversoes', message: 'Conversões deve ser um número inteiro' });
    }

    if (row.receita_gerada && !isValidNumber(row.receita_gerada)) {
      errors.push({ row: rowNum, field: 'receita_gerada', message: 'Receita gerada deve ser um número válido' });
    }

    // Validate leads >= conversoes
    const leads = parseInt(row.leads_gerados) || 0;
    const conversoes = parseInt(row.conversoes) || 0;
    if (conversoes > leads) {
      errors.push({ row: rowNum, field: 'conversoes', message: 'Conversões não pode ser maior que leads gerados' });
    }

    // Validate non-negative values
    if (parseFloat(cleanNumericString(row.gasto_total)) < 0) {
      errors.push({ row: rowNum, field: 'gasto_total', message: 'Gasto total não pode ser negativo' });
    }
  });

  return errors;
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

function cleanNumericString(value: string): string {
  if (value === null || value === undefined) return "0";
  const str = String(value).trim();
  if (str === "") return "0";
  
  // Se tiver vírgula e ponto, assumimos que o ponto é milhar e a vírgula é decimal (padrão BR)
  // Se tiver apenas vírgula, trocamos por ponto
  // Removemos tudo que não seja dígito, ponto, vírgula ou sinal de menos
  let cleaned = str.replace(/[^\d.,-]/g, '');
  
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Caso 1.234,56 -> 1234.56
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    // Caso 1234,56 -> 1234.56
    cleaned = cleaned.replace(',', '.');
  }
  
  return cleaned;
}

function isValidNumber(value: string): boolean {
  if (!value || value.trim() === '') return true;
  const num = parseFloat(cleanNumericString(value));
  return !isNaN(num);
}

function isValidInteger(value: string): boolean {
  if (!value || value.trim() === '') return true;
  const cleaned = cleanNumericString(value);
  const num = parseFloat(cleaned);
  return !isNaN(num) && Number.isInteger(num);
}

export function convertCSVRowToCampanha(row: CSVRow) {
  return {
    nome_campanha: String(row.nome_campanha || '').trim(),
    status: (String(row.status || 'ativa').toLowerCase().trim()) as StatusCampanha,
    data_inicio: String(row.data_inicio || '').trim(),
    data_fim: row.data_fim && String(row.data_fim).trim() !== '' ? String(row.data_fim).trim() : null,
    gasto_total: parseFloat(cleanNumericString(String(row.gasto_total))) || 0,
    leads_gerados: parseInt(cleanNumericString(String(row.leads_gerados))) || 0,
    conversoes: parseInt(cleanNumericString(String(row.conversoes))) || 0,
    receita_gerada: parseFloat(cleanNumericString(String(row.receita_gerada))) || 0,
  };
}

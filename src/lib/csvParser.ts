import Papa from 'papaparse';
import { CSVRow, ValidationError, StatusCampanha } from '@/types';

const STATUS_VALIDOS: StatusCampanha[] = ['ativa', 'pausada', 'concluida'];

export function parseCSV(file: File): Promise<{ data: CSVRow[]; errors: ValidationError[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors = validateCSVData(results.data);
        resolve({ data: results.data, errors });
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
    if (parseFloat(row.gasto_total) < 0) {
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

function isValidNumber(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num);
}

function isValidInteger(value: string): boolean {
  const num = parseInt(value);
  return !isNaN(num) && num === parseFloat(value);
}

export function convertCSVRowToCampanha(row: CSVRow) {
  return {
    nome_campanha: row.nome_campanha.trim(),
    status: row.status.toLowerCase().trim() as StatusCampanha,
    data_inicio: row.data_inicio.trim(),
    data_fim: row.data_fim?.trim() || null,
    gasto_total: parseFloat(row.gasto_total) || 0,
    leads_gerados: parseInt(row.leads_gerados) || 0,
    conversoes: parseInt(row.conversoes) || 0,
    receita_gerada: parseFloat(row.receita_gerada) || 0,
  };
}

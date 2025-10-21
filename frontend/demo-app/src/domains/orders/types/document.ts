/**
 * Document types for order documents
 */

import { ID, Nullable } from '../../../shared/types/common';

// Order document types matching backend enum
export enum OrderDocumentType {
  T1 = 'T1',
  MIO = 'MIO',
  SAD = 'SAD',
  CMR = 'CMR',
  Label = 'Label',
  Other = 'Other',
  Invoice = 'Invoice',
  Pictures = 'Pictures',
  PackingList = 'Packing list',
  MovingReport = 'Moving report',
  LoadingChart = 'Loading chart',
  ThreePLFourPL = '3PL/4PL',
  BillOfLoading = 'Bill og loading',
  DeviationReport = 'Deviation report',
  ExportDocuments = 'Export documents',
  OffLoadingChart = 'Off loading chart',
  CompanyPlukkList = 'owner plukk list',
  PlukkListScanned = 'Plukk list scanned',
  ExcelListForPlukk = 'Excel list for plukk',
}

// OrderDocument matching backend model structure
export interface OrderDocument {
  id: ID;
  src: string;
  type: OrderDocumentType;
  title: Nullable<string>;
  order_id: ID;
  thumbnail: Nullable<string>;
  created_at: string;
}

export interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface DocumentUploadResponse {
  document: OrderDocument;
  message: string;
}

export interface BatchUploadResponse {
  documents: OrderDocument[];
  failed: Array<{
    filename: string;
    error: string;
  }>;
  message: string;
}

import { Finding, FindingsSummary } from "./models";

export interface ExtractedText {
  fileRef: string;
  pages: PageText[];
}

export interface PageText {
  pageNumber: number;
  content: string;
  regions: TextRegion[];
}

export interface TextRegion {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface RenderedPage {
  pageNumber: number;
  imageDataUrl: string;
  width: number;
  height: number;
}

export interface FileMetadata {
  fileRef: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  pageCount: number;
  createdAt: string;
  modifiedAt: string;
  producer: string | null;
  author: string | null;
}

export interface TextDiff {
  pageNumber: number;
  masterText: string;
  supplierText: string;
  location: string;
  confidence: number;
}

export interface MetadataDiff {
  field: string;
  masterValue: string;
  supplierValue: string;
}

export interface VisualDiff {
  pageNumber: number;
  region: { x: number; y: number; width: number; height: number };
  differenceScore: number;
  description: string;
}

/**
 * Abstract comparison engine interface.
 * Implementations can use OCR, PDF parsing, AI vision, or any combination.
 * The UI layer is decoupled from this — it only consumes Finding[] results.
 */
export interface ComparisonEngine {
  extractText(fileRef: string): Promise<ExtractedText>;
  renderPages(fileRef: string): Promise<RenderedPage[]>;
  compareText(
    master: ExtractedText,
    supplier: ExtractedText
  ): Promise<TextDiff[]>;
  compareDocumentMetadata(
    master: FileMetadata,
    supplier: FileMetadata
  ): Promise<MetadataDiff[]>;
  compareVisualRegions(
    masterPages: RenderedPage[],
    supplierPages: RenderedPage[]
  ): Promise<VisualDiff[]>;
  generateFindingsSummary(findings: Finding[]): Promise<FindingsSummary>;
}


/**
 * Type definitions for PDF.js library
 * These are simplified versions of the actual types
 */

export interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
  getMetadata(): Promise<{ info: Record<string, any>; metadata: any }>;
  destroy(): Promise<void>;
}

export interface PDFPageProxy {
  getViewport(options: { scale: number }): PDFPageViewport;
  getTextContent(): Promise<TextContent>;
  render(renderContext: RenderContext): { promise: Promise<void> };
}

export interface PDFPageViewport {
  width: number;
  height: number;
  transform: number[];
  clone(options: { scale: number }): PDFPageViewport;
}

export interface TextContent {
  items: TextItem[];
  styles: Record<string, any>;
}

export interface TextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName?: string;
  fontSize?: number;
}

export interface RenderContext {
  canvasContext: CanvasRenderingContext2D;
  viewport: PDFPageViewport;
}

export interface PageContent {
  items: TextItem[];
  page: number;
  pageObj: PDFPageProxy;
}

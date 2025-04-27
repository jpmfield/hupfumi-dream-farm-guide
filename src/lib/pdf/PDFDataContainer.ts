
import { PDFDocumentProxy, PageContent, PDFPageProxy } from './types/pdf-js-types';

/**
 * Types for the PDF data container
 */
export type PDFSource = File | string;

export interface IndexEntry {
  text: string;
  position: number;
  page: number;
  sectionTitle?: string;
  id: string;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

export type PDFIndex = Map<string, IndexEntry>;

export interface ContainerConfig {
  enableWorker?: boolean;
  maxIndexSize?: number;
  headingTags?: string[];
  sectionMinLength?: number;
  pdfJsPath?: string;
}

export interface IndexResult {
  totalEntries: number;
  totalSections: number;
  metadata: PDFMetadata;
}

export interface NavigationOptions {
  className?: string;
  activeClassName?: string;
  scrollBehavior?: ScrollBehavior;
}

/**
 * PDFDataContainer - Core class for PDF processing, indexing and navigation
 */
export class PDFDataContainer {
  private pdfSource: PDFSource | null = null;
  private pdfDocument: PDFDocumentProxy | null = null;
  private index: PDFIndex = new Map();
  private metadata: PDFMetadata = {};
  private sections: IndexEntry[] = [];
  private config: Required<ContainerConfig>;
  private worker: Worker | null = null;
  private pdfJS: any | null = null;

  /**
   * Default configuration values
   */
  private static DEFAULT_CONFIG: Required<ContainerConfig> = {
    enableWorker: true,
    maxIndexSize: 10000,
    headingTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    sectionMinLength: 50,
    pdfJsPath: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
  };

  /**
   * Constructor for PDFDataContainer
   * @param config Configuration options
   */
  constructor(config: ContainerConfig = {}) {
    this.config = { ...PDFDataContainer.DEFAULT_CONFIG, ...config };
  }

  /**
   * Loads the PDF.js library dynamically
   * @private
   */
  private async loadPDFJS(): Promise<void> {
    if (this.pdfJS) return;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = this.config.pdfJsPath;
      script.onload = () => {
        // PDF.js is loaded at this point
        this.pdfJS = window['pdfjs-dist/build/pdf'];
        
        if (this.config.enableWorker) {
          this.pdfJS.GlobalWorkerOptions.workerSrc = this.config.pdfJsPath.replace('/pdf.min.js', '/pdf.worker.min.js');
        } else {
          this.pdfJS.GlobalWorkerOptions.workerSrc = '';
        }
        
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load PDF.js library'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Load a PDF from file or URL
   * @param source PDF file or URL
   */
  public async loadPDF(source: PDFSource): Promise<void> {
    this.pdfSource = source;
    await this.loadPDFJS();
    
    try {
      if (typeof source === 'string') {
        // Load from URL
        this.pdfDocument = await this.pdfJS.getDocument(source).promise;
      } else {
        // Load from File
        const arrayBuffer = await source.arrayBuffer();
        this.pdfDocument = await this.pdfJS.getDocument(arrayBuffer).promise;
      }
      
      await this.extractMetadata();
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error(`Failed to load PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract metadata from the PDF document
   * @private
   */
  private async extractMetadata(): Promise<void> {
    if (!this.pdfDocument) throw new Error('No PDF document loaded');
    
    try {
      const metadataObj = await this.pdfDocument.getMetadata();
      const info = metadataObj.info || {};
      
      this.metadata = {
        title: info.Title,
        author: info.Author,
        subject: info.Subject,
        keywords: info.Keywords,
        creationDate: info.CreationDate ? new Date(info.CreationDate) : undefined,
        modificationDate: info.ModDate ? new Date(info.ModDate) : undefined
      };
    } catch (error) {
      console.warn('Could not extract PDF metadata:', error);
    }
  }

  /**
   * Extract text content from a specific page
   * @param pageNum Page number (1-based)
   * @private
   */
  private async extractPageText(pageNum: number): Promise<PageContent> {
    if (!this.pdfDocument) throw new Error('No PDF document loaded');
    
    try {
      const page = await this.pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      return {
        items: textContent.items,
        page: pageNum,
        pageObj: page
      };
    } catch (error) {
      console.error(`Error extracting text from page ${pageNum}:`, error);
      throw new Error(`Failed to extract text from page ${pageNum}`);
    }
  }

  /**
   * Build index from the loaded PDF document
   */
  public async buildIndex(): Promise<IndexResult> {
    if (!this.pdfDocument) throw new Error('No PDF document loaded');
    
    // Reset existing index
    this.index = new Map();
    this.sections = [];
    
    const numPages = this.pdfDocument.numPages;
    let entryCount = 0;
    let sectionCount = 0;
    
    // Process all pages
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const pageContent = await this.extractPageText(pageNum);
      const { items } = pageContent;
      
      let currentSection: IndexEntry | null = null;
      let currentText = '';
      let position = 0;
      
      // Process text items on the page
      for (const item of items) {
        // Typical text item from PDF.js
        if ('str' in item) {
          const text = item.str.trim();
          
          if (text) {
            // Detect if this could be a heading (short text with larger font)
            const isSectionHeading = this.detectSectionHeading(item);
            
            if (isSectionHeading) {
              // Finish previous section if any
              if (currentSection && currentText.length >= this.config.sectionMinLength) {
                currentSection.text = currentText;
                this.sections.push(currentSection);
                this.indexText(currentText, currentSection);
                sectionCount++;
              }
              
              // Start a new section
              const sectionId = `section-${pageNum}-${position}`;
              currentSection = {
                text: '',
                sectionTitle: text,
                position,
                page: pageNum,
                id: sectionId
              };
              
              currentText = '';
            } else {
              // Add to current section
              if (!currentSection) {
                const sectionId = `section-${pageNum}-${position}`;
                currentSection = {
                  text: '',
                  position,
                  page: pageNum,
                  id: sectionId
                };
              }
              
              currentText += text + ' ';
            }
            
            position += text.length;
            entryCount++;
            
            // Check if we're exceeding the max index size
            if (entryCount > this.config.maxIndexSize) {
              console.warn(`Reached maximum index size (${this.config.maxIndexSize}), stopping indexing`);
              break;
            }
          }
        }
      }
      
      // Add the last section on the page
      if (currentSection && currentText.length > 0) {
        currentSection.text = currentText;
        this.sections.push(currentSection);
        this.indexText(currentText, currentSection);
        sectionCount++;
      }
    }
    
    return {
      totalEntries: entryCount,
      totalSections: sectionCount,
      metadata: this.metadata
    };
  }

  /**
   * Detect if an item is likely a section heading
   * @param item Text item from PDF.js
   * @private
   */
  private detectSectionHeading(item: any): boolean {
    // This is a simplified heuristic - in real implementation
    // we would do more sophisticated heading detection
    if ('fontName' in item && 'fontSize' in item) {
      const isBold = item.fontName.toLowerCase().includes('bold');
      const isLargeFont = item.fontSize >= 12; // Arbitrary threshold
      const isShortText = item.str.length < 100; // Section titles tend to be short
      
      return (isBold || isLargeFont) && isShortText;
    }
    return false;
  }

  /**
   * Index text content for searching
   * @param text Text to index
   * @param entry Index entry reference
   * @private
   */
  private indexText(text: string, entry: IndexEntry): void {
    // Simple tokenization - split by spaces and remove punctuation
    const tokens = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2); // Filter out very short words
    
    // Add each token to the index
    for (const token of tokens) {
      this.index.set(token, entry);
    }
  }

  /**
   * Search the index for matching content
   * @param query Search query
   */
  public search(query: string): IndexEntry[] {
    if (!query || query.trim().length === 0) {
      return [];
    }
    
    const results = new Map<string, IndexEntry>();
    const terms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);
    
    for (const term of terms) {
      const entry = this.index.get(term);
      if (entry) {
        results.set(entry.id, entry);
      }
    }
    
    return Array.from(results.values());
  }

  /**
   * Generate navigation elements for the indexed sections
   * @param targetElement Optional HTML element to append navigation to
   * @param options Navigation display options
   */
  public generateNavigation(
    targetElement?: HTMLElement,
    options: NavigationOptions = {}
  ): HTMLElement {
    const navElement = document.createElement('nav');
    navElement.className = options.className || 'pdf-navigation';
    
    // Create container for buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'pdf-nav-buttons';
    
    // Add buttons for each section
    for (const section of this.sections) {
      const button = document.createElement('button');
      button.textContent = section.sectionTitle || `Page ${section.page}`;
      button.className = 'pdf-nav-button';
      button.dataset.sectionId = section.id;
      button.dataset.page = String(section.page);
      button.dataset.position = String(section.position);
      
      // Add click handler
      button.addEventListener('click', () => {
        this.navigateToSection(section, options.activeClassName, options.scrollBehavior);
      });
      
      buttonContainer.appendChild(button);
    }
    
    navElement.appendChild(buttonContainer);
    
    // Add search functionality
    const searchContainer = document.createElement('div');
    searchContainer.className = 'pdf-search-container';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search PDF...';
    searchInput.className = 'pdf-search-input';
    
    const searchButton = document.createElement('button');
    searchButton.textContent = 'Search';
    searchButton.className = 'pdf-search-button';
    
    const searchResults = document.createElement('div');
    searchResults.className = 'pdf-search-results';
    
    // Add search handler
    searchButton.addEventListener('click', () => {
      const query = searchInput.value;
      const results = this.search(query);
      
      searchResults.innerHTML = '';
      
      if (results.length === 0) {
        const noResults = document.createElement('div');
        noResults.textContent = 'No results found';
        noResults.className = 'pdf-no-results';
        searchResults.appendChild(noResults);
      } else {
        for (const result of results) {
          const resultItem = document.createElement('div');
          resultItem.className = 'pdf-result-item';
          
          // Add snippet of text
          const snippet = this.getSnippet(result.text, query);
          resultItem.innerHTML = `
            <div class="pdf-result-title">
              ${result.sectionTitle || `Page ${result.page}`}
            </div>
            <div class="pdf-result-snippet">${snippet}</div>
          `;
          
          resultItem.addEventListener('click', () => {
            this.navigateToSection(result, options.activeClassName, options.scrollBehavior);
          });
          
          searchResults.appendChild(resultItem);
        }
      }
    });
    
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchButton);
    searchContainer.appendChild(searchResults);
    
    navElement.appendChild(searchContainer);
    
    // Append to target element if provided
    if (targetElement) {
      targetElement.appendChild(navElement);
    }
    
    return navElement;
  }

  /**
   * Extract a text snippet highlighting the search query
   * @param text Full text
   * @param query Search query
   * @private
   */
  private getSnippet(text: string, query: string): string {
    const maxLength = 150;
    const lowercaseText = text.toLowerCase();
    const lowercaseQuery = query.toLowerCase();
    
    const index = lowercaseText.indexOf(lowercaseQuery);
    if (index === -1) {
      // Query not found directly, return beginning of text
      return text.substring(0, maxLength) + '...';
    }
    
    // Calculate snippet range
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + query.length + 50);
    
    let snippet = '';
    if (start > 0) {
      snippet += '...';
    }
    
    snippet += text.substring(start, end);
    
    if (end < text.length) {
      snippet += '...';
    }
    
    // Highlight the query term
    const highlightedSnippet = snippet.replace(
      new RegExp(query, 'gi'),
      match => `<strong>${match}</strong>`
    );
    
    return highlightedSnippet;
  }

  /**
   * Navigate to a specific section in the PDF
   * @param section Section to navigate to
   * @param activeClassName Optional class name for active section
   * @param scrollBehavior Scroll behavior
   * @private
   */
  private async navigateToSection(
    section: IndexEntry,
    activeClassName?: string,
    scrollBehavior: ScrollBehavior = 'smooth'
  ): Promise<void> {
    if (!this.pdfDocument) return;
    
    // For demonstration purposes we'll create/update a viewer div
    // In a real implementation, this would interact with PDF.js viewer
    
    let viewerDiv = document.getElementById('pdf-viewer');
    if (!viewerDiv) {
      viewerDiv = document.createElement('div');
      viewerDiv.id = 'pdf-viewer';
      document.body.appendChild(viewerDiv);
    }
    
    try {
      // Create canvas for the page if it doesn't exist
      const pageId = `pdf-page-${section.page}`;
      let pageCanvas = document.getElementById(pageId) as HTMLCanvasElement;
      
      if (!pageCanvas) {
        pageCanvas = document.createElement('canvas');
        pageCanvas.id = pageId;
        viewerDiv.appendChild(pageCanvas);
        
        // Render the page
        const page = await this.pdfDocument.getPage(section.page);
        const viewport = page.getViewport({ scale: 1.0 });
        
        pageCanvas.height = viewport.height;
        pageCanvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: pageCanvas.getContext('2d')!,
          viewport
        };
        
        await page.render(renderContext).promise;
      }
      
      // Scroll to the page
      pageCanvas.scrollIntoView({ behavior: scrollBehavior });
      
      // Update active button styling if active class provided
      if (activeClassName) {
        const buttons = document.querySelectorAll('.pdf-nav-button');
        buttons.forEach(button => button.classList.remove(activeClassName));
        
        const activeButton = document.querySelector(
          `.pdf-nav-button[data-section-id="${section.id}"]`
        );
        if (activeButton) {
          activeButton.classList.add(activeClassName);
        }
      }
      
    } catch (error) {
      console.error('Error navigating to section:', error);
    }
  }

  /**
   * Get PDF metadata
   */
  public getMetadata(): PDFMetadata {
    return { ...this.metadata };
  }

  /**
   * Get all indexed sections
   */
  public getSections(): ReadonlyArray<IndexEntry> {
    return [...this.sections];
  }

  /**
   * Cleanup resources when container is no longer needed
   */
  public destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    if (this.pdfDocument) {
      this.pdfDocument.destroy();
      this.pdfDocument = null;
    }
    
    this.index.clear();
    this.sections = [];
  }
}

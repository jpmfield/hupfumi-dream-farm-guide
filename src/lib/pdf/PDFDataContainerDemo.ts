
import { PDFDataContainer } from './PDFDataContainer';

/**
 * Demo class showing how to use the PDFDataContainer
 */
export class PDFDataContainerDemo {
  private container: PDFDataContainer;
  private pdfUrl: string;
  private rootElement: HTMLElement;

  constructor(pdfUrl: string, rootElement: HTMLElement) {
    this.container = new PDFDataContainer({
      enableWorker: true
    });
    this.pdfUrl = pdfUrl;
    this.rootElement = rootElement;
  }

  /**
   * Initialize the demo
   */
  public async initialize(): Promise<void> {
    try {
      // Create container elements
      this.createLayout();
      
      // Load and process the PDF
      await this.loadPDF();
      
    } catch (error) {
      console.error('Error in PDF demo:', error);
      this.showError(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Create the demo layout
   * @private
   */
  private createLayout(): void {
    // Clear the root element
    this.rootElement.innerHTML = '';
    
    // Create main container
    const container = document.createElement('div');
    container.className = 'pdf-demo-container';
    container.style.display = 'flex';
    container.style.height = '100%';
    
    // Create sidebar for navigation
    const sidebar = document.createElement('div');
    sidebar.className = 'pdf-sidebar';
    sidebar.id = 'pdf-sidebar';
    sidebar.style.width = '300px';
    sidebar.style.padding = '1rem';
    sidebar.style.borderRight = '1px solid #ccc';
    sidebar.style.overflowY = 'auto';
    sidebar.style.height = '100%';
    
    // Create viewer container
    const viewer = document.createElement('div');
    viewer.className = 'pdf-main-viewer';
    viewer.id = 'pdf-viewer';
    viewer.style.flex = '1';
    viewer.style.padding = '1rem';
    viewer.style.overflow = 'auto';
    viewer.style.height = '100%';
    
    // Create loading indicator
    const loading = document.createElement('div');
    loading.className = 'pdf-loading';
    loading.id = 'pdf-loading';
    loading.textContent = 'Loading PDF...';
    loading.style.padding = '2rem';
    loading.style.textAlign = 'center';
    
    viewer.appendChild(loading);
    container.appendChild(sidebar);
    container.appendChild(viewer);
    this.rootElement.appendChild(container);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .pdf-demo-container {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .pdf-nav-button {
        display: block;
        width: 100%;
        padding: 0.5rem;
        margin-bottom: 0.5rem;
        text-align: left;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
      }
      .pdf-nav-button:hover {
        background: #e5e5e5;
      }
      .pdf-nav-button.active {
        background: #007bff;
        color: white;
      }
      .pdf-search-input {
        width: 70%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px 0 0 4px;
      }
      .pdf-search-button {
        width: 30%;
        padding: 0.5rem;
        background: #007bff;
        color: white;
        border: 1px solid #0069d9;
        border-radius: 0 4px 4px 0;
        cursor: pointer;
      }
      .pdf-search-container {
        margin-bottom: 1rem;
        display: flex;
      }
      .pdf-search-results {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #ddd;
        margin-top: 0.5rem;
      }
      .pdf-result-item {
        padding: 0.5rem;
        border-bottom: 1px solid #ddd;
        cursor: pointer;
      }
      .pdf-result-item:hover {
        background: #f5f5f5;
      }
      .pdf-result-title {
        font-weight: bold;
        margin-bottom: 0.25rem;
      }
      .pdf-result-snippet {
        font-size: 0.9em;
        color: #555;
      }
      .pdf-result-snippet strong {
        background: yellow;
        color: black;
      }
      .pdf-error {
        color: red;
        padding: 1rem;
        border: 1px solid red;
        background: rgba(255,0,0,0.1);
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Load and process the PDF
   * @private
   */
  private async loadPDF(): Promise<void> {
    const loading = document.getElementById('pdf-loading');
    if (loading) {
      loading.textContent = 'Loading PDF...';
    }
    
    try {
      await this.container.loadPDF(this.pdfUrl);
      
      if (loading) {
        loading.textContent = 'Processing PDF content...';
      }
      
      const indexResult = await this.container.buildIndex();
      
      if (loading) {
        loading.textContent = `Indexed ${indexResult.totalSections} sections with ${indexResult.totalEntries} entries`;
      }
      
      // Generate navigation in sidebar
      const sidebar = document.getElementById('pdf-sidebar');
      if (sidebar) {
        this.container.generateNavigation(sidebar, {
          activeClassName: 'active',
          scrollBehavior: 'smooth'
        });
      }
      
      // Display metadata
      const metadata = this.container.getMetadata();
      const metadataDiv = document.createElement('div');
      metadataDiv.className = 'pdf-metadata';
      metadataDiv.innerHTML = `
        <h2>PDF Information</h2>
        <p><strong>Title:</strong> ${metadata.title || 'Unknown'}</p>
        <p><strong>Author:</strong> ${metadata.author || 'Unknown'}</p>
        <p><strong>Pages:</strong> ${await this.getPDFPageCount()}</p>
      `;
      
      const viewer = document.getElementById('pdf-viewer');
      if (viewer) {
        viewer.innerHTML = '';
        viewer.appendChild(metadataDiv);
      }
      
    } catch (error) {
      console.error('Error loading PDF:', error);
      this.showError(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Get the number of pages in the PDF
   * @private
   */
  private async getPDFPageCount(): Promise<number> {
    try {
      // This is a simplified approach
      return this.container.getSections().length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Show an error message
   * @param message Error message
   * @private
   */
  private showError(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'pdf-error';
    errorDiv.textContent = `Error: ${message}`;
    
    const viewer = document.getElementById('pdf-viewer');
    if (viewer) {
      viewer.innerHTML = '';
      viewer.appendChild(errorDiv);
    }
  }
}

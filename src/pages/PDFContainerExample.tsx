
import React, { useEffect, useRef } from 'react';
import { PDFDataContainerDemo } from '../lib/pdf/PDFDataContainerDemo';

const PDFContainerExample: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<PDFDataContainerDemo | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Sample PDF URL - replace with a real PDF URL in production
      const pdfUrl = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
      
      // Initialize demo
      demoRef.current = new PDFDataContainerDemo(pdfUrl, containerRef.current);
      demoRef.current.initialize().catch(error => {
        console.error('Error initializing PDF demo:', error);
      });
    }
    
    // Cleanup
    return () => {
      if (demoRef.current) {
        // If we had a cleanup method in the demo class, we'd call it here
      }
    };
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <h1 className="text-2xl font-bold mb-4">PDF Data Container Demo</h1>
      <p className="mb-4">
        This demo showcases a TypeScript PDF container that loads, indexes, and 
        provides navigation for PDF documents without any UI framework dependencies.
      </p>
      <div 
        ref={containerRef} 
        className="flex-1 border border-gray-300 rounded-md overflow-hidden" 
        style={{ height: 'calc(100vh - 150px)' }}
      />
    </div>
  );
};

export default PDFContainerExample;

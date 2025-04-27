
import React from 'react';

interface PDFPreviewProps {
  fileName: string;
  url: string;
}

const PDFPreview = ({ fileName, url }: PDFPreviewProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">PDF Preview</h2>
      <div className="border rounded-lg overflow-hidden">
        <iframe 
          src={url}
          className="w-full h-[600px]"
          title={fileName}
        />
      </div>
    </div>
  );
};

export default PDFPreview;

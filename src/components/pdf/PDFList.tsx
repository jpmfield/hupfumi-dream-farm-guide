
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2 } from 'lucide-react';

interface PDFFile {
  name: string;
  url: string;
}

interface PDFListProps {
  files: PDFFile[];
  selectedPdf: string | null;
  onSelect: (fileName: string) => void;
  onDelete: (fileName: string) => void;
}

const PDFList = ({ files, selectedPdf, onSelect, onDelete }: PDFListProps) => {
  if (files.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed rounded-lg">
        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No PDFs uploaded yet</p>
        <p className="text-sm text-gray-400 mt-2">Upload a PDF file to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => (
        <Card
          key={file.name}
          className={`p-4 hover:shadow-md transition-shadow ${selectedPdf === file.name ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 truncate">
              <FileText className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <button
                onClick={() => onSelect(file.name)}
                className="text-sm hover:underline truncate max-w-[180px] text-left"
                title={file.name}
              >
                {file.name}
              </button>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(file.url, '_blank')}
                className="text-blue-500 hover:text-blue-700"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(file.name)}
                className="text-red-500 hover:text-red-700"
                title="Delete PDF"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PDFList;


import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { usePDFManager } from '@/hooks/usePDFManager';
import PDFUploader from './pdf/PDFUploader';
import PDFList from './pdf/PDFList';
import PDFPreview from './pdf/PDFPreview';
import PDFErrorAlert from './pdf/PDFErrorAlert';

const PDFManager = () => {
  const {
    files,
    isLoading,
    error,
    selectedPdf,
    isBucketChecking,
    setSelectedPdf,
    fetchPDFs,
    createPdfsBucket,
    handleDelete,
  } = usePDFManager();

  useEffect(() => {
    // Initialize storage only once when component mounts
    createPdfsBucket();
  }, [createPdfsBucket]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <PDFUploader 
          onUploadSuccess={fetchPDFs} 
          isDisabled={!!error?.includes('bucket does not exist')} 
        />
        <Button 
          variant="outline" 
          size="icon"
          onClick={fetchPDFs}
          disabled={isLoading}
          title="Refresh PDF list"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <PDFErrorAlert 
          error={error}
          onCreateBucket={createPdfsBucket}
          isBucketChecking={isBucketChecking}
        />
      )}

      {isLoading ? (
        <div className="text-center p-8">
          <p className="text-gray-500">Loading PDFs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          <PDFList
            files={files}
            selectedPdf={selectedPdf}
            onSelect={setSelectedPdf}
            onDelete={handleDelete}
          />

          {selectedPdf && (
            <PDFPreview
              fileName={selectedPdf}
              url={files.find(f => f.name === selectedPdf)?.url || ''}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PDFManager;

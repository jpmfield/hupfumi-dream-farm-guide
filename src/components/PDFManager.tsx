
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { usePDFManager } from '@/hooks/usePDFManager';
import PDFUploader from './pdf/PDFUploader';
import PDFList from './pdf/PDFList';
import PDFPreview from './pdf/PDFPreview';
import { supabase } from '@/integrations/supabase/client';

const PDFManager = () => {
  const {
    files,
    isLoading,
    error,
    selectedPdf,
    setSelectedPdf,
    fetchPDFs,
    handleDelete,
  } = usePDFManager();

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // First check if bucket exists
        const { data: bucket, error: bucketError } = await supabase.storage.getBucket('pdfs');
        
        if (bucketError && bucketError.message.includes('does not exist')) {
          // Create the bucket if it doesn't exist
          const { data, error: createError } = await supabase.storage.createBucket('pdfs', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['application/pdf']
          });
          
          if (createError) {
            console.error("Error creating bucket:", createError);
            throw createError;
          }
          console.log("PDF bucket created successfully");
        } else if (bucketError) {
          console.error("Error checking bucket:", bucketError);
          throw bucketError;
        }
        
        // Fetch PDFs after confirming/creating bucket
        await fetchPDFs();
      } catch (error) {
        console.error("Storage initialization error:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeStorage();
  }, [fetchPDFs]);

  if (isInitializing) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Initializing PDF storage...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <PDFUploader onUploadSuccess={fetchPDFs} />
        <Button 
          variant="outline" 
          size="icon"
          onClick={fetchPDFs}
          disabled={isLoading}
          title="Refresh PDF list"
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

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

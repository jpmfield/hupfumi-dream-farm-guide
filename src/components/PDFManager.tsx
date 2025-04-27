
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { usePDFManager } from '@/hooks/usePDFManager';
import PDFUploader from './pdf/PDFUploader';
import PDFList from './pdf/PDFList';
import PDFPreview from './pdf/PDFPreview';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Try to list files directly instead of checking bucket existence
        // This approach works because the upload worked, which means the bucket exists
        // but the getBucket endpoint is failing
        const { data, error: listError } = await supabase.storage
          .from('pdfs')
          .list();
          
        if (listError && !listError.message.includes('not found')) {
          console.error("Error listing files during initialization:", listError);
        }
        
        // Even if we get a "not found" error on list, continue with uploads/fetches
        // since the upload endpoint is working correctly
        
        // Fetch PDFs
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

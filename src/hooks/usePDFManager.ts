
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PDFFile {
  name: string;
  url: string;
}

export const usePDFManager = () => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPDFs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Attempting to fetch PDFs from 'pdfs' bucket...");
      
      // Skip bucket validation and go directly to listing files
      // This works because we know the upload endpoint works
      const { data, error: listError } = await supabase.storage
        .from('pdfs')
        .list('', {
          sortBy: { column: 'name', order: 'asc' },
        });

      if (listError) {
        // Only show error for non-404 errors
        if (!listError.message.includes('not found')) {
          console.error('Error listing files:', listError);
          throw listError;
        } else {
          // If it's a 404, treat as empty list (will be resolved by upload)
          console.log("Bucket 'pdfs' not found in listing, but may exist for uploads");
          setFiles([]);
          setIsLoading(false);
          return;
        }
      }
      
      console.log("PDF list response:", data ? `${data.length} files found` : "No data returned");
      
      if (!data || data.length === 0) {
        setFiles([]);
        setIsLoading(false);
        return;
      }

      const fileUrls = await Promise.all(
        data.map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from('pdfs')
            .getPublicUrl(file.name);
          return {
            name: file.name,
            url: publicUrl
          };
        })
      );

      setFiles(fileUrls);
    } catch (error: any) {
      console.error('Error fetching PDFs:', error);
      
      // More detailed error messages
      let errorMessage = error?.message || 'Failed to load PDFs';
      
      if (error?.message?.includes('not found') || error?.message?.includes('does not exist')) {
        // This is a normal state during first use, don't show an error toast
        console.log('PDF bucket not found yet. It will be created on first upload.');
      } else if (error?.message?.includes('permission') || error?.message?.includes('not authorized')) {
        errorMessage = 'Permission denied. The current user does not have access to the PDF bucket.';
        toast({
          variant: "destructive",
          title: "Error fetching PDFs",
          description: errorMessage,
        });
      } else {
        // Only show toast for unexpected errors
        toast({
          variant: "destructive",
          title: "Error fetching PDFs",
          description: errorMessage,
        });
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleDelete = async (fileName: string) => {
    try {
      const { error } = await supabase.storage
        .from('pdfs')
        .remove([fileName]);

      if (error) {
        console.error('Delete error details:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "PDF deleted successfully",
      });

      if (selectedPdf === fileName) {
        setSelectedPdf(null);
      }

      await fetchPDFs();
    } catch (error: any) {
      console.error('Error deleting PDF:', error);
      toast({
        variant: "destructive",
        title: "Error deleting PDF",
        description: error?.message || "Please try again later.",
      });
    }
  };

  return {
    files,
    isLoading,
    error,
    selectedPdf,
    setSelectedPdf,
    fetchPDFs,
    handleDelete,
  };
};

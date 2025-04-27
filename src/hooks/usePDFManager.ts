
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
      
      // First check if we can access the bucket
      const { error: bucketError } = await supabase.storage.getBucket('pdfs');
      
      if (bucketError) {
        console.error('Bucket access error:', bucketError);
        if (bucketError.message.includes('does not exist')) {
          throw new Error(`The "pdfs" bucket does not exist in the Supabase project`);
        }
        throw bucketError;
      }
      
      const { data, error: listError } = await supabase.storage
        .from('pdfs')
        .list('', {
          sortBy: { column: 'name', order: 'asc' },
        });

      if (listError) {
        console.error('Error listing files:', listError);
        throw listError;
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
        errorMessage = 'PDF bucket not found. The "pdfs" bucket may not exist in your Supabase project.';
      } else if (error?.message?.includes('permission') || error?.message?.includes('not authorized')) {
        errorMessage = 'Permission denied. The current user does not have access to the PDF bucket.';
      }
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error fetching PDFs",
        description: errorMessage,
      });
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

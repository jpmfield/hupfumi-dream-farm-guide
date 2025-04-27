
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PDFFile {
  name: string;
  url: string;
}

export const usePDFManager = () => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [isBucketChecking, setIsBucketChecking] = useState(false);
  const { toast } = useToast();

  const createPdfsBucket = async () => {
    setIsBucketChecking(true);
    try {
      const { error: createError } = await supabase.storage.createBucket('pdfs', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        if (!createError.message.includes('duplicate')) {
          throw createError;
        }
      }
      
      toast({
        title: "Success",
        description: "PDF storage bucket is ready to use",
      });
      
      await fetchPDFs();
      setError(null);
    } catch (error: any) {
      console.error('Error creating PDF bucket:', error);
      setError(`Failed to create PDF bucket: ${error.message}`);
      toast({
        variant: "destructive",
        title: "Error creating PDF bucket",
        description: "Please check your Supabase permissions.",
      });
    } finally {
      setIsBucketChecking(false);
    }
  };

  const fetchPDFs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: buckets, error: bucketError } = await supabase.storage
        .listBuckets();
      
      if (bucketError) {
        throw new Error(`Error checking buckets: ${bucketError.message}`);
      }
      
      const pdfBucketExists = buckets?.some(bucket => bucket.name === 'pdfs');
      
      if (!pdfBucketExists) {
        setFiles([]);
        setIsLoading(false);
        setError("The 'pdfs' bucket does not exist in Supabase. Click the button below to create it.");
        return;
      }
      
      const { data, error } = await supabase.storage
        .from('pdfs')
        .list('', {
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
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
      setError(error?.message || 'Failed to load PDFs');
      toast({
        variant: "destructive",
        title: "Error fetching PDFs",
        description: "Please check your Supabase configuration and try again.",
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
    isBucketChecking,
    setSelectedPdf,
    fetchPDFs,
    createPdfsBucket,
    handleDelete,
  };
};

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
      console.log('Checking for pdfs bucket...');
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error('Error listing buckets:', bucketError);
        throw bucketError;
      }
      
      console.log('Available buckets:', buckets?.map(b => b.name));
      const pdfBucketExists = buckets?.some(bucket => bucket.name === 'pdfs');
      
      console.log('PDF bucket exists:', pdfBucketExists);
      
      if (!pdfBucketExists) {
        console.log('pdfs bucket does not exist');
        setError("The 'pdfs' bucket does not exist. You need to create it through the Supabase dashboard.");
        toast({
          variant: "destructive",
          title: "Storage bucket not found",
          description: "Please create a 'pdfs' bucket in your Supabase dashboard.",
        });
      }
    } catch (error: any) {
      console.error('Error checking PDF bucket:', error);
      setError(`Storage error: ${error.message || "Unknown error"}`);
      toast({
        variant: "destructive",
        title: "Storage error",
        description: "Please check your Supabase configuration.",
      });
    } finally {
      setIsBucketChecking(false);
    }
  };

  const fetchPDFs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Checking if pdfs bucket exists...');
      const { data: buckets, error: bucketError } = await supabase.storage
        .listBuckets();
      
      if (bucketError) {
        console.error('Error checking buckets:', bucketError);
        throw new Error(`Error checking buckets: ${bucketError.message}`);
      }
      
      console.log('Available buckets:', buckets?.map(b => b.name));
      const pdfBucketExists = buckets?.some(bucket => bucket.name === 'pdfs');
      
      if (!pdfBucketExists) {
        console.log('pdfs bucket does not exist');
        setFiles([]);
        setIsLoading(false);
        setError("The 'pdfs' bucket does not exist. You need to create it through the Supabase dashboard.");
        return;
      }
      
      console.log('pdfs bucket exists, fetching files...');
      const { data, error } = await supabase.storage
        .from('pdfs')
        .list('', {
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        console.error('Error listing files:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No PDF files found');
        setFiles([]);
        setIsLoading(false);
        return;
      }

      console.log('Found PDF files:', data.length);
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

      console.log('Generated public URLs for files');
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
      console.log('Deleting file:', fileName);
      const { error } = await supabase.storage
        .from('pdfs')
        .remove([fileName]);

      if (error) {
        console.error('Delete error details:', error);
        throw error;
      }

      console.log('File deleted successfully');
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

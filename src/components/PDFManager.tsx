
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const PDFManager = () => {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPDFs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching PDFs from bucket');
      const { data, error } = await supabase.storage
        .from('pdfs')
        .list();

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      console.log('PDFs fetched:', data);
      
      // If data is null or empty, set empty array but don't throw an error
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

  useEffect(() => {
    fetchPDFs();
  }, [fetchPDFs]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      
      // Create a more unique filename to avoid collisions
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileExt = file.name.split('.').pop();
      const originalName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${originalName}_${timestamp}_${randomString}.${fileExt}`;

      console.log(`Uploading file: ${fileName}`);
      
      const { error } = await supabase.storage
        .from('pdfs')
        .upload(fileName, file, {
          // Explicitly set upsert to false to prevent overwriting
          upsert: false,
          contentType: 'application/pdf'
        });

      if (error) {
        console.error('Upload error details:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "PDF uploaded successfully",
      });

      await fetchPDFs();
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      toast({
        variant: "destructive",
        title: "Error uploading PDF",
        description: error?.message || "Please check your permissions and try again.",
      });
    } finally {
      setIsUploading(false);
      // Clear the input field for another upload
      if (event.target) {
        event.target.value = '';
      }
    }
  };

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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          disabled={isUploading}
          className="max-w-sm"
        />
        {isUploading && <span className="text-sm text-gray-500">Uploading...</span>}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <p className="text-sm">
                Please check your Supabase configuration:
              </p>
              <ul className="list-disc pl-5 text-sm mt-1">
                <li>Verify the "pdfs" bucket exists</li>
                <li>Ensure the bucket is public</li>
                <li>Check that the proper storage policies are in place</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center p-8">
          <p className="text-gray-500">Loading PDFs...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {files.map((file) => (
              <div 
                key={file.name}
                className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-500" />
                  <a 
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline truncate max-w-[200px]"
                  >
                    {file.name}
                  </a>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(file.url, '_blank')}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(file.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {files.length === 0 && !error && (
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No PDFs uploaded yet</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PDFManager;


import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Trash2, Download, RefreshCcw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

const PDFManager = () => {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [isBucketChecking, setIsBucketChecking] = useState(false);
  const { toast } = useToast();

  const createPdfsBucket = async () => {
    setIsBucketChecking(true);
    try {
      // Try to create the bucket
      const { error: createError } = await supabase.storage.createBucket('pdfs', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        // If it's not a duplicate error, then it's an actual error
        if (!createError.message.includes('duplicate')) {
          throw createError;
        }
      }
      
      toast({
        title: "Success",
        description: "PDF storage bucket is ready to use",
      });
      
      // Refresh the PDF list after bucket creation
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
      // Check if the bucket exists first
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
      
      // Now list files in the bucket
      const { data, error } = await supabase.storage
        .from('pdfs')
        .list('', {
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
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

      // Validate file type
      if (file.type !== 'application/pdf') {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload only PDF files.",
        });
        return;
      }

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
      
      // Check if error is related to missing bucket
      if (error.message && error.message.includes('bucket') && error.message.toLowerCase().includes('not found')) {
        setError("The 'pdfs' bucket does not exist. Please create it first.");
        toast({
          variant: "destructive",
          title: "Bucket not found",
          description: "Please create the PDF bucket first using the button below.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error uploading PDF",
          description: error?.message || "Please check your permissions and try again.",
        });
      }
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <Input
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            disabled={isUploading || error?.includes('bucket does not exist')}
            className="max-w-sm"
          />
          {isUploading && <span className="text-sm text-gray-500 mt-1 block">Uploading...</span>}
        </div>
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
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <p className="text-sm">
                {error.includes('bucket does not exist') ? (
                  <Button 
                    onClick={createPdfsBucket} 
                    disabled={isBucketChecking} 
                    variant="outline"
                    className="mt-2"
                  >
                    {isBucketChecking ? "Creating bucket..." : "Create PDF Bucket"}
                  </Button>
                ) : (
                  <span>
                    Please check your Supabase configuration:
                    <ul className="list-disc pl-5 text-sm mt-1">
                      <li>Verify the "pdfs" bucket exists</li>
                      <li>Ensure the bucket is public</li>
                      <li>Check that the proper storage policies are in place</li>
                    </ul>
                  </span>
                )}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center p-8">
          <p className="text-gray-500">Loading PDFs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
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
                      onClick={() => setSelectedPdf(file.name)}
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
                      onClick={() => handleDelete(file.name)}
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

          {files.length === 0 && !error && (
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No PDFs uploaded yet</p>
              <p className="text-sm text-gray-400 mt-2">Upload a PDF file to get started</p>
            </div>
          )}

          {selectedPdf && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">PDF Preview</h2>
              <div className="border rounded-lg overflow-hidden">
                <iframe 
                  src={files.find(f => f.name === selectedPdf)?.url} 
                  className="w-full h-[600px]"
                  title={selectedPdf}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PDFManager;

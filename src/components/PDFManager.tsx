
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PDFManager = () => {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const fetchPDFs = useCallback(async () => {
    try {
      const { data, error } = await supabase.storage
        .from('pdfs')
        .list();

      if (error) throw error;

      const fileUrls = await Promise.all(
        (data || []).map(async (file) => {
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
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      toast({
        variant: "destructive",
        title: "Error fetching PDFs",
        description: "Please try again later.",
      });
    }
  }, [toast]);

  React.useEffect(() => {
    fetchPDFs();
  }, [fetchPDFs]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('pdfs')
        .upload(fileName, file);

      if (error) throw error;

      toast({
        title: "Success",
        description: "PDF uploaded successfully",
      });

      await fetchPDFs();
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        variant: "destructive",
        title: "Error uploading PDF",
        description: "Please try again later.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      const { error } = await supabase.storage
        .from('pdfs')
        .remove([fileName]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "PDF deleted successfully",
      });

      await fetchPDFs();
    } catch (error) {
      console.error('Error deleting PDF:', error);
      toast({
        variant: "destructive",
        title: "Error deleting PDF",
        description: "Please try again later.",
      });
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold mb-4">PDF Storage Manager</h1>
          <p className="text-gray-600 mb-4">
            Upload and manage your PDF documents securely in the cloud.
          </p>
        </div>

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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(file.name)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {files.length === 0 && (
          <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No PDFs uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFManager;

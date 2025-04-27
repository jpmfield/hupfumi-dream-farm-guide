
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PDFUploaderProps {
  onUploadSuccess: () => void;
  isDisabled: boolean;
}

const PDFUploader = ({ onUploadSuccess, isDisabled }: PDFUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.type !== 'application/pdf') {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload only PDF files.",
        });
        return;
      }

      setIsUploading(true);
      
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileExt = file.name.split('.').pop();
      const originalName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${originalName}_${timestamp}_${randomString}.${fileExt}`;

      console.log(`Uploading file: ${fileName}`);
      
      const { error } = await supabase.storage
        .from('pdfs')
        .upload(fileName, file, {
          upsert: false,
          contentType: 'application/pdf'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "PDF uploaded successfully",
      });

      onUploadSuccess();
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      
      if (error.message && error.message.includes('bucket') && error.message.toLowerCase().includes('not found')) {
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
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1">
        <Input
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          disabled={isUploading || isDisabled}
          className="max-w-sm"
        />
        {isUploading && <span className="text-sm text-gray-500 mt-1 block">Uploading...</span>}
      </div>
    </div>
  );
};

export default PDFUploader;

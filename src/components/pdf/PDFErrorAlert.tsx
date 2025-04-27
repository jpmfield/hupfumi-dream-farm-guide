
import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface PDFErrorAlertProps {
  error: string;
  onCreateBucket?: () => void;
  isBucketChecking?: boolean;
}

const PDFErrorAlert = ({ error, onCreateBucket, isBucketChecking }: PDFErrorAlertProps) => {
  const [bucketStatus, setBucketStatus] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createPDFBucket = async () => {
    setIsCreating(true);
    setBucketStatus("Attempting to create bucket...");
    
    try {
      // Try to create the bucket if it doesn't exist
      const { data, error: createError } = await supabase.storage.createBucket('pdfs', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['application/pdf']
      });
      
      if (createError) {
        console.error("Error creating bucket:", createError);
        setBucketStatus(`Failed to create bucket: ${createError.message}`);
        return;
      }
      
      setBucketStatus("✅ Bucket created successfully!");
      
      // If onCreateBucket is provided, call it to refresh the parent component
      if (onCreateBucket) {
        onCreateBucket();
      }
    } catch (err: any) {
      console.error("Unexpected error creating bucket:", err);
      setBucketStatus(`Unexpected error: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const checkBucketExists = async () => {
    setBucketStatus("Checking bucket status...");
    
    try {
      const { data, error } = await supabase.storage.getBucket('pdfs');
      
      if (error) {
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          setBucketStatus("Bucket doesn't exist. You can create it now.");
        } else {
          setBucketStatus(`Error checking bucket: ${error.message}`);
        }
        return;
      }
      
      setBucketStatus("✅ Bucket exists and is accessible");
      
      if (onCreateBucket) {
        onCreateBucket();
      }
    } catch (err: any) {
      console.error("Unexpected error checking bucket:", err);
      setBucketStatus(`Unexpected error: ${err.message}`);
    }
  };

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{error}</p>
        
        {error.includes('pdfs') && error.includes('bucket') && (
          <div className="mt-4 space-y-4">
            <p>It appears the PDF bucket may not exist or is inaccessible.</p>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={checkBucketExists} 
                variant="outline"
              >
                Check Bucket Status
              </Button>
              
              <Button 
                onClick={createPDFBucket}
                disabled={isCreating || isBucketChecking} 
                variant="secondary"
              >
                {isCreating ? "Creating..." : "Create PDF Bucket"}
              </Button>
            </div>
            
            {bucketStatus && (
              <div className="mt-2 p-2 bg-slate-800 text-white rounded text-sm">
                <pre className="whitespace-pre-wrap">{bucketStatus}</pre>
              </div>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default PDFErrorAlert;

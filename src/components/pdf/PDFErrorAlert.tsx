
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
  const [isChecking, setIsChecking] = useState(false);

  const checkBucketExists = async () => {
    setIsChecking(true);
    setBucketStatus("Checking bucket status...");
    
    try {
      // Attempt to list a single file to verify bucket access
      const { data, error: listError } = await supabase.storage
        .from('pdfs')
        .list('', { limit: 1 });
      
      if (listError) {
        console.error("Bucket check error:", listError);
        setBucketStatus(`Error: ${listError.message}`);
        return;
      }
      
      // Try to get bucket details
      const { error: bucketError } = await supabase.storage.getBucket('pdfs');
      
      if (bucketError) {
        console.error("Get bucket error:", bucketError);
        setBucketStatus(`Bucket error: ${bucketError.message}`);
        return;
      }
      
      setBucketStatus("✅ Bucket exists and is accessible");
      
      // If onCreateBucket is provided, call it to refresh the parent component
      if (onCreateBucket) {
        onCreateBucket();
      }
    } catch (err: any) {
      console.error("Unexpected error checking bucket:", err);
      setBucketStatus(`Unexpected error: ${err.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error}
        <div className="mt-2">
          <p className="text-sm">
            {error.includes('pdfs') && error.includes('bucket') ? (
              <div className="space-y-2">
                <p>The system cannot connect to the PDF bucket. This could be due to:</p>
                <ul className="list-disc pl-5 text-sm">
                  <li>Network connectivity issues</li>
                  <li>API key permissions</li>
                  <li>Bucket access policies</li>
                </ul>
                
                <Button 
                  onClick={checkBucketExists} 
                  disabled={isChecking} 
                  variant="outline"
                  className="mt-2"
                >
                  {isChecking ? "Checking..." : "Diagnose Connection"}
                </Button>
                
                {bucketStatus && (
                  <div className="mt-2 p-2 bg-slate-800 text-white rounded text-sm">
                    <pre className="whitespace-pre-wrap">{bucketStatus}</pre>
                  </div>
                )}
              </div>
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
  );
};

export default PDFErrorAlert;

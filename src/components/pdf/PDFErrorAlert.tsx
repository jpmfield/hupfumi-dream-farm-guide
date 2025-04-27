
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';

interface PDFErrorAlertProps {
  error: string;
  onCreateBucket?: () => void;
  isBucketChecking?: boolean;
}

const PDFErrorAlert = ({ error, onCreateBucket, isBucketChecking }: PDFErrorAlertProps) => {
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
                <p>You need to create the PDF bucket in your Supabase dashboard:</p>
                <ol className="list-decimal pl-5 text-sm">
                  <li>Go to your Supabase project dashboard</li>
                  <li>Navigate to Storage in the sidebar</li>
                  <li>Click "New Bucket"</li>
                  <li>Name it "pdfs" and check "Public bucket"</li>
                  <li>Configure RLS policies for access control</li>
                </ol>
                {onCreateBucket && (
                  <Button 
                    onClick={onCreateBucket} 
                    disabled={isBucketChecking} 
                    variant="outline"
                    className="mt-2"
                  >
                    {isBucketChecking ? "Checking..." : "Check again"}
                  </Button>
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


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
            {error.includes('bucket does not exist') ? (
              <Button 
                onClick={onCreateBucket} 
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
  );
};

export default PDFErrorAlert;

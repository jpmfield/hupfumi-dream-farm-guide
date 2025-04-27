
import React from 'react';
import PDFManager from '../components/PDFManager';

const PDFContainerExample = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">PDF Storage and Management</h1>
      <p className="text-gray-600 mb-2">
        Upload, view, and manage your PDF files securely in the cloud.
      </p>
      <p className="text-gray-500 mb-6 text-sm">
        Note: PDF files are stored in a public Supabase storage bucket. This example demonstrates how to integrate with Supabase Storage.
      </p>
      <PDFManager />
    </div>
  );
};

export default PDFContainerExample;

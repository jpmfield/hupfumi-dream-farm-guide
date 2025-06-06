
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://twhktjxvffiuoixfxhhp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aGt0anh2ZmZpdW9peGZ4aGhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDEzNjEsImV4cCI6MjA2MTI3NzM2MX0.2PGsZoE2yxV1RPyI-rYKgVPr5whJIbsHHjT0s-TXZTI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Add a helper method for PDF-specific storage operations
export const pdfStorage = {
  upload: async (file: File) => {
    const fileName = `pdf_${Date.now()}.pdf`;
    return supabase.storage.from('pdfs').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  },
  listPDFs: () => {
    return supabase.storage.from('pdfs').list();
  },
  getPublicUrl: (fileName: string) => {
    return supabase.storage.from('pdfs').getPublicUrl(fileName);
  }
};

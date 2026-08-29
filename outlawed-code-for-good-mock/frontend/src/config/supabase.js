import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://xajbcdqwoaytvgodagyf.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_mPrSKPOXUOdNETU6gOcUiQ_8vJXDHtm';

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload a document or image to Supabase Storage
 * @param {File} file - HTML File object from input
 * @param {string} [bucket='case-documents'] - Storage bucket name
 * @param {string} [folder='vault'] - Subfolder in bucket
 * @returns {Promise<{ publicUrl: string, fileName: string, fileSize: string, storagePath: string }>}
 */
export async function uploadToSupabase(file, bucket = 'case-documents', folder = 'vault') {
  if (!file) throw new Error('No file selected for upload.');

  const fileExt = file.name.split('.').pop();
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);

  const uniqueFileName = `${Date.now()}_${cleanBaseName}.${fileExt}`;
  const filePath = `${folder}/${uniqueFileName}`;

  try {
    // 1. Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || undefined,
      });

    if (error) {
      console.warn('Supabase bucket upload notice:', error.message);
      // If bucket upload fails (e.g. bucket policy), fall back to base64 encoding so upload never crashes
      return await fallbackBase64(file);
    }

    // 2. Retrieve Public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      publicUrl: urlData.publicUrl,
      fileName: file.name,
      fileSize: `${Math.round(file.size / 1024)} KB`,
      storagePath: filePath,
    };
  } catch (err) {
    console.warn('Supabase client notice, using fallback:', err.message);
    return await fallbackBase64(file);
  }
}

/**
 * Fallback to Base64 data URL if storage bucket is inaccessible
 */
function fallbackBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        publicUrl: reader.result,
        fileName: file.name,
        fileSize: `${Math.round(file.size / 1024)} KB`,
        storagePath: 'local_base64',
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Download a file from Supabase Storage by path
 */
export async function downloadFromSupabase(filePath, bucket = 'case-documents') {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(filePath);

  if (error) {
    throw new Error(error.message || 'Failed to download file from Supabase.');
  }

  return data;
}

/**
 * List files in a bucket folder
 */
export async function listSupabaseFiles(folder = 'vault', bucket = 'case-documents') {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) {
    console.error('Supabase list error:', error);
    return [];
  }

  return data;
}

export default supabase;

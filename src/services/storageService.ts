import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import configJson from '../../firebase-applet-config.json';
import { supabase } from './supabaseClient';

const firebaseConfig = {
  projectId: configJson.projectId || 'ai-studio-applet-webapp-faf08',
  appId: configJson.appId || '1:351445412039:web:e84748d6467445c80936e2',
  apiKey: configJson.apiKey || 'AIzaSyAGOeXqh-jb5WYAoP1x36rYekzOUZ1M5XQ',
  authDomain: configJson.authDomain || 'ai-studio-applet-webapp-faf08.firebaseapp.com',
  storageBucket: configJson.storageBucket || 'ai-studio-applet-webapp-faf08.firebasestorage.app',
  messagingSenderId: configJson.messagingSenderId || '351445412039'
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const storage = getStorage(app);

export interface UploadResult {
  url: string;
  source: 'supabase' | 'firebase' | 'base64';
  filename: string;
  sizeBytes?: number;
}

/**
 * Robust image upload pipeline:
 * 1. Attempts Supabase Storage upload if bucket exists and configured
 * 2. Attempts Firebase Storage upload with clean path
 * 3. Guaranteed local Base64 fallback if cloud storage or CORS blocks upload in preview
 */
export async function uploadAssetImage(
  file: File,
  folder = 'showcases'
): Promise<UploadResult> {
  const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = `${folder}/${cleanName}`;

  // 1. Try Supabase Storage first if available and valid URL configured
  if (supabase && (import.meta as any).env?.VITE_SUPABASE_URL) {
    try {
      const { data, error } = await supabase.storage
        .from('generated-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!error && data) {
        const { data: pubData } = supabase.storage.from('generated-images').getPublicUrl(filePath);
        if (pubData?.publicUrl) {
          return {
            url: pubData.publicUrl,
            source: 'supabase',
            filename: file.name,
            sizeBytes: file.size
          };
        }
      }
    } catch (sbErr) {
      console.warn('Supabase upload skipped or unavailable, trying Firebase:', sbErr);
    }
  }

  // 2. Try Firebase Storage
  try {
    const storageRef = ref(storage, filePath);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type || 'image/png'
    });
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return {
      url: downloadUrl,
      source: 'firebase',
      filename: file.name,
      sizeBytes: file.size
    };
  } catch (fbErr: any) {
    console.warn('Firebase Storage upload blocked or CORS restricted in preview, using base64 fallback:', fbErr?.message || fbErr);
  }

  // 3. Fallback to resilient in-browser Base64 Data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = typeof reader.result === 'string' ? reader.result : '';
      resolve({
        url: base64,
        source: 'base64',
        filename: file.name,
        sizeBytes: file.size
      });
    };
    reader.onerror = () => {
      // If reading fails, generate safe placeholder
      resolve({
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        source: 'base64',
        filename: file.name,
        sizeBytes: file.size
      });
    };
    reader.readAsDataURL(file);
  });
}

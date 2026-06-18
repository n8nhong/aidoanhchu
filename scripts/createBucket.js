import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

function loadSupabaseConfig() {
  let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  // Uu tien key that (khong phai placeholder)
  const candidates = [
    process.env.SUPABASE_KEY,
    process.env.VITE_SUPABASE_ANON_KEY,
  ].filter(Boolean);
  let key = candidates.find((k) => !k.includes('DIEN_') && !k.includes('paste_') && !k.includes('YOUR_')) || '';

  const dbPath = path.join(process.cwd(), 'db-config.json');
  if (fs.existsSync(dbPath)) {
    try {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      url = url || db.url || db.supabase_url || '';
      key = key || db.key || db.supabase_key || '';
    } catch {
      // ignore parse errors
    }
  }

  if (!url) {
    url = 'https://wgtchjeondykhwljmneg.supabase.co';
  }

  return { url, key };
}

function isValidSupabaseKey(key) {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (trimmed.length < 20) return false;
  if (trimmed.includes('DIEN_') || trimmed.includes('paste_') || trimmed.includes('YOUR_')) return false;
  // JWT anon key (cu): eyJhbGci...
  if (trimmed.startsWith('eyJ') && trimmed.split('.').length === 3) return true;
  // Publishable key (moi): sb_publishable_...
  if (trimmed.startsWith('sb_publishable_')) return true;
  return false;
}

async function createBucket() {
  const { url: supabaseUrl, key: supabaseKey } = loadSupabaseConfig();

  if (!isValidSupabaseKey(supabaseKey)) {
    console.warn('');
    console.warn('⚠️  BO QUA TAO BUCKET - Supabase key chua dung!');
    console.warn('');
    console.warn('   Ban dang de text gia (DIEN_ANON_KEY...) trong file .env');
    console.warn('   Can thay bang key THAT tu Supabase:');
    console.warn('');
    console.warn('   1. Vao: https://supabase.com/dashboard/project/wgtchjeondykhwljmneg/settings/api');
    console.warn('   2. Copy key "anon" "public" (bat dau bang eyJ..., rat dai)');
    console.warn('   3. Dan vao file .env -> VITE_SUPABASE_ANON_KEY va SUPABASE_KEY');
    console.warn('   4. Chay lai deploy.bat');
    console.warn('');
    process.exit(0);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Checking/Creating bucket "product-images"...');

  try {
    const { error } = await supabase.storage.createBucket('product-images', { public: true });

    if (error) {
      if (error.message && error.message.includes('already exists')) {
        console.log('✅ Bucket "product-images" already exists.');
      } else {
        console.warn('⚠️  Khong tao duoc bucket (tiep tuc deploy):', error.message);
        process.exit(0);
      }
    } else {
      console.log('✅ Successfully created bucket "product-images".');
    }
  } catch (err) {
    console.warn('⚠️  Loi bucket (tiep tuc deploy):', err.message || err);
    process.exit(0);
  }
}

createBucket();

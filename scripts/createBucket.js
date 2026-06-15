import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

function loadSupabaseConfig() {
  let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  let key = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

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
    url = 'https://encpsaatojnxgyjjcvnx.supabase.co';
  }

  return { url, key };
}

async function createBucket() {
  const { url: supabaseUrl, key: supabaseKey } = loadSupabaseConfig();

  if (!supabaseKey) {
    console.warn('⚠️  Bo qua tao bucket: chua co SUPABASE_KEY.');
    console.warn('   Tao file .env voi VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY');
    console.warn('   (lay tu Supabase Dashboard > Settings > API > anon public key)');
    console.warn('   Hoac cau hinh trong Admin web > tab Database roi chay lai.');
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

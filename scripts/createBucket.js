require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function createBucket() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase URL or Key in environment variables.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Checking/Creating bucket "product-images"...');
  
  try {
    const { data, error } = await supabase.storage.createBucket('product-images', { public: true });
    
    if (error) {
      if (error.message && error.message.includes('already exists')) {
        console.log('✅ Bucket "product-images" already exists.');
      } else {
        console.error('❌ Error creating bucket:', error);
        process.exit(1);
      }
    } else {
      console.log('✅ Successfully created bucket "product-images".');
    }
  } catch (err) {
    console.error('❌ Exception when creating bucket:', err);
    process.exit(1);
  }
}

createBucket();

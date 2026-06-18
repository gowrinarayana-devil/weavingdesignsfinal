const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isDummy = !supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('dummy') || supabaseUrl.includes('your-supabase');

if (isDummy) {
  console.warn('⚠️ WARNING: Using mock/placeholder Supabase credentials.');
}

// Instantiate Supabase client with the service role key to bypass RLS for administrative tasks
const supabaseAdmin = createClient(
  supabaseUrl && !isDummy ? supabaseUrl : 'https://dummy-project.supabase.co',
  supabaseServiceKey && !isDummy ? supabaseServiceKey : 'dummy_service_role_key_placeholder',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

module.exports = { supabaseAdmin, isDummy };

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('dummy') || supabaseUrl.includes('your-supabase')) {
  console.error('❌ Error: Please configure valid live SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env before running the seed script.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function seedUser(email, password, name, role) {
  console.log(`\nAttempting to seed user: ${email} (${role})...`);
  
  // 1. Create or get user in Supabase Auth
  let authUser = null;
  
  // Check if user already exists in auth (we can try listing or creating)
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role }
  });

  if (createError) {
    if (createError.message && (createError.message.includes('already exists') || createError.message.includes('already been registered') || createError.message.includes('already'))) {
      console.log(`ℹ️ Auth account for ${email} already exists. Fetching existing user...`);
      // User exists, let's find their ID. We can list users.
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error(`❌ Failed to list users:`, listError.message);
        return;
      }
      authUser = listData.users.find(u => u.email === email);
      if (!authUser) {
        console.error(`❌ Could not find existing auth user with email ${email}`);
        return;
      }
    } else {
      console.error(`❌ Failed to create auth user ${email}:`, createError.message);
      return;
    }
  } else {
    authUser = createData.user;
    console.log(`✅ Created auth user for ${email} with ID: ${authUser.id}`);
  }

  // 2. Sync/Upsert public.users profile record
  console.log(`Syncing profile for ${email} in public.users...`);
  const { error: profileError } = await supabase
    .from('users')
    .upsert({
      id: authUser.id,
      name,
      email,
      role
    }, { onConflict: 'id' });

  if (profileError) {
    console.error(`❌ Failed to sync profile for ${email} in public.users:`, profileError.message);
    console.warn(`💡 Warning: Make sure you have run the full supabase_schema.sql in your Supabase SQL Editor!`);
  } else {
    console.log(`✅ Successfully synced profile for ${email} in public.users.`);
  }
}

async function main() {
  try {
    console.log('🌱 Starting Supabase user seeding...');
    
    // Seed admin
    await seedUser('gudurupavan0297@gmail.com', 'Ghjklasdf@1', 'System Admin', 'admin');
    
    // Seed customer
    await seedUser('customer@example.com', 'user123', 'Weaving Customer', 'user');
    
    console.log('\n🌱 Seeding completed!');
  } catch (err) {
    console.error('Fatal seeding error:', err);
  }
}

main();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase environment variables not set!');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'MISSING');
  console.error('SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'MISSING');
  
  // Return a mock client that won't crash the app
  module.exports = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: 'Supabase not configured' }),
      insert: () => Promise.resolve({ data: null, error: 'Supabase not configured' }),
      update: () => Promise.resolve({ data: null, error: 'Supabase not configured' }),
      delete: () => Promise.resolve({ data: null, error: 'Supabase not configured' }),
      eq: () => ({ single: () => Promise.resolve({ data: null, error: 'Supabase not configured' }) })
    })
  };
} else {
  const supabase = createClient(supabaseUrl, supabaseKey);
  module.exports = supabase;
}

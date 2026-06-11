const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://ucbvajwpchhbmswavjul.supabase.co', 'sb_publishable_TDqd73vgDbrIhKT6SHrGNA_7M7aTpRK');

async function check() {
  const { data, error } = await supabase.from('user_data').select('*').limit(1);
  console.log(data);
  if (error) console.error(error);
}
check();

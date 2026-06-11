const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('', '');

async function check() {
  const { data, error } = await supabase.from('user_data').insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    book: 'test',
    chapter: 1,
    verse: 1,
    type: 'last_read',
    content: 'test'
  }).select('*');
  console.log(data);
  if (error) console.error(error);
}
check();

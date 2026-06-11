const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://ucbvajwpchhbmswavjul.supabase.co', 'sb_publishable_TDqd73vgDbrIhKT6SHrGNA_7M7aTpRK');

async function test() {
  const user_id = '00000000-0000-0000-0000-000000000000';
  
  // Try insert
  console.log("Attempting insert...");
  const { data: iData, error: iErr } = await supabase.from('user_data').insert({
    user_id,
    book: 'genesis',
    chapter: 1,
    verse: 1,
    type: 'test_insert',
    content: '/read/genesis/1'
  }).select();
  
  if (iErr) console.log("Insert Error:", iErr);
  else console.log("Insert Success:", iData);
  
  // Try update
  if (iData && iData.length > 0) {
    console.log("Attempting update...");
    const { data: uData, error: uErr } = await supabase.from('user_data').update({
      chapter: 2
    }).eq('id', iData[0].id).select();
    
    if (uErr) console.log("Update Error:", uErr);
    else console.log("Update Success:", uData);
  }
}
test();

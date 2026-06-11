const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('', '');

async function check() {
  const { data, error } = await supabase.from('user_data').select('*').limit(1);
  if (error) {
    console.error(error);
  } else if (data && data.length > 0) {
    console.log("Keys in row:", Object.keys(data[0]));
  } else {
    console.log("Table is empty, inserting a dummy row");
    const { data: iData, error: iErr } = await supabase.from('user_data').insert({
      user_id: '11111111-1111-1111-1111-111111111111', book: 'test', chapter: 1, verse: 1, type: 'dummy'
    }).select();
    if (iErr) console.log(iErr);
    else if (iData && iData.length > 0) console.log("Keys in row:", Object.keys(iData[0]));
    
    // cleanup
    await supabase.from('user_data').delete().eq('user_id', '11111111-1111-1111-1111-111111111111');
  }
}
check();

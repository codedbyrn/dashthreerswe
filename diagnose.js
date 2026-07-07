const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vfelhzuedznrmzaeewrh.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZWxoenVlZHpucm16YWVld3JoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIzNTYxMywiZXhwIjoyMDk3ODExNjEzfQ.ZqErtcGAJPmLamTY8MP2kC0h4i63_aVWdA3TS3FpD_Q';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  try {
    console.log('--- Checking Types ---');
    const { data: types, error: errTypes } = await supabase.from('type').select('*');
    if (errTypes) console.error('Error fetching types:', errTypes);
    else console.log('Types:', types);

    console.log('\n--- Checking Categories ---');
    const { data: categories, error: errCategories } = await supabase.from('category').select('*');
    if (errCategories) console.error('Error fetching categories:', errCategories);
    else console.log('Total Categories:', categories.length);

    if (types && categories) {
      for (const t of types) {
        const matching = categories.filter(c => c.type_id === t.id);
        console.log(`- Type "${t.type}" has ${matching.length} categories:`, matching.map(c => c.category));
      }
    }

  } catch (e) {
    console.error('Diagnostic error:', e);
  }
}

main();

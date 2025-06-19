const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const SUPABASE_URL = 'https://xohrysyuybcedcgiazon.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvaHJ5c3l1eWJjZWRjZ2lhem9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjYxODQsImV4cCI6MjA2NDIwMjE4NH0.eC8_1xVh2HQFsZNObw7CLfi8fnYxxkJOvt18nZM5Qto';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testColumns() {
  try {
    console.log('Testing column names and search...\n');
    
    // Get one record to see exact column names
    const { data, error } = await supabase
      .from('All_Variables')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Sample record:');
      console.log(JSON.stringify(data[0], null, 2));
      
      console.log('\n🔍 Column names:');
      Object.keys(data[0]).forEach(col => console.log(`  - "${col}"`));
      
      // Test search with exact column name
      const countryName = Object.keys(data[0])[0]; // First column
      console.log(`\n🔍 Testing search with column: "${countryName}"`);
      
      const { data: searchData, error: searchError } = await supabase
        .from('All_Variables')
        .select('*')
        .ilike(countryName, '%Germany%')
        .limit(1);
      
      if (searchError) {
        console.log('❌ Search error:', searchError);
      } else {
        console.log('✅ Search result:', searchData);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testColumns(); 
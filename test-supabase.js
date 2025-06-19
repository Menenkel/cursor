const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const SUPABASE_URL = 'https://xohrysyuybcedcgiazon.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvaHJ5c3l1eWJjZWRjZ2lhem9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjYxODQsImV4cCI6MjA2NDIwMjE4NH0.eC8_1xVh2HQFsZNObw7CLfi8fnYxxkJOvt18nZM5Qto';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabase() {
  try {
    console.log('Testing Supabase connection...\n');
    
    // Test 1: Try to access the table
    console.log('1. Testing table access...');
    const { data, error } = await supabase
      .from('All_Variables')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error accessing table:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('✅ Successfully accessed table');
      console.log('Data length:', data ? data.length : 'null');
      console.log('Sample data:', data && data.length > 0 ? data[0] : 'No data found');
      
      if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
      } else {
        console.log('⚠️ Table appears to be empty or no data returned');
      }
    }
    
    // Test 2: Try to get all data
    console.log('\n2. Testing full table access...');
    const { data: allData, error: allError } = await supabase
      .from('All_Variables')
      .select('*');
    
    if (allError) {
      console.log('❌ Full table access error:', allError.message);
    } else {
      console.log('✅ Full table access successful');
      console.log('Total records:', allData ? allData.length : 0);
      if (allData && allData.length > 0) {
        console.log('First record:', allData[0]);
      }
    }
    
    // Test 3: Try different table names
    console.log('\n3. Testing alternative table names...');
    const tableNames = ['all_variables', 'All_variables', 'ALL_VARIABLES', 'allvariables'];
    
    for (const tableName of tableNames) {
      try {
        const { data: testData, error: testError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!testError && testData && testData.length > 0) {
          console.log(`✅ Found data in table: "${tableName}"`);
          console.log('Sample:', testData[0]);
          break;
        }
      } catch (err) {
        // Table doesn't exist
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSupabase(); 
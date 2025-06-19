const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const SUPABASE_URL = 'https://xohrysyuybcedcgiazon.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvaHJ5c3l1eWJjZWRjZ2lhem9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjYxODQsImV4cCI6MjA2NDIwMjE4NH0.eC8_1xVh2HQFsZNObw7CLfi8fnYxxkJOvt18nZM5Qto';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listTables() {
  try {
    console.log('Fetching table information...\n');
    
    // Try to get information about tables by attempting to query them
    // This is a workaround since we can't directly list tables with anon key
    
    const commonTableNames = [
      'faq', 'questions', 'answers', 'support', 'help', 'knowledge_base',
      'articles', 'content', 'data', 'information', 'docs', 'documentation'
    ];
    
    for (const tableName of commonTableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error && data !== null) {
          console.log(`✓ Found table: ${tableName}`);
          if (data.length > 0) {
            console.log(`  Columns: ${Object.keys(data[0]).join(', ')}`);
            console.log(`  Sample row:`, data[0]);
          } else {
            console.log(`  Table is empty`);
          }
          console.log('');
        }
      } catch (err) {
        // Table doesn't exist or we don't have access
      }
    }
    
    console.log('If you don\'t see your table listed above, please provide:');
    console.log('1. The exact table name');
    console.log('2. The column names in your table');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

listTables(); 
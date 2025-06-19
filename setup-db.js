const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const SUPABASE_URL = 'https://xohrysyuybcedcgiazon.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvaHJ5c3l1eWJjZWRjZ2lhem9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjYxODQsImV4cCI6MjA2NDIwMjE4NH0.eC8_1xVh2HQFsZNObw7CLfi8fnYxxkJOvt18nZM5Qto';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupDatabase() {
  try {
    console.log('Setting up FAQ table...');
    
    // Create the FAQ table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS faq (
          id SERIAL PRIMARY KEY,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createError) {
      console.log('Table might already exist or need manual creation');
    }

    // Insert sample data
    const sampleData = [
      {
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for all purchases. Items must be in original condition with all tags attached.'
      },
      {
        question: 'How do I contact customer support?',
        answer: 'You can reach our support team at support@example.com or call us at 1-800-123-4567 during business hours (9 AM - 6 PM EST).'
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. International orders typically take 7-14 business days.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay.'
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order ships, you will receive a tracking number via email. You can also track your order in your account dashboard.'
      }
    ];

    console.log('Inserting sample FAQ data...');
    
    for (const item of sampleData) {
      const { error: insertError } = await supabase
        .from('faq')
        .insert([item]);

      if (insertError) {
        console.log(`Error inserting "${item.question}":`, insertError.message);
      } else {
        console.log(`✓ Added: "${item.question}"`);
      }
    }

    console.log('Database setup complete!');
    
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupDatabase(); 
# AI Chat Assistant

A React-based chat application that integrates OpenAI GPT-4 and Supabase FAQ database for intelligent responses.

## Features

- 💬 Real-time chat interface with message history
- 🔍 Smart FAQ lookup using Supabase database
- 🤖 OpenAI GPT-4 fallback for unanswered questions
- ⚡ Streaming responses from OpenAI
- 🎨 Modern UI with TailwindCSS
- 📱 Responsive design

## Setup Instructions

### 1. Environment Variables Configuration

Create a `.env.local` file in the root directory and add your API keys:

```bash
# Copy the example file
cp env.example .env.local
```

Then edit `.env.local` and replace the placeholder values:

```env
# OpenAI API Configuration
NEXT_PUBLIC_OPENAI_API_KEY=your-actual-openai-api-key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-actual-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
```

### 2. Supabase Database Setup

Create a `faq` table in your Supabase project with the following structure:

```sql
CREATE TABLE faq (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Example data:
```sql
INSERT INTO faq (question, answer) VALUES
('What is your return policy?', 'We offer a 30-day return policy for all purchases.'),
('How do I contact support?', 'You can reach our support team at support@example.com or call 1-800-123-4567.'),
('Do you ship internationally?', 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location.');
```

### 3. Running the Application

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## How It Works

1. **User Input**: User types a question in the chat interface
2. **FAQ Search**: The app first searches the Supabase `faq` table for similar questions
3. **Fallback to OpenAI**: If no FAQ match is found, the question is sent to OpenAI GPT-4
4. **Streaming Response**: OpenAI responses are streamed in real-time
5. **Display**: Both FAQ and OpenAI responses are displayed in the chat interface

## Security Notes

⚠️ **Important**: The current implementation uses `NEXT_PUBLIC_` environment variables which are exposed to the client-side. For production use, consider:

- Moving API calls to Next.js API routes
- Using server-side environment variables (without `NEXT_PUBLIC_` prefix)
- Implementing proper authentication
- Adding rate limiting

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **OpenAI API** - AI responses
- **Supabase** - Database and FAQ storage

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main chat application
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # React components (if any)
└── lib/                  # Utility functions (if any)
```

## Customization

You can customize the application by:

- Modifying the system prompt in the OpenAI API call
- Adjusting the FAQ search logic
- Changing the UI styling with TailwindCSS classes
- Adding more sophisticated similarity matching for FAQ searches
- Implementing user authentication
- Adding conversation persistence

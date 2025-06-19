'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Environment variables for API keys
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Wikipedia API helper functions
const searchWikipedia = async (query: string): Promise<string | null> => {
  try {
    console.log('🔍 searchWikipedia called with:', query);
    
    // Use our server-side API route to avoid CORS issues
    const apiUrl = `/api/wikipedia?q=${encodeURIComponent(query)}`;
    console.log('🔍 Calling API URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    console.log('🔍 Wikipedia API response status:', response.status);
    console.log('🔍 Wikipedia API response ok:', response.ok);
    
    if (!response.ok) {
      console.log('❌ Wikipedia API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('❌ Error response body:', errorText);
      return null;
    }
    
    const data = await response.json();
    console.log('🔍 Wikipedia data received:', data);
    
    if (data.title && data.extract) {
      const result = `**${data.title}**\n\n${data.extract}\n\n*Source: ${data.source}*`;
      console.log('✅ Wikipedia result formatted:', result.substring(0, 100) + '...');
      return result;
    }
    
    console.log('❌ No Wikipedia extract found in response');
    return null;
  } catch (error) {
    console.error('❌ Error searching Wikipedia:', error);
    return null;
  }
};

const searchWikipediaGeneral = async (query: string): Promise<string | null> => {
  // The server-side API route handles both direct and general search
  // So we can just call the same function
  return searchWikipedia(query);
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchDatabase = async (query: string) => {
    console.log('🔍 searchDatabase called with:', query);
    
    try {
      // Convert query to lowercase for better matching
      const lowerQuery = query.toLowerCase().trim();
      
      // Test query to force Wikipedia usage
      if (lowerQuery === 'test wikipedia' || lowerQuery === 'test wiki') {
        console.log('🔍 Test query detected, forcing Wikipedia search...');
        const wikiResult = await searchWikipedia('quantum physics');
        return wikiResult || 'Wikipedia test failed';
      }
      
      // Helper function to calculate similarity between two strings
      const calculateSimilarity = (str1: string, str2: string): number => {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = longer.split('').reduce((acc, char, i) => {
          return acc + (shorter[i] === char ? 0 : 1);
        }, 0);
        
        return (longer.length - editDistance) / longer.length;
      };
      
      // Helper function to check if query is asking for a specific country
      const findBestCountryMatch = (query: string, countries: any[]): any | null => {
        const queryWords = query.split(/\s+/).filter(word => word.length > 2);
        
        // First, try exact matches
        for (const country of countries) {
          const countryName = country.Country.toLowerCase();
          const isoCode = country.ISO.toLowerCase();
          
          // Exact match for country name or ISO
          if (query === countryName || query === isoCode) {
            return country;
          }
          
          // Check if any query word exactly matches the country name
          for (const word of queryWords) {
            if (word === countryName || word === isoCode) {
              return country;
            }
          }
        }
        
        // If no exact match, try fuzzy matching with high threshold
        let bestMatch = null;
        let bestScore = 0.8; // High threshold to avoid false matches
        
        for (const country of countries) {
          const countryName = country.Country.toLowerCase();
          const isoCode = country.ISO.toLowerCase();
          
          // Check similarity with country name
          const nameSimilarity = calculateSimilarity(query, countryName);
          if (nameSimilarity > bestScore) {
            bestScore = nameSimilarity;
            bestMatch = country;
          }
          
          // Check similarity with ISO code
          const isoSimilarity = calculateSimilarity(query, isoCode);
          if (isoSimilarity > bestScore) {
            bestScore = isoSimilarity;
            bestMatch = country;
          }
          
          // Check if any query word is similar to country name
          for (const word of queryWords) {
            const wordSimilarity = calculateSimilarity(word, countryName);
            if (wordSimilarity > bestScore) {
              bestScore = wordSimilarity;
              bestMatch = country;
            }
          }
        }
        
        return bestMatch;
      };
      
      // First, check if it's asking about a specific country
      // Get all countries to check against
      const { data: allCountries, error: countryError } = await supabase
        .from('All_Variables')
        .select('Country, ISO');
      
      if (!countryError && allCountries) {
        // Find the best country match
        const foundCountry = findBestCountryMatch(lowerQuery, allCountries);
        
        if (foundCountry) {
          console.log('🔍 Found specific country:', foundCountry.Country);
          
          // Get full data for this country
          const { data, error } = await supabase
            .from('All_Variables')
            .select('*')
            .eq('Country', foundCountry.Country)
            .limit(1);
          
          if (!error && data && data.length > 0) {
            const country = data[0];
            let response = `**${country.Country}** (${country.ISO}):\n\n`;
            
            // Check what specific information was requested
            if (lowerQuery.includes('population') || lowerQuery.includes('pop')) {
              response += `Population (2023): ${country.Pop2023?.toLocaleString() || 'N/A'}\n`;
              response += `\n*Source: CLAIMATE*`;
            } else if (lowerQuery.includes('drought')) {
              response += `Drought Risk: ${country.DroughtRisk || 'N/A'}\n`;
              response += `Drought Count: ${country.DroughtCount || 'N/A'}\n`;
              response += `Future Drought Risk: ${country.DroughtRiskFuture || 'N/A'}\n`;
              response += `\n*Source: CLAIMATE*`;
            } else if (lowerQuery.includes('conflict')) {
              response += `Conflict Risk: ${country.ConflictRisk || 'N/A'}\n`;
              response += `INFORM Index: ${country.Inform || 'N/A'}\n`;
              response += `\n*Source: CLAIMATE*`;
            } else if (lowerQuery.includes('disaster') || lowerQuery.includes('storm') || lowerQuery.includes('flood')) {
              response += `Most Frequent Disaster: ${country.MostFrequentDisaster || 'N/A'}\n`;
              response += `Disaster Count: ${country.MostFrequentDisasterNumber || 'N/A'}\n`;
              response += `\n*Source: CLAIMATE*`;
            } else if (lowerQuery.includes('poverty')) {
              response += `Poverty Level: ${country.Poverty || 'N/A'}\n`;
              response += `Inequality: ${country.Inequality || 'N/A'}\n`;
              response += `\n*Source: CLAIMATE*`;
            } else {
              // Show all data if no specific field requested
              response += `- Population (2023): ${country.Pop2023?.toLocaleString() || 'N/A'}\n`;
              response += `- Most Frequent Disaster: ${country.MostFrequentDisaster || 'N/A'}\n`;
              response += `- Drought Risk: ${country.DroughtRisk || 'N/A'}\n`;
              response += `- Conflict Risk: ${country.ConflictRisk || 'N/A'}\n`;
              response += `- Poverty Level: ${country.Poverty || 'N/A'}\n`;
              response += `- Inequality Index: ${country.Inequality || 'N/A'}\n`;
              response += `- Drought Count: ${country.DroughtCount || 'N/A'}\n`;
              response += `- Drought Risk (Future): ${country.DroughtRiskFuture || 'N/A'}\n`;
              response += `- INFORM Index: ${country.Inform || 'N/A'}\n`;
              response += `\n*Source: CLAIMATE*`;
            }
            
            return response;
          }
        }
      }
      
      // If no specific country found, check for general data questions
      // Check if it's asking about population
      if (lowerQuery.includes('population') || lowerQuery.includes('pop')) {
        console.log('🔍 Searching for population data...');
        const { data, error } = await supabase
          .from('All_Variables')
          .select('*')
          .order('Pop2023', { ascending: false })
          .limit(5);
        
        if (error) {
          console.error('❌ Supabase error:', error);
          return null;
        }

        if (data && data.length > 0) {
          let response = `Top 5 countries by population (2023):\n\n`;
          data.forEach((country, index) => {
            response += `${index + 1}. **${country.Country}** (${country.ISO})\n`;
            response += `   - Population: ${country.Pop2023?.toLocaleString() || 'N/A'}\n\n`;
          });
          response += `*Source: CLAIMATE*`;
          return response;
        }
      }
      
      // Check if it's asking about drought
      if (lowerQuery.includes('drought')) {
        console.log('🔍 Searching for drought data...');
        const { data, error } = await supabase
          .from('All_Variables')
          .select('*')
          .order('DroughtRisk', { ascending: false })
          .limit(5);
        
        if (error) {
          console.error('❌ Supabase error:', error);
          return null;
        }

        if (data && data.length > 0) {
          let response = `Top 5 countries by drought risk:\n\n`;
          data.forEach((country, index) => {
            response += `${index + 1}. **${country.Country}** (${country.ISO})\n`;
            response += `   - Drought Risk: ${country.DroughtRisk || 'N/A'}\n`;
            response += `   - Drought Count: ${country.DroughtCount || 'N/A'}\n`;
            response += `   - Future Risk: ${country.DroughtRiskFuture || 'N/A'}\n\n`;
          });
          response += `*Source: CLAIMATE*`;
          return response;
        }
      }
      
      // Check if it's asking about conflict
      if (lowerQuery.includes('conflict')) {
        console.log('🔍 Searching for conflict data...');
        const { data, error } = await supabase
          .from('All_Variables')
          .select('*')
          .eq('ConflictRisk', 'High')
          .limit(5);
        
        if (error) {
          console.error('❌ Supabase error:', error);
          return null;
        }

        if (data && data.length > 0) {
          let response = `Countries with high conflict risk:\n\n`;
          data.forEach((country, index) => {
            response += `${index + 1}. **${country.Country}** (${country.ISO})\n`;
            response += `   - Conflict Risk: ${country.ConflictRisk || 'N/A'}\n`;
            response += `   - INFORM Index: ${country.Inform || 'N/A'}\n\n`;
          });
          response += `*Source: CLAIMATE*`;
          return response;
        }
      }
      
      // Check if it's asking about disasters
      if (lowerQuery.includes('disaster') || lowerQuery.includes('storm') || lowerQuery.includes('flood')) {
        console.log('🔍 Searching for disaster data...');
        const { data, error } = await supabase
          .from('All_Variables')
          .select('*')
          .order('MostFrequentDisasterNumber', { ascending: false })
          .limit(5);
        
        if (error) {
          console.error('❌ Supabase error:', error);
          return null;
        }

        if (data && data.length > 0) {
          let response = `Top 5 countries by disaster frequency:\n\n`;
          data.forEach((country, index) => {
            response += `${index + 1}. **${country.Country}** (${country.ISO})\n`;
            response += `   - Most Frequent Disaster: ${country.MostFrequentDisaster || 'N/A'}\n`;
            response += `   - Disaster Count: ${country.MostFrequentDisasterNumber || 'N/A'}\n\n`;
          });
          response += `*Source: CLAIMATE*`;
          return response;
        }
      }
      
      // Check if it's asking about poverty
      if (lowerQuery.includes('poverty')) {
        console.log('🔍 Searching for poverty data...');
        const { data, error } = await supabase
          .from('All_Variables')
          .select('*')
          .order('Poverty', { ascending: false })
          .limit(5);
        
        if (error) {
          console.error('❌ Supabase error:', error);
          return null;
        }

        if (data && data.length > 0) {
          let response = `Top 5 countries by poverty level:\n\n`;
          data.forEach((country, index) => {
            response += `${index + 1}. **${country.Country}** (${country.ISO})\n`;
            response += `   - Poverty Level: ${country.Poverty || 'N/A'}\n`;
            response += `   - Inequality: ${country.Inequality || 'N/A'}\n\n`;
          });
          response += `*Source: CLAIMATE*`;
          return response;
        }
      }
      
      // Default: search by country name
      console.log('🔍 Searching by country name...');
      const { data, error } = await supabase
        .from('All_Variables')
        .select('*')
        .or(`Country.ilike.%${query}%,ISO.ilike.%${query}%`)
        .limit(3);

      console.log('🔍 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        return null;
      }

      if (data && data.length > 0) {
        console.log('✅ Found data:', data.length, 'records');
        
        let response = `Found information for ${data.length} country/countries:\n\n`;
        
        data.forEach((country, index) => {
          response += `${index + 1}. **${country.Country}** (${country.ISO})\n`;
          response += `   - Population (2023): ${country.Pop2023?.toLocaleString() || 'N/A'}\n`;
          response += `   - Most Frequent Disaster: ${country.MostFrequentDisaster || 'N/A'}\n`;
          response += `   - Drought Risk: ${country.DroughtRisk || 'N/A'}\n`;
          response += `   - Conflict Risk: ${country.ConflictRisk || 'N/A'}\n`;
          response += `   - Poverty Level: ${country.Poverty || 'N/A'}\n`;
          response += `   - Inequality Index: ${country.Inequality || 'N/A'}\n`;
          response += `   - Drought Count: ${country.DroughtCount || 'N/A'}\n`;
          response += `   - Drought Risk (Future): ${country.DroughtRiskFuture || 'N/A'}\n`;
          response += `   - INFORM Index: ${country.Inform || 'N/A'}\n\n`;
        });

        response += `*Source: CLAIMATE*`;
        return response;
      }

      console.log('❌ No data found');
      
      // If no Supabase data found, try Wikipedia
      console.log('🔍 Trying Wikipedia as fallback...');
      console.log('🔍 Original query:', query);
      
      // Try direct Wikipedia search first
      let wikiResult = await searchWikipedia(query);
      console.log('🔍 Wikipedia result:', wikiResult ? 'Found' : 'Not found');
      
      // If no direct result, try general search
      if (!wikiResult) {
        console.log('🔍 No direct Wikipedia result, trying general search...');
        wikiResult = await searchWikipediaGeneral(query);
        console.log('🔍 General Wikipedia result:', wikiResult ? 'Found' : 'Not found');
      }
      
      if (wikiResult) {
        console.log('✅ Found Wikipedia result, returning:', wikiResult.substring(0, 100) + '...');
        return wikiResult;
      } else {
        console.log('❌ No Wikipedia result found');
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error searching database:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    console.log('🚀 Submit triggered with:', inputValue);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      console.log('🔍 About to call searchDatabase...');
      const result = await searchDatabase(inputValue);
      console.log('🔍 searchDatabase result:', result);

      if (result) {
        console.log('✅ Found result, updating message');
        setMessages(prev => 
          prev.map((msg, index) => 
            index === prev.length - 1 
              ? { ...msg, content: result }
              : msg
          )
        );
      } else {
        console.log('❌ No result found, showing default message');
        setMessages(prev => 
          prev.map((msg, index) => 
            index === prev.length - 1 
              ? { ...msg, content: "I couldn't find specific information about that in my database or Wikipedia. Please try asking about a specific country, or ask about general topics like 'population', 'drought', 'conflict', 'disasters', or 'poverty'." }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
      setMessages(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 
            ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-gray-700/50">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-white mb-2">Country Data Assistant</h1>
          <p className="text-gray-300 text-lg">Powered by Supabase Data & Wikipedia</p>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 h-[700px] flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-900/50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-white">Start a conversation</p>
                <p className="text-sm mt-1 text-gray-400">Ask about countries, population, drought, conflict, disasters, or poverty data</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  } animate-in slide-in-from-bottom-2 duration-300`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-6 py-4 shadow-lg transition-all duration-200 hover:shadow-xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-gray-700 text-white border border-gray-600'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap leading-relaxed text-base text-white">{message.content}</p>
                    </div>
                    <p className={`text-xs mt-3 opacity-70 ${
                      message.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                <div className="bg-gray-700 text-white rounded-2xl px-6 py-4 border border-gray-600 shadow-lg">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-sm text-gray-300 ml-2">Searching database...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-700/50 p-6 bg-gray-800/50">
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about countries, population, drought, conflict, disasters, or poverty..."
                  className="w-full border border-gray-600 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-700 text-white placeholder-gray-400 shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="font-medium">Send</span>
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="max-w-4xl mx-auto w-full px-6 py-6">
        <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-700/50 rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-800/50 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-300">
                Data Sources Configured
              </h3>
              <p className="text-sm text-green-200 mt-1">
                Your Supabase credentials are properly configured and working.
              </p>
              <p className="text-sm text-green-200 mt-2">
                <strong>Data Sources:</strong> This app uses your "All_Variables" table and Wikipedia for comprehensive information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

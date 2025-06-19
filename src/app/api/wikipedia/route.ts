import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    console.log('🔍 Wikipedia API route called with query:', query);
    
    // Try direct Wikipedia search first
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(query)}`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.log('❌ Wikipedia API error:', response.status);
      return NextResponse.json({ error: 'Wikipedia API error' }, { status: response.status });
    }
    
    const data = await response.json();
    
    if (data.query && data.query.pages) {
      const pageId = Object.keys(data.query.pages)[0];
      const page = data.query.pages[pageId];
      
      if (page && page.extract && pageId !== '-1') {
        let extract = page.extract
          .replace(/\s+/g, ' ')
          .trim();
        
        if (extract.length > 500) {
          extract = extract.substring(0, 500) + '...';
        }
        
        return NextResponse.json({
          title: page.title,
          extract: extract,
          source: 'Wikipedia'
        });
      }
    }
    
    // If no direct result, try general search
    console.log('🔍 No direct result, trying general search...');
    const generalSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=3`;
    
    const generalResponse = await fetch(generalSearchUrl);
    
    if (generalResponse.ok) {
      const generalData = await generalResponse.json();
      
      if (generalData.query && generalData.query.search && generalData.query.search.length > 0) {
        const bestResult = generalData.query.search[0];
        
        // Get the page content using the page ID
        const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro=true&explaintext=true&pageids=${bestResult.pageid}`;
        const pageResponse = await fetch(pageUrl);
        
        if (pageResponse.ok) {
          const pageData = await pageResponse.json();
          
          if (pageData.query && pageData.query.pages) {
            const pageId = Object.keys(pageData.query.pages)[0];
            const page = pageData.query.pages[pageId];
            
            if (page && page.extract) {
              let extract = page.extract
                .replace(/\s+/g, ' ')
                .trim();
              
              if (extract.length > 400) {
                extract = extract.substring(0, 400) + '...';
              }
              
              return NextResponse.json({
                title: page.title,
                extract: extract,
                source: 'Wikipedia'
              });
            }
          }
        }
      }
    }
    
    return NextResponse.json({ error: 'No Wikipedia results found' }, { status: 404 });
    
  } catch (error) {
    console.error('❌ Error in Wikipedia API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
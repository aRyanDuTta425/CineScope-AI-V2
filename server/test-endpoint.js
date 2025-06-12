const http = require('http');

async function testSearchEndpoint() {
  return new Promise((resolve, reject) => {
    try {
      console.log('Testing search endpoint...');
      
      const postData = JSON.stringify({
        query: 'matrix',
        useVector: true  // Enable vector search to test fallback
      });
      
      const options = {
        hostname: 'localhost',
        port: 5001,
        path: '/api/movies/search',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 10000  // 10 second timeout
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log('Success! Search results:');
            console.log(`Found ${response.count} movies for query: "${response.query}"`);
            
            if (response.movies && response.movies.length > 0) {
              response.movies.slice(0, 3).forEach((movie, index) => {
                console.log(`${index + 1}. ${movie.title} (${movie.year}) - ${movie.genres?.join(', ')}`);
              });
            }
            resolve();
          } catch (error) {
            console.error('Error parsing response:', error.message);
            console.log('Raw response:', data);
            resolve();
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('Request error:', error.message);
        resolve();
      });
      
      req.on('timeout', () => {
        console.error('Request timed out');
        req.destroy();
        resolve();
      });
      
      req.write(postData);
      req.end();
      
    } catch (error) {
      console.error('Error:', error.message);
      resolve();
    }
  });
}

testSearchEndpoint();


const http=require("http");


exports.fetchClientData = (clientId) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: `/Api/Client/ClientMetaData?clientId=${clientId}`, 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };
  
      const req = http.request(options, (res) => {
        let data = '';
  
        res.on('data', (chunk) => {
          data += chunk;
        });
  
        res.on('end', () => {
          try {
            console.log('Raw response:', data);
  
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (error) {
            console.error('Error parsing JSON:', error);
            reject(new Error(`Failed to parse JSON. Received response: ${data}`));
          }
        });
      });
  
      req.on('error', (error) => {
        reject(error);
      });
  
      req.end();
    });
  };
  
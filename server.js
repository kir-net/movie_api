const http = require('http'),
       url = require('url'),
        fs = require('fs');

// create web server that listens for requests on port 8080
http.createServer((request, response) => {
let addr = request.url,
    q = url.parse(addr, true),
    filePath = '';

    // create log file
    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Added to log.');
    }
    });

    // parse request.url, look for string "documentation” 
    // If true, return “documentation.html” to user
    if (q.pathname.includes('documentation')) {       
    filePath = (__dirname + '/documentation.html');
    // otherwise return “index.html”
    } else {
    filePath = 'index.html';
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }    
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end();   
    });
        
}).listen(8080);

console.log('Test server is running on Port 8080.');
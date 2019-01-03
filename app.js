const http = require('http');
const fs = require('fs');

let request;
let response;

let server = http.createServer(getFromClient);

server.listen(3000);
console.log('Server start!');

// ↑↑ここまでメインプログラム↑↑

// createServerの処理
function getFromClient(req, res) {
    request = req;
    response = res;

    fs.readFile(
        './index.html'
        , 'UTF-8'
        , writeToResponse
    );
}

// readFile完了後の処理
function writeToResponse(error, data) {
    let content = data.replace(/dummy_title/g, 'タイトルです').replace(/dummy_content/g, 'これがコンテンツです。');

    response.writeHead(200, {
        'Content-Type': 'text/html' 
    });
    response.write(content);
    response.end();
}

const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring');

const index_page = fs.readFileSync('./index.ejs', 'utf8');
const other_page = fs.readFileSync('./other.ejs', 'utf8');
const style_css = fs.readFileSync('./style.css', 'utf8');

let server = http.createServer(getFromClient);

server.listen(3000);
console.log('Server start!');

// ↑↑ここまでメインプログラム↑↑

// createServerの処理
function getFromClient(request, response) {
    let url_parts = url.parse(request.url, true);

    switch (url_parts.pathname) {
        case '/':
            response_index(request, response, url_parts);
            break;
        
        case '/other':
            response_other(request, response);
            break;
        
        case '/style.css':
            response.writeHead(200, {
                'Content-Type': 'text/css'
            });
            response.write(style_css);
            response.end();
            break;
        
        default:
            response.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            response.end('no page...');
            break;
    }
}

// indexのアクセス処理
function response_index(request, response, url_parts) {
    let query = url_parts.query;
            
    let content_body = 'これはIndexページです。';

    if (query.msg !== undefined) {
        content_body += 'あなたは「' + query.msg + '」と送りました。';
    }
    
    let content = ejs.render(
        index_page
        , {
            title: 'Index'
            , content: content_body
        }
    );

    response.writeHead(200, {
        'Content-Type': 'text/html'
    });
    response.write(content);
    response.end();
}

// otherのアクセス処理
function response_other(request, response) {
    let content;
    let content_body = 'これはOtherページです。';
    
    if (request.method === 'POST') { // POSTアクセス時の処理
        let body = '';
        
        // データ受信時のイベント処理
        request.on('data', (data) => {
            body += data;
        });
        
        // データ受信終了のイベント処理
        request.on('end', () => {
            let post_data = qs.parse(body);
            content_body += 'あなたは「' + post_data.msg + '」と書きました。';

            content = ejs.render(
                other_page
                , {
                    title: 'other'
                    , content: content_body
                }
            );
        
            response.writeHead(200, {
                'Content-Type': 'text/html'
            });
            response.write(content);
            response.end();
        });

    } else { // GETアクセス時の処理
        content_body = 'POST送信されたデータはありません。';

        content = ejs.render(
            other_page
            , {
                title: 'other'
                , content: content_body
            }
        );
    
        response.writeHead(200, {
            'Content-Type': 'text/html'
        });
        response.write(content);
        response.end();
    }
}
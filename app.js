const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring');

const index_page = fs.readFileSync('./index.ejs', 'utf8');
const other_page = fs.readFileSync('./other.ejs', 'utf8');
const style_css = fs.readFileSync('./style.css', 'utf8');

const tableData2 = {
    'Taro': ['taro@yamada', '09-999-999', 'Tokyo']
    , 'Hanako': ['hanako@flower', '080-888-888', 'Yokohama']
    , 'Sachiko': ['sachi@happy', '070-777-777', 'Nagoya']
    , 'Ichiro': ['ichi@baseball', '060-666-666', 'USA']
};

let data = {
    'message': 'no message...'
};

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
    const tableData = {
        'Taro': '09-999-999'
        , 'Hanako': '080-888-888'
        , 'Sachiko': '070-777-777'
        , 'Ichiro': '060-666-666'
    };

    data.tableData = tableData;

    if (request.method === 'POST') {
        let message = '';

        // データ受信のイベント処理
        request.on('data', (data) => {
            message += data;
        });

        // データ受信終了のイベント処理
        request.on('end', () => {
            data.message = qs.parse(message).message;
            data.content = '※伝言を表示しています。';

            // cookieの保存
            setCookie('msg', data.message, response);

            write_index(request, response);
        });

    } else {
        let query = url_parts.query;
        let content_body = 'これはIndexページです。';

        if (query.msg !== undefined) {
            content_body += 'あなたは「' + query.msg + '」と送りました。';
        }

        data.content = content_body;

        write_index(request, response);
    }
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
                    , data: tableData2
                    , filename: 'data_item'
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
                , data: tableData2
                , filename: 'data_item'
            }
        );

        response.writeHead(200, {
            'Content-Type': 'text/html'
        });
        response.write(content);
        response.end();
    }
}

// indexの表示処理
function write_index(request, response) {
    data.cookie_data = getCookie('msg', request);

    let content = ejs.render(
        index_page
        , {
            title: 'Index'
            , data: data
            , filename: 'data_item'
        }
    );

    response.writeHead(200, {
        'Content-Type': 'text/html'
    });
    response.write(content);
    response.end();
}

// Cookieの値を設定
function setCookie(key, value, response) {
    let cookie = escape(value);
    response.setHeader('Set-Cookie', [key + '=' + cookie]);
}

// Cookieの値を取得
function getCookie(key, request) {
    let cookie_data = request.headers.cookie !== undefined ? request.headers.cookie : '';
    let cookie_data_array = cookie_data.split(';');
    let return_value;

    for (let i in cookie_data_array) {
        if (cookie_data_array[i].trim().startsWith(key + '=')) {
            return_value = cookie_data_array[i].trim().substring(key.length + 1);
            return unescape(return_value);
        }
    }

    return '';
}
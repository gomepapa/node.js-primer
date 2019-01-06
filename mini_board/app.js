'use strict';

const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring');

const index_page = fs.readFileSync('./index.ejs', 'utf8');
const login_page = fs.readFileSync('./login.ejs', 'utf8');
const style_css = fs.readFileSync('./style.css', 'utf8');

const max_num = 10;             // 最大保管数
const filename = 'mydata.txt';  // データファイル名

// データファイルをloadし、変数に格納する
let message_data = readFromFile(filename);

const server = http.createServer(getFromClient);

server.listen(3000);
console.log('Server start!');

// ↑↑ここまでメインプログラム↑↑

// テキストファイルをloadし、変数に格納する
function readFromFile(fname) {
    let file_data = fs.readFileSync(fname, 'utf8');
    return file_data.split('\n');
}

// createServerの処理
function getFromClient(req, res) {
    let url_parts = url.parse(req.url, true);

    switch (url_parts.pathname) {
        case '/':
            // トップページ
            response_index(req, res);
            break;

        case '/login':
            // ログインページ
            response_login(req, res);
            break;

        case '/style.css':
            res.writeHead(200, {
                'Content-Type': 'text/css'
            });
            res.write(style_css);
            res.end();
            break;

        default:
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('no page...');
            break;
    }
}

// loginのアクセス処理
function response_login(req, res) {
    let content = ejs.render(login_page, {});
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.write(content);
    res.end();
}

// indexのアクセス処理
function response_index(req, res) {
    if (req.method === 'POST') {
        // POSTアクセス処理

        let body = '';

        // データ受信のイベント処理
        req.on('data', (data) => {
            body += data;
        });

        // データ受信終了のイベント処理
        req.on('end', () => {
            let data = qs.parse(body);
            addToData(data.id, data.msg, filename);
            write_index(req, res);
        });

    } else {
        write_index(req, res);
    }
}

// データを更新
function addToData(id, msg, fname) {
    let obj = {
        'id': id
        , 'msg': msg
    };

    let obj_str = JSON.stringify(obj);

    console.log('add data: ' + obj_str);

    message_data.unshift(obj_str);

    if (message_data.length > max_num) {
        message_data.pop();
    }

    saveToFile(fname);
}

// データを保存
function saveToFile(fname) {
    let data_str = message_data.join('\n');
    fs.writeFile(fname, data_str, (err) => {
        if (err) {
            throw err;
        }
    });
}

// indexのページ作成
function write_index(req, res) {
    let msg = '※何かメッセージを書いてください。';
    let content = ejs.render(index_page, {
        title: 'Index'
        , content: msg
        , data: message_data
        , filename: 'data_item'
    });

    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.write(content);
    res.end();
}

'use strict';

const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');

const app = express();
app.engine('ejs', ejs.renderFile);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

const data = {
    'Taro': 'taro@yamada'
    , 'Hanako': 'hanako@flower'
    , 'Sachiko': 'sachico@happy'
    , 'Ichiro': 'ichiro@baseball'
};

// トップページ
app.get('/', (req, res) => {
    let msg = 'This is Express Page!<br>'
        +'※メッセージを書いて送信してください。';
    let url = '/other?name=taro&pass=yamada';

    // index.ejsをレンダリングする
    res.render(
        'index.ejs'
        , {
            title: 'Index'
            , content: msg
            , link: {
                href: url
                , text: '別のページに移動'
            }
            , data: data
        }
    );
});

// POST送信の処理
app.post('/', (req, res) => {
    let msg = 'This is Posted Page!<br>'
        + 'あなたは「' + req.body.message + '」と送信しました。';
    let url = '/other?name=taro&pass=yamada';

    res.render(
        'index.ejs'
        , {
            title: 'Posted'
            , content: msg
            , link: {
                href: url
                , text: '別のページに移動'
            }
        }
    );
});

// otherページ
app.get('/other', (req, res) => {
    let name = req.query.name;
    let pass = req.query.pass;
    let msg = 'This is Other Page!<br>'
        + 'これは、用意された別のページです。<br>'
        + 'あなたの名前は「' + name + '」<br>'
        + 'パスワードは「' + pass + '」です。';

    res.render(
        'index.ejs'
        , {
            title: 'other'
            , content: msg
            , link: {
                href: '/'
                , text: 'トップへ戻る'
            }
        }
    );
});

app.listen(3000, () => {
    console.log('Start server port:3000');
});

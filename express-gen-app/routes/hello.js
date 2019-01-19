const express = require('express');
const router = express.Router();

const https = require('https');
const parseString = require('xml2js').parseString;

const oracledb = require('oracledb');
const oracle_setting = {
    user: 'ACCOUNT'
    , password: 'account'
    , connectString: 'ORCL'
};

router.get('/', (req, res, next) => {
    let name = req.query.name;
    let mail = req.query.mail;

    if (name === undefined) {
        name = '名無し';
    }
    if (mail === undefined) {
        mail = '無い';
    }

    let msg = '何か書いて送信してください。';

    if (req.session.message !== undefined) {
        msg = 'Last Message: ' + req.session.message;
    }

    const opt = {
        host: 'news.google.com'
        , port: 443
        , path: '/rss?ie=UTF-8&oe=UTF-8&hl=ja&gl=JP&ceid=JP:ja'
    };

    https.get(opt, (res2) => {
        let body = '';

        res2.on('data', (data) => {
            body += data;
        });

        res2.on('end', () => {
            parseString(body.trim(), (err, result) => {
                oracledb.getConnection(
                    oracle_setting
                    , (err, connection) => {
                        if (err) {
                            console.error(err.message);
                            return;
                        }

                        connection.execute(
                            'SELECT * FROM M_BANK'
                            , []
                            , { outFormat: oracledb.OBJECT }
                            , (err, oraData) => {
                                if (err) {
                                    console.error(err.message);
                                    doRelease(connection);
                                    return;
                                }

                                let data = {
                                    title: 'Hello!'
                                    , content: '<p>'
                                        + 'これは、サンプルのコンテンツです。<br>'
                                        + 'this is sanmple content.<br>'
                                        + 'あなたの名前は、' + name + 'です。<br>'
                                        + 'メールアドレスは、' + mail + 'です。'
                                        + '</p>'
                                        + '<p>'
                                        + msg
                                        + '</p>'
                                        + 'Google News'
                                    , content_rss: result.rss.channel[0].item
                                    , content_db: oraData.rows
                                };

                                res.render('hello', data);

                                doRelease(connection);
                            }
                        )
                    }
                );
            });
        });
    });
});

router.post('/post', (req, res, next) => {
    let msg = req.body.message;

    req.session.message = msg;

    let data = {
        title: 'Hello!'
        , content: 'あなたは、「' + msg + '」と送信しました。'
        , content_rss: null
    };

    res.render('hello', data);
});

module.exports = router;

function doRelease(connection) {
    connection.close((err) => {
        if (err) {
            console.error(err.message);
        }
    });
}
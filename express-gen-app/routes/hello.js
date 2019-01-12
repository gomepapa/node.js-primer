let express = require('express');
let router = express.Router();

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
    };

    res.render('hello', data);
});

router.post('/post', (req, res, next) => {
    let msg = req.body.message;

    req.session.message = msg;

    let data = {
        title: 'Hello!'
        , content: 'あなたは、「' + msg + '」と送信しました。'
    };

    res.render('hello', data);
});

module.exports = router;

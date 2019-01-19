const express = require('express');
const router = express.Router();

const oracledb = require('oracledb');
const oracle_setting = {
    user: 'NODE'
    , password: 'node'
    , connectString: 'ORCL'
};

// GETアクセスの処理
router.get('/', (req, res, next) => {
    oracledb.getConnection(
        oracle_setting
        , (err, connection) => {
            if (err) {
                console.error(err.message);
                return;
            }

            connection.execute(
                'SELECT * FROM mydata'
                , []
                , { outFormat: oracledb.OBJECT }
                , (err, oraData) => {
                    if (err) {
                        console.error(err.message);
                        doRelease(connection);
                        return;
                    }

                    const data = {
                        title: 'Oracle Database'
                        , content_db: oraData.rows
                    };

                    res.render('crud/index', data);

                    doRelease(connection);
                }
            )
        }
    );
});

// 新規登録ページへのアクセス
router.get('/add', (req, res, next) => {
    const data = {
        title: 'CRUD/Add'
        , content: '新しいデータを入力してください。'
    };

    res.render('crud/add', data);
});

// 新規登録フォーム送信の処理
router.post('/add', (req, res, next) => {
    let nm = req.body.name;
    let ml = req.body.mail;
    let ad = req.body.age;

    oracledb.getConnection(oracle_setting)
        .then((conn) => {
            return conn.execute(
                `INSERT INTO mydata
            (
                id
                , name
                , mail
                , age
            )
            VALUES
            (
                (SELECT NVL(MAX(id), 0) + 1 FROM mydata)
                , :name
                , :mail
                , :age
            )`
                , [nm, ml, ad]
            ).then((result) => {
                conn.commit();
                doRelease(conn);
                res.redirect('/crud');
            }).catch((err) => {
                doRelease(conn)
                console.error(err);
            });
        });
});

// 指定IDのデータを表示する
router.get('/show', (req, res, next) => {
    const id = req.query.id;

    oracledb.getConnection(oracle_setting)
        .then((conn) => {
            return conn.execute(
                'SELECT * FROM mydata WHERE id = :id'
                , [id]
                , { outFormat: oracledb.OBJECT }
            ).then((result) => {
                const data = {
                    title: 'CRUD/show'
                    , content: 'id = ' + id + 'のデータ'
                    , mydata: result.rows[0]
                };

                res.render('crud/show', data);

                doRelease(conn);
            }).catch((err) => {
                console.error(err);
                doRelease(conn);
            });
        });
});

// 指定IDの編集画面を表示
router.get('/edit', (req, res, next) => {
    const id = req.query.id;

    oracledb.getConnection(oracle_setting)
        .then((conn) => {
            return conn.execute(
                'SELECT * FROM mydata WHERE id = :id'
                , [id]
                , { outFormat: oracledb.OBJECT }
            ).then((result) => {
                const data = {
                    title: 'CRUD/edit'
                    , content: 'id = ' + id + 'のデータ'
                    , mydata: result.rows[0]
                };

                res.render('crud/edit', data);

                doRelease(conn);
            }).catch((err) => {
                console.error(err);
                doRelease(conn);
            });
        });
});

// 指定IDのデータ更新処理
router.post('/edit', (req, res, next) => {
    const id = req.body.id;
    const nm = req.body.name;
    const ml = req.body.mail;
    const ag = req.body.age;

    oracledb.getConnection(oracle_setting)
        .then((conn) => {
            return conn.execute(
                'UPDATE mydata '
                + 'SET name = :name, mail = :mail, age = :age '
                + 'WHERE id = :id'
                , {
                    id: id
                    , name: nm
                    , mail: ml
                    , age: ag
                }
            ).then((resutl) => {
                conn.commit();
                doRelease(conn);
                res.redirect('/crud');
            }).catch((err) => {
                console.error(err);
                doRelease(conn);
            });
        });
});

// 指定IDの削除画面を表示
router.get('/delete', (req, res, next) => {
    const id = req.query.id;

    oracledb.getConnection(oracle_setting)
        .then((conn) => {
            return conn.execute(
                'SELECT * FROM mydata WHERE id = :id'
                , {
                    id: id
                }
                , { outFormat: oracledb.OBJECT }
            ).then((result) => {
                const data = {
                    title: 'CRUD/delete'
                    , content: 'id = ' + id + 'のデータ'
                    , mydata: result.rows[0]
                };

                res.render('crud/delete', data);

                doRelease(conn);
            }).catch((err) => {
                console.log(err);
                doRelease(conn);
            });
        });
});

// 指定IDの削除処理
router.post('/delete', (req, res, next) => {
    const id = req.body.id;

    oracledb.getConnection(oracle_setting)
        .then((conn) => {
            return conn.execute(
                'DELETE FROM mydata WHERE id = :id'
                , {
                    id: id
                }
            ).then((resutl) => {
                conn.commit();
                doRelease(conn);
                res.redirect('/crud');
            }).catch((err) => {
                console.error(err);
                doRelease(conn);
            });
        });
});

module.exports = router;

function doRelease(connection) {
    connection.close((err) => {
        if (err) {
            console.error(err.message);
        }
    });
}
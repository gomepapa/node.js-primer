const express = require('express');
const router = express.Router();

let data = [
    {
        name: 'Taro'
        , age: 35
        , mail: 'taro@yamada'
    }
    , {
        name: 'Hanako'
        , age: 29
        , mail: 'hanako@flower'
    }
    , {
        name: 'Sachiko'
        , age: 41
        , mail: 'sachico@happy'
    }
];

router.get('/', (req, res, next) => {
    let n = req.query.id;
    res.json(data[n]);
});

module.exports = router;

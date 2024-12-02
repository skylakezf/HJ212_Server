const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

// 创建MySQL数据库连接池，使用和server.js中相同的配置（你可以根据实际情况调整）
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Qxy20090226',
    database: 'tcpdate',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 定义路由，用于获取所有历史接收数据的接口
router.get('/getHistoryData', (req, res) => {
    // 查询received_data表中的所有数据的SQL语句
    const querySql = 'SELECT * FROM received_data';
    pool.query(querySql, (err, results) => {
        if (err) {
            console.log('查询历史数据失败:', err);
            res.status(500).json({error: '查询历史数据失败'});
            return;
        }
        res.json({data: results});
    });
});

module.exports = router;

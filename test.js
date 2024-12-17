const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 设置文件路径
const filePath = path.join(__dirname, 'Key.txt');

// 中间件：解析 JSON 请求
app.use(express.json());

// 读取 Key.txt 文件
app.get('/Key.txt', (req, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('无法读取 Key.txt');
            console.error(err);
        } else {
            res.send(data);
        }
    });
});

// 修改 Key.txt 文件
app.post('/Key.txt', (req, res) => {
    const { content } = req.body;
    if (typeof content !== 'string') {
        res.status(400).send('内容必须是字符串');
        return;
    }

    fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) {
            res.status(500).send('无法写入 Key.txt');
            console.error(err);
        } else {
            res.send('Key.txt 内容已更新');
        }
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});

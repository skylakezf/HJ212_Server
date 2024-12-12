const net = require('net');
const axios = require('axios');
const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');


const port = 8080;
const router = express.Router();
console.info('组件引入完成');

const logFilePath = path.join(__dirname, 'server.log');

// 用于存储各个TCP服务器实例的对象
const tcpServers = {};

// 创建MySQL数据库连接池
const pool = mysql.createPool({
    host: '113.45.10.40',
    user: 'root',
    password: 'Qxy20090226!',
    database: 'localdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
console.log('MySQL数据库连接池创建成功');

// 创建express应用实例
const app = express();

// 创建初始数据库表
function createInitialTables() {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('获取数据库连接失败:', err);
                reject(err);
                return;
            }
            // 创建以 MN 为主键的 MM_last_update_data 表
            const createMM_last_update_dataTable = `
                CREATE TABLE IF NOT EXISTS MM_last_update_data (
                    id INT AUTO_INCREMENT PRIMARY KEY,  -- 自增ID
                    MN VARCHAR(50),                    -- 数据采集仪的唯一标识
                    date DATETIME,                      -- 数据接收日期（来自DataTime）
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `;
            connection.query(createMM_last_update_dataTable, (err) => {
                connection.release();
                if (err) {
                    console.error('创建 createMM_last_update_dataTable 表失败:', err);
                    reject(err);
                    return;
                }
                console.log('数据库createMM_last_update_dataTable表已存在');
                resolve();
            });
            // 创建以 MN 为主键的 received_data 表
            const createReceivedDataTable = `
                CREATE TABLE IF NOT EXISTS received_data (
                    id INT AUTO_INCREMENT PRIMARY KEY,  -- 自增ID
                    MN VARCHAR(50),                    -- 数据采集仪的唯一标识
                    CN VARCHAR(6),                    -- 数据状态
                    date DATETIME,                      -- 数据接收日期（来自DataTime）
                    pollutants JSON,                    -- 污染物数据 (JSON 格式)
                    source_ip VARCHAR(45),              -- 来源 IP 地址
                    last_update DATETIME,               -- 数据最后更新时间（接收到数据包的时间）
                    raw_data TEXT                       -- 用于存储原始接收的数据
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `;
            connection.query(createReceivedDataTable, (err) => {
                connection.release();
                if (err) {
                    console.error('创建 received_data 表失败:', err);
                    reject(err);
                    return;
                }
                console.log('数据库表已存在');
                resolve();
            });
            // 创建以 MN 为主键的2011实时数据 received_data 表
            const createReceived2011DataTable = `
            CREATE TABLE IF NOT EXISTS received_2011_data (
                id INT AUTO_INCREMENT PRIMARY KEY,  -- 自增ID
                MN VARCHAR(50),                    -- 数据采集仪的唯一标识
                CN VARCHAR(6),                    -- 数据状态
                Flag VARCHAR(6),                    -- 数据状态
                date DATETIME,                      -- 数据接收日期（来自DataTime）
                pollutants JSON,                    -- 污染物数据 (JSON 格式)
                source_ip VARCHAR(45),              -- 来源 IP 地址
                last_update DATETIME,               -- 数据最后更新时间（接收到数据包的时间）
                raw_data TEXT                       -- 用于存储原始接收的数据
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
            connection.query(createReceived2011DataTable, (err) => {
                connection.release();
                if (err) {
                    console.error('创建 2011received_data 表失败:', err);
                    reject(err);
                    return;
                }
                console.log('数据库表createReceived2011DataTable已存在');
                resolve();
            });
            // 创建以 MN 为主键的2051分钟数据 received_data 表
            const createReceived2051DataTable = `
        CREATE TABLE IF NOT EXISTS received_2051_data (
            id INT AUTO_INCREMENT PRIMARY KEY,  -- 自增ID
            MN VARCHAR(50),                    -- 数据采集仪的唯一标识
            CN VARCHAR(6),                    -- 数据状态
            Flag VARCHAR(6),                    -- 数据状态
            date DATETIME,                      -- 数据接收日期（来自DataTime）
            pollutants JSON,                    -- 污染物数据 (JSON 格式)
            source_ip VARCHAR(45),              -- 来源 IP 地址
            last_update DATETIME,               -- 数据最后更新时间（接收到数据包的时间）
            raw_data TEXT                       -- 用于存储原始接收的数据
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
            connection.query(createReceived2051DataTable, (err) => {
                connection.release();
                if (err) {
                    console.error('创建 2051received_data 表失败:', err);
                    reject(err);
                    return;
                }
                console.log('数据库表createReceived2051DataTable已存在');
                resolve();
            });
            // 创建以 MN 为主键的2061小时数据 received_data 表
            const createReceived2061DataTable = `
    CREATE TABLE IF NOT EXISTS received_2061_data (
        id INT AUTO_INCREMENT PRIMARY KEY,  -- 自增ID
        MN VARCHAR(50),                    -- 数据采集仪的唯一标识
        CN VARCHAR(6),                    -- 数据状态
        Flag VARCHAR(6),                    -- 数据状态
        date DATETIME,                      -- 数据接收日期（来自DataTime）
        pollutants JSON,                    -- 污染物数据 (JSON 格式)
        source_ip VARCHAR(45),              -- 来源 IP 地址
        last_update DATETIME,               -- 数据最后更新时间（接收到数据包的时间）
        raw_data TEXT                       -- 用于存储原始接收的数据
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;
            connection.query(createReceived2061DataTable, (err) => {
                connection.release();
                if (err) {
                    console.error('创建 2061received_data 表失败:', err);
                    reject(err);
                    return;
                }
                console.log('数据库表已存在');
                resolve();
            });
            // 创建以 MN 为主键的2031日数据 received_data 表
            const createReceived2031DataTable = `
CREATE TABLE IF NOT EXISTS received_2031_data (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- 自增ID
    MN VARCHAR(50),                    -- 数据采集仪的唯一标识
    CN VARCHAR(6),                    -- 数据状态
    Flag VARCHAR(6),                    -- 数据状态
    date DATETIME,                      -- 数据接收日期（来自DataTime）
    pollutants JSON,                    -- 污染物数据 (JSON 格式)
    source_ip VARCHAR(45),              -- 来源 IP 地址
    last_update DATETIME,               -- 数据最后更新时间（接收到数据包的时间）
    raw_data TEXT                       -- 用于存储原始接收的数据
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;
            connection.query(createReceived2031DataTable, (err) => {
                connection.release();
                if (err) {
                    console.error('创建 2031received_data 表失败:', err);
                    reject(err);
                    return;
                }
                console.log('数据库表createReceived2031DataTable已存在');
                resolve();
            });



        });
    });
}
writeLog('服务器启动日期为' + new Date());
function saveParsedData(parsedData, sourceIp, rawData) {
    const { baseParams, dataParams } = parsedData;
    const MN = baseParams['MN']; // 数据采集仪唯一标识
    const CN = baseParams['CN'];//数据类型
    // Extract DataTime from pollutants and convert it
    const dataTimeStr = dataParams['DataTime']; // DataTime should be in the format YYYYMMDDHHMMSS
    const date = formatDataTime(dataTimeStr); // Convert to DATETIME format

    const lastUpdate = new Date(); // 使用当前时间作为 last_update
    console.info('当前时间', lastUpdate);
    writeLog('当前时间' + lastUpdate);
    const pollutants = JSON.stringify(dataParams); // 转换为 JSON 格式

    // 插入新的记录，不更新原记录
    const query = `
        INSERT INTO received_data (MN,CN, date, pollutants, source_ip, last_update, raw_data)
        VALUES (?, ? , ?, ?, ?, ?, ?);
    `;
    const query2011 = `
    INSERT INTO received_2011_data (MN,CN, date, pollutants, source_ip, last_update, raw_data)
    VALUES (?, ? , ?, ?, ?, ?, ?);
`;
    const query2031 = `
        INSERT INTO received_2031_data (MN,CN, date, pollutants, source_ip, last_update, raw_data)
        VALUES (?, ? , ?, ?, ?, ?, ?);
    `;
    const query2051 = `
        INSERT INTO received_2051_data (MN,CN, date, pollutants, source_ip, last_update, raw_data)
        VALUES (?, ? , ?, ?, ?, ?, ?);
    `;
    const query2061 = `
    INSERT INTO received_2061_data (MN,CN, date, pollutants, source_ip, last_update, raw_data)
    VALUES (?, ? , ?, ?, ?, ?, ?);
`;
    pool.query(query, [MN, CN, date, pollutants, sourceIp, lastUpdate, rawData], (err) => {
        if (err) {
            console.error('数据库插入失败:', err.message);
        } else {
            console.log(` `);
            console.info(`成功存储解析后的数据到总数据库: MN=${MN},CN=${CN} , Raw Data=${rawData}`);
            writeLog(`存储解析后的数据到总数据库: MN=${MN}, CN=${CN} ,Raw Data=${rawData}`);
            console.log(CN);
        }
    });

if (CN=='2011') {
    pool.query(query2011, [MN, CN, date, pollutants, sourceIp, lastUpdate, rawData], (err) => {
        if (err) {
            console.error('数据库2011实时插入失败:', err.message);
        } else {
            console.info(`成功存储解析后的数据到2011实时数据库: MN=${MN},CN=${CN} , Raw Data=${rawData}`);
            

        }
    });
}

if (CN=='2031') {
    pool.query(query2031, [MN, CN, date, pollutants, sourceIp, lastUpdate, rawData], (err) => {
        if (err) {
            console.error('数据库2031实时插入失败:', err.message);
        } else {
            console.info(`成功存储解析后的数据到2031日数据库: MN=${MN},CN=${CN} , Raw Data=${rawData}`);
            

        }
    });
}
if (CN=='2051') {
    pool.query(query2051, [MN, CN, date, pollutants, sourceIp, lastUpdate, rawData], (err) => {
        if (err) {
            console.error('数据库2051实时插入失败:', err.message);
        } else {
            console.info(`成功存储解析后的数据到2051分钟数据库: MN=${MN},CN=${CN} , Raw Data=${rawData}`);
            

        }
    });
}
if (CN=='2061') {
    pool.query(query2061, [MN, CN, date, pollutants, sourceIp, lastUpdate, rawData], (err) => {
        if (err) {
            console.error('数据库2061实时插入失败:', err.message);
        } else {
            console.info(`成功存储解析后的数据到2061小时数据库: MN=${MN},CN=${CN} , Raw Data=${rawData}`);
            

        }
    });
}

}

// Helper function to convert DataTime string (YYYYMMDDHHMMSS) to DATETIME format
function formatDataTime(dataTimeStr) {
    // Check if DataTime is in the correct format (YYYYMMDDHHMMSS)
    if (!dataTimeStr || dataTimeStr.length !== 14) {
        console.error('无效的DataTime:', dataTimeStr);

        return new Date(); // fallback to current date/time if invalid
    }

    // Convert DataTime (e.g., "20210320155000") to "YYYY-MM-DD HH:MM:SS" format
    const year = dataTimeStr.substring(0, 4);
    const month = dataTimeStr.substring(4, 6);
    const day = dataTimeStr.substring(6, 8);
    const hour = dataTimeStr.substring(8, 10);
    const minute = dataTimeStr.substring(10, 12);
    const second = dataTimeStr.substring(12, 14);
    console.info('数据包时间', dataTimeStr);
    writeLog('数据包时间' + dataTimeStr);
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// 更新 HJ212 数据解析和存储逻辑
function parseHJ212(data) {
    try {
        const message = data.toString('utf8');
        const subStr = message.substring(message.indexOf('QN'));
        const formatted = subStr.replace(/,/g, ';');
        const parts = formatted.split('&&');

        if (parts.length < 2) throw new Error('数据格式错误');

        const baseParams = parts[0].split(';').reduce((map, param) => {
            const [key, value] = param.split('=');
            if (key) map[key] = value || null;
            return map;
        }, {});

        const dataParams = parts[1].split(';').reduce((map, param) => {
            const [key, value] = param.split('=');
            if (key) map[key] = value || null;
            return map;
        }, {});

        return { baseParams, dataParams };
    } catch (err) {
        console.error('HJ212 解析失败:', err.message);
        throw err;
    }
}

// 初始化数据库表后启动服务器
createInitialTables().then(() => {
    console.log('初始数据库表创建成功，继续启动服务');
    // 使用 express.static 提供静态文件目录
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
    app.get('/history', (req, res) => res.sendFile(path.join(__dirname, 'public', 'history.html')));
    app.get('/select', (req, res) => res.sendFile(path.join(__dirname, 'public', 'HistorySelect.html')));
    app.get('/log', (req, res) => res.sendFile(path.join(__dirname, 'server.log')));
    app.get('/img', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pollutants.html')));
    app.get('/WEB_js/chart.js', (req, res) => res.sendFile(path.join(__dirname, 'public', 'chart.js')));
    app.get('/WEB_js/pollutants_map.js', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pollutants_map.js')));

    app.get('/getIP', (req, res) => {
        const os = require('os');
        const interfaces = os.networkInterfaces();
        for (const devName in interfaces) {
            const iface = interfaces[devName];
            for (const alias of iface) {
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    res.json({ ip: alias.address });

                    return;
                }
            }
        }
        res.status(404).json({ error: '无法获取IP地址' });
    });






    // 定义路由，用于获取所有历史接收数据的接口
    app.get('/getHistoryData', (req, res) => {
        // 获取前端传递的页码参数，默认值为1（如果前端没传的话）
        const page = parseInt(req.query.page) || 1;
        // 每页显示的数据条数，这里设置为1000条
        const pageSize = 1000;
        // 计算偏移量，用于确定从哪条记录开始查询
        const offset = (page - 1) * pageSize;
        // 查询received_data表中的数据，按照ID倒叙排序，通过偏移量和每页条数来实现分页查询的SQL语句
        const querySql = `SELECT * FROM received_data ORDER BY ID DESC LIMIT ${pageSize} OFFSET ${offset}`;
        pool.query(querySql, (err, results) => {
            if (err) {
                console.log('查询历史数据失败:', err);
                res.status(500).json({ error: '查询历史数据失败' });
                return;
            }
            res.json({ data: results });
        });
    });

    // 使用查询特定的数据

    app.post('/LookupData', express.json(), (req, res) => {
        const { MN, Time, Flag, IP, CN } = req.body;

        // 构建基础 SQL 查询
        //弃用 let query = 'SELECT * FROM received_data WHERE 1=1';
        let query2011 = 'SELECT * FROM received_2011_data WHERE 1=1';
        let query2051 = 'SELECT * FROM received_2051_data WHERE 1=1';
        let query2061 = 'SELECT * FROM receive_2061d_data WHERE 1=1';
        let query2031 = 'SELECT * FROM receive_2031d_data WHERE 1=1';
        const queryParams = [];

        // 动态添加查询条件
        if (CN=="2011") {
            if (MN) {
                query2011 += ' AND MN = ?';
                queryParams.push(MN);
            }
            if (IP) {
                query2011 += ' AND source_ip = ?';
                queryParams.push(IP);
            }
            if (CN) {
                query2011 += ' AND CN = ?';
                queryParams.push(CN);
    
            }
            if (Time) {
                query2011 += ' AND date = ?';
                queryParams.push(Time); // 确保前端传来的 Time 格式为 'YYYY-MM-DD HH:MM:SS'
            }
            if (Flag) {
                //有问题
                query2011 += ' AND JSON_EXTRACT(pollutants, ?) = ?';
                queryParams.push(`$.${Flag}`, Flag);
            }
        }


        if (CN=="2051") {
            if (MN) {
                query2051 += ' AND MN = ?';
                queryParams.push(MN);
            }
            if (IP) {
                query2051 += ' AND source_ip = ?';
                queryParams.push(IP);
            }
            if (CN) {
                query2051 += ' AND CN = ?';
                queryParams.push(CN);
    
            }
            if (Time) {
                query2051 += ' AND date = ?';
                queryParams.push(Time); // 确保前端传来的 Time 格式为 'YYYY-MM-DD HH:MM:SS'
            }
            if (Flag) {
                //有问题
                query2051 += ' AND JSON_EXTRACT(pollutants, ?) = ?';
                queryParams.push(`$.${Flag}`, Flag);
            }
        }


        if (CN=="2061") {
            if (MN) {
                query2061 += ' AND MN = ?';
                queryParams.push(MN);
            }
            if (IP) {
                query2061 += ' AND source_ip = ?';
                queryParams.push(IP);
            }
            if (CN) {
                query2061 += ' AND CN = ?';
                queryParams.push(CN);
    
            }
            if (Time) {
                query2061 += ' AND date = ?';
                queryParams.push(Time); // 确保前端传来的 Time 格式为 'YYYY-MM-DD HH:MM:SS'
            }
            if (Flag) {
                //有问题
                query2051 += ' AND JSON_EXTRACT(pollutants, ?) = ?';
                queryParams.push(`$.${Flag}`, Flag);
            }
        }

        if (CN=="2031") {
            if (MN) {
                query2031 += ' AND MN = ?';
                queryParams.push(MN);
            }
            if (IP) {
                query2031 += ' AND source_ip = ?';
                queryParams.push(IP);
            }
            if (CN) {
                query2031 += ' AND CN = ?';
                queryParams.push(CN);
    
            }
            if (Time) {
                query2031 += ' AND date = ?';
                queryParams.push(Time); // 确保前端传来的 Time 格式为 'YYYY-MM-DD HH:MM:SS'
            }
            if (Flag) {
                //有问题
                query2031 += ' AND JSON_EXTRACT(pollutants, ?) = ?';
                queryParams.push(`$.${Flag}`, Flag);
            }
        }

        // 如果没有提供有效的查询条件，返回错误
        if (queryParams.length === 0) {
            res.status(400).json({ error: '至少需要提供一个查询条件 (MN、Time、Flag、IP、CN)' });
            return;
        }

        // 执行查询
        pool.query(query, queryParams, (err, results) => {
            if (err) {
                console.error('查询失败:', err);
                res.status(500).json({ error: '查询失败，请检查查询条件或稍后再试' });
                return;
            }
            if (results == '') {
                console.error('查询为空:', err);
                res.status(400).json({ error: '没有查询到数据' });
                return;
            }
            // 返回查询结果
            res.json({ data: results });
        });
    });

    app.post('/LookupData_10', express.json(), (req, res) => {
        const { MN, Time, Flag, IP, CN } = req.body;
    
        // 定义表和最大 ID 查询的映射
        const tableMap = {
            "2011": "received_2011_data",
            "2051": "received_2051_data",
            "2061": "received_2061_data",
            "2031": "received_2031_data",
        };
    
        // 确保 CN 在映射中有效
        if (!tableMap[CN]) {
            return res.status(400).json({ error: '无效的 CN 参数' });
        }
    
        const tableName = tableMap[CN];
        const maxIdQuery = `SELECT MAX(ID) AS maxId FROM ${tableName}`;
        let query = `SELECT * FROM ${tableName} WHERE 1=1`;
        const queryParams = [];
    
        // 动态添加查询条件
        if (MN) {
            query += ' AND MN = ?';
            queryParams.push(MN);
        }
        if (IP) {
            query += ' AND source_ip = ?';
            queryParams.push(IP);
        }
        if (Time) {
            query += ' AND date = ?';
            queryParams.push(Time);
        }
        if (Flag) {
            query += ' AND JSON_EXTRACT(pollutants, ?) = ?';
            queryParams.push(`$.${Flag}`, Flag);
        }
    
        // 查询最大 ID
        pool.query(maxIdQuery, (err, maxIdResult) => {
            if (err) {
                console.error('查询最大 ID 失败:', err);
                return res.status(500).json({ error: '查询最大 ID 失败，请稍后再试' });
            }
    
            const maxId = maxIdResult[0]?.maxId;
    
            if (!maxId) {
                console.error('未找到最大 ID');
                return res.status(400).json({ error: '没有查询到有效的最大 ID' });
            }
    
            // 根据最大 ID 查询前 10 条记录
            query += ' AND ID <= ? ORDER BY ID DESC LIMIT 10';
            queryParams.push(maxId);
    
            pool.query(query, queryParams, (err, results) => {
                if (err) {
                    console.error('查询失败:', err);
                    return res.status(500).json({ error: '查询失败，请稍后再试' });
                }
    
                if (results.length === 0) {
                    console.error('查询为空');
                    return res.status(400).json({ error: '没有查询到数据' });
                }
    
                // 返回查询结果
                res.json({ data: results });
            });
        });
    });
    





    app.get('/getTCPports', (req, res) => {
        const ports = Object.keys(tcpServers);
        res.json({ ports });
    });

    app.post('/setTCPport', express.json(), (req, res) => {
        const newPort = req.body.port;

        // 检查端口是否已被占用
        if (tcpServers[newPort]) {
            res.status(400).json({ error: '端口已被占用' });
            return;
        }

        const server = net.createServer((socket) => {
            socket.on('data', (data) => {
                const sourceIp = socket.remoteAddress;  // 客户端 IP 地址
                const rawData = data.toString('utf8'); // 原始数据
                console.log(``);
                console.log(`客户端IP${sourceIp}本地端口 ${newPort} 接收到数据: ${rawData}`);

                // 解析数据并存储
                try {
                    const parsedData = parseHJ212(data);
                    saveParsedData(parsedData, sourceIp, rawData);
                } catch (err) {
                    console.error('解析 HJ212 数据失败:', err.message);
                }
            });
        });

        server.listen(newPort, () => {
            tcpServers[newPort] = server;
            res.json({ success: true });
        });

        server.on('error', (err) => {
            res.status(500).json({ error: err.message });
        });
    });







    app.listen(port, '0.0.0.0', () => {
        console.log(`Web 服务运行在http://127.0.0.1:${port}`);
        setTimeout(() => {

            axios.post('http://127.0.0.1:8080/setTCPport', { port: 3000 })
                .then(response => console.log('自动设置TCP端口成功:', response.data))
                .catch(error => console.error('自动设置TCP端口失败:', error.message));
        }, 100);
    });
}).catch((err) => {
    console.error('启动服务器过程中出现错误:', err);
});


//以下部分无关紧要
function writeLog(message) {
    // 获取当前文件的大小（字节数）
    const fileStats = fs.statSync(logFilePath);
    const fileSize = fileStats.size;

    if (fileSize >= 8192 * 1024) {
        // 如果文件大小超过8MB，先清空文件（覆盖内容）
        fs.writeFileSync(logFilePath, '');
    }

    // 将日志信息追加到文件中
    fs.appendFileSync(logFilePath, message + '\n');

}

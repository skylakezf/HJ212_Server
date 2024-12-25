const net = require('net');
const axios = require('axios');
const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const scSend = require('serverchan-sdk');
const { log } = require('console');


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
                    MN VARCHAR(50)  PRIMARY KEY,                    -- 数据采集仪的唯一标识
                    last_Update_date DATETIME,          -- 数据接收日期（来自DataTime）
                    Address VARCHAR(50),          --  地址
                    Exceeded_Flag VARCHAR(5)                -- 状态标记
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
                      raw_data TEXT,                      -- 用于存储原始接收的数据
                dataParamsFlag JSON                 -- 用于存储接收到的Flag
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `;
            connection.query(createReceivedDataTable, (err) => {
                connection.release();
                if (err) {
                    console.error('创建 received_data 表失败:', err);
                    reject(err);
                    return;
                }
                console.log('数据库表received_data已存在');
                resolve();
            });
            // 创建以 MN 为主键的2011实时数据 received_data 表
            const createReceived2011DataTable = `
            CREATE TABLE IF NOT EXISTS received_2011_data (
                id INT AUTO_INCREMENT PRIMARY KEY,  -- 自增ID
                MN VARCHAR(50),                    -- 数据采集仪的唯一标识
                CN VARCHAR(6),                    -- 数据状态
                date DATETIME,                      -- 数据接收日期（来自DataTime）
                pollutants JSON,                    -- 污染物数据 (JSON 格式)
                source_ip VARCHAR(45),              -- 来源 IP 地址
                last_update DATETIME,               -- 数据最后更新时间（接收到数据包的时间）
                raw_data TEXT,                      -- 用于存储原始接收的数据
                dataParamsFlag JSON                 -- 用于存储接收到的Flag
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
            connection.query(createReceived2011DataTable, (err) => {
                connection.release();
                if (err) {
                    console.error('创建2011received表失败:', err);
                    reject(err);
                    return;
                }
                console.log('数据库表2011DataTable已存在');
                resolve();
            });
            // 创建以 MN 为主键的2051分钟数据 received_data 表
            const createReceived2051DataTable = `
        CREATE TABLE IF NOT EXISTS received_2051_data (
            id INT AUTO_INCREMENT PRIMARY KEY,  -- 自增ID
                MN VARCHAR(50),                    -- 数据采集仪的唯一标识
                CN VARCHAR(6),                    -- 数据状态
                date DATETIME,                      -- 数据接收日期（来自DataTime）
                pollutants JSON,                    -- 污染物数据 (JSON 格式)
                source_ip VARCHAR(45),              -- 来源 IP 地址
                last_update DATETIME,               -- 数据最后更新时间（接收到数据包的时间）
                raw_data TEXT,                      -- 用于存储原始接收的数据
                dataParamsFlag JSON                 -- 用于存储接收到的Flag
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
            connection.query(createReceived2051DataTable, (err) => {
                connection.release();
                if (err) {
                    console.error('创建2051received表失败:', err);
                    reject(err);
                    return;
                }
                console.log('数据库表2051DataTable已存在');
                resolve();
            });
            // 创建以 MN 为主键的2061小时数据 received_data 表
            const createReceived2061DataTable = `
    CREATE TABLE IF NOT EXISTS received_2061_data (
        id INT AUTO_INCREMENT PRIMARY KEY,  -- 自增ID
                MN VARCHAR(50),                    -- 数据采集仪的唯一标识
                CN VARCHAR(6),                    -- 数据状态
                date DATETIME,                      -- 数据接收日期（来自DataTime）
                pollutants JSON,                    -- 污染物数据 (JSON 格式)
                source_ip VARCHAR(45),              -- 来源 IP 地址
                last_update DATETIME,               -- 数据最后更新时间（接收到数据包的时间）
                raw_data TEXT,                      -- 用于存储原始接收的数据
                dataParamsFlag JSON                 -- 用于存储接收到的Flag
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;
            connection.query(createReceived2061DataTable, (err) => {
                connection.release();
                if (err) {
                    console.error('创建2061received表失败:', err);
                    reject(err);
                    return;
                }
                console.log('数据库表2061received已存在');
                resolve();
            });
            // 创建以 MN 为主键的2031日数据 received_data 表
            const createReceived2031DataTable = `
CREATE TABLE IF NOT EXISTS received_2031_data (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- 自增ID
    MN VARCHAR(50),                    -- 数据采集仪的唯一标识
    CN VARCHAR(6),                    -- 数据状态
    date DATETIME,                      -- 数据接收日期（来自DataTime）
    pollutants JSON,                    -- 污染物数据 (JSON 格式)
    source_ip VARCHAR(45),              -- 来源 IP 地址
    last_update DATETIME,               -- 数据最后更新时间（接收到数据包的时间）
    raw_data TEXT,                       -- 用于存储原始接收的数据
     dataParamsFlag JSON                 -- 用于存储接收到的Flag
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
async function saveParsedData(parsedData, sourceIp, rawData) {
    const { baseParams, dataParams, dataParamsFlag = {} } = parsedData;
    // console.log(parsedData)
    const MN = baseParams['MN'];
    const CN = baseParams['CN'];
    const dataTimeStr = dataParams['DataTime'];
    const date = formatDataTime(dataTimeStr);
    const lastUpdate = new Date();

    console.info('当前时间', lastUpdate);
    writeLog('当前时间' + lastUpdate);

    const pollutants = JSON.stringify(dataParams);
    const dataParamsFlagStr = JSON.stringify(dataParamsFlag);


    const insertData = (tableName) => {
        const query = `
            INSERT INTO ${tableName} (MN, CN, date, pollutants, source_ip, last_update, raw_data, dataParamsFlag)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        pool.query(query, [MN, CN, date, pollutants, sourceIp, lastUpdate, rawData, dataParamsFlagStr], (err) => {
            if (err) {
                console.error(`数据库${CN}实时插入失败:`, err.message);
            } else {
                console.info(`成功存储解析后的数据到${tableName}: MN=${MN}, CN=${CN}, Raw Data=${rawData}`);
            }
        });
    };

    const createOrUpdateMMData = () => {
        const createQuery = `
            INSERT INTO MM_last_update_data (MN, last_Update_date)
            VALUES (?, ?);
        `;
        const updateQuery = `
            UPDATE MM_last_update_data
            SET last_Update_date = ?
            WHERE MN = ?;
        `;

        pool.query(createQuery, [MN, lastUpdate], (err) => {
            if (err) {
                pool.query(updateQuery, [lastUpdate, MN], (err) => {
                    if (err) {
                        console.error('更新MN最后上传数据信息失败:', err);
                    } else {
                        console.info(`成功更新MN信息: MN=${MN}, 最后更新时间=${lastUpdate}`);
                    }
                });
            } else {
                console.info(`成功插入MN信息: MN=${MN}, 最后更新时间=${lastUpdate}`);
            }
        });
    };

    createOrUpdateMMData();
    insertData('received_data');

    // Insert data based on CN value
    const cnMap = {
        '2011': 'received_2011_data',
        '2031': 'received_2031_data',
        '2051': 'received_2051_data',
        '2061': 'received_2061_data',
    };

    const tableName = cnMap[CN];
    if (tableName) {
        insertData(tableName);
    }
}


function parseDataParamsFlag(dataParamsFlag) {
    const result = [];

    Object.entries(dataParamsFlag).forEach(([key, value]) => {
        const pollutantCode = key.split('-')[0]; // 提取污染物编码
        const pollutant = pollutantsMapping[pollutantCode] || `未知污染物(${pollutantCode})`;
        const flag = flagMapping[value] || `未知状态(${value})`;

        result.push(`${pollutant}_状态_${flag}`);
    });

    return result.join('; ');
}

//微信推送


const filePath = path.join(__dirname, 'Key.txt');
const PushdeerfilePath = path.join(__dirname, 'pushkey.txt');
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
            res.status(500).send('无法写入 Key');
            console.error(err);
        } else {
            res.send('Key已更新');
        }
    });
});




app.get('/PushKey.txt', (req, res) => {
    fs.readFile(PushdeerfilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('无法读取 Key.txt');
            console.error(err);
        } else {
            res.send(data);
        }
    });
});

// 修改 Key.txt 文件
app.post('/PushKey.txt', (req, res) => {
    const { content } = req.body;
    if (typeof content !== 'string') {
        res.status(400).send('内容必须是字符串');
        return;
    }

    fs.writeFile(PushdeerfilePath, content, 'utf8', (err) => {
        if (err) {
            res.status(500).send('无法写入 Key');
            console.error(err);
        } else {
            res.send('Key已更新');
        }
    });
});





let lastSentMessage = ""; // 保存上次发送的消息

function getServerChanKey(callback) {
    fs.readFile('Key.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('KEY密钥文件读取失败:', err.message);
            callback(err, null); // 出错时执行回调并传递错误
        } else {
            callback(null, data.trim()); // 成功时执行回调并传递密钥
        }
    });
}
function getPushDeernKey(callback) {
    fs.readFile('pushkey.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('pushdeerKEY密钥文件读取失败:', err.message);
            callback(err, null); // 出错时执行回调并传递错误
        } else {
            callback(null, data.trim()); // 成功时执行回调并传递密钥
        }
    });
}



function sendToServerChan(message) {
    if (message === lastSentMessage) {
        console.log('消息未变化 serverChan');
        return; // 跳过发送
    }

    // 调用 getServerChanKey 时必须提供回调函数
    getServerChanKey((err, serverChanKey) => {
        if (err) {
            console.error('无法获取 Server 酱密钥，跳过消息发送');
            return;
        }

        const url = `https://sctapi.ftqq.com/${serverChanKey}.send`;

        axios.post(url, {
            title: '设备信息警告',
            desp: message,
        })
            .then((response) => {
                if (response.data.code === 0) {
                    console.log('设备警告消息发送成功');
                    lastSentMessage = message; // 更新上次发送的消息
                } else {
                    console.error('设备警告消息发送失败:', response.data);
                }
            })
            .catch((err) => {
                console.error('设备警告请求出错:', err.message);
            });
    });
}
function sendToPushDeer(message) {
    if (message === lastSentMessage) {
        console.log('消息未变化 PushDeer');
        return; // Skip if the message hasn't changed
    }

    // Get PushDeer key through the getPushDeernKey function
    getPushDeernKey((err, pushDeerKey) => {
        if (err) {
            console.error('无法获取 PushDeer 密钥，跳过消息发送');
            return;
        }

        const url = `https://api2.pushdeer.com/message/push?pushkey=${pushDeerKey}`;

        axios.post(url, {
            text: '设备信息警告',  // Title of the push message
            desp: message,         // The message content
        })
            .then((response) => {
                if (response.data.code === 200) {
                    console.log('设备警告消息发送成功');
                    lastSentMessage = message; // Update the last sent message
                } else {
                    console.error('设备警告消息发送失败:', response.data);
                }
            })
            .catch((err) => {
                console.error('设备警告请求出错:', err.message);
            });
    });
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
function parseHJ212(data) {
    try {


        const message = data.toString('utf8');
        const subStr = message.substring(message.indexOf('QN'));
        const formatted = subStr.replace(/,/g, ';');
        const parts = formatted.split('&&');
        if (parts.length < 2) throw new Error('数据格式错误');

        // 解析 baseParams
        const baseParams = parts[0].split(';').reduce((map, param) => {
            const [key, value] = param.split('=');
            if (key) map[key] = value || null;
            return map;

        }, {});

        // 提取 MN 值
        const mnValue = baseParams['MN'] || '未知设备';
        // 解析 dataParams 和 dataParamsFlag
        const dataParams = {};
        const dataParamsFlag = {};


        parts[1].split(';').forEach(param => {
            const [key, value] = param.split('=');
            if (key) {
                if (key.endsWith('-Flag')) {
                    dataParamsFlag[key] = value || null;

                } else {
                    dataParams[key] = value || null;

                }

            }
        });

        // 解析 dataParamsFlag
        const flagMessage = parseDataParamsFlag(dataParamsFlag);
        console.log('解析结果污染物:', flagMessage);

        // 检查并发送消息逻辑
        Object.entries(dataParamsFlag).forEach(([key, value]) => {
            // 仅处理以 '-Flag' 结尾的字段
            console.log(dataParamsFlag)

            const hasNonNFlag = Object.entries(dataParamsFlag).some(([key, value]) => {
                return key.endsWith('-Flag') && value && value.slice(-1) !== 'N';
            });
            
            if (hasNonNFlag) {
                // 生成带 MN 的 flagMessage
                const flagMessageWithMN = `${flagMessage}`;

                // 发送消息
                sendToServerChan(flagMessageWithMN);
                sendToPushDeer(flagMessageWithMN);

                // 更新最后发送的消息
                lastSentMessage = flagMessageWithMN;
                // 查询并更新数据库


                // 更新数据库
                const updateQuery = `
                 UPDATE MM_last_update_data
                 SET Exceeded_Flag = ?, last_Update_date = NOW()
                WHERE MN = ?;
                 `;


                pool.query(updateQuery, [value, mnValue], (err, results) => {
                    if (err) {
                        console.error(`数据库更新失败: MN=${mnValue}, Exceeded=${value}`, err.message);
                    } else if (results.affectedRows === 0) {
                        console.warn(`数据库未找到匹配的 MN=${mnValue}，无法更新 Exceeded`);
                    } else {
                        console.info(`成功更新数据库: MN=${mnValue}, Exceeded=${value}`);
                    }
                });

            }else{

                 // 生成带 MN 的 flagMessage
                 const flagMessageWithMN = `${flagMessage}`;

                 
 
                 // 更新最后发送的消息
                 lastSentMessage = flagMessageWithMN;
                 // 查询并更新数据库
 
 
                 // 更新数据库
                 const updateQuery = `
                  UPDATE MM_last_update_data
                  SET Exceeded_Flag = ?, last_Update_date = NOW()
                 WHERE MN = ?;
                  `;
 
 
                 pool.query(updateQuery, [value, mnValue], (err, results) => {
                     if (err) {
                         console.error(`数据库更新失败: MN=${mnValue}, Exceeded=${value}`, err.message);
                     } else if (results.affectedRows === 0) {
                         console.warn(`数据库未找到匹配的 MN=${mnValue}，无法更新 Exceeded`);
                     } else {
                         console.info(`成功更新数据库: MN=${mnValue}, Exceeded=${value}`);
                     }
                 });
 
            }
        });

        return { baseParams, dataParams, dataParamsFlag };
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
    app.get('/MNStatus', (req, res) => res.sendFile(path.join(__dirname, 'public', 'MNStatus.html')));
    app.get('/log', (req, res) => res.sendFile(path.join(__dirname, 'server.log')));
    app.get('/img', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pollutants.html')));
    app.get('/key', (req, res) => res.sendFile(path.join(__dirname, 'public', 'key.html')));
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


    app.post('/LookupData', express.json(), async (req, res) => {
        const { MN, Time, Flag, IP, CN } = req.body;

        // Validate CN parameter
        const validCNs = ['2011', '2031', '2051', '2061'];
        if (!CN || !validCNs.includes(CN)) {
            return res.status(400).json({
                error: 'Invalid or missing CN parameter. Must be one of: 2011, 2031, 2051, 2061'
            });
        }

        // Map CN to table name
        const tableNames = {
            '2011': 'received_2011_data',
            '2031': 'received_2031_data',
            '2051': 'received_2051_data',
            '2061': 'received_2061_data'
        };

        // Build query and params
        let query = `SELECT * FROM ${tableNames[CN]} WHERE 1=1`;
        const queryParams = [];

        // Define conditions mapping
        const conditions = {
            MN: { value: MN, clause: 'MN = ?' },
            IP: { value: IP, clause: 'source_ip = ?' },
            CN: { value: CN, clause: 'CN = ?' },
            Time: { value: Time, clause: 'date = ?' },
            Flag: {
                value: Flag,
                clause: 'JSON_EXTRACT(pollutants, ?) = ?',
                paramProcessor: (flag) => [`$.${flag}`, flag]
            }
        };

        // Add conditions dynamically
        for (const [key, condition] of Object.entries(conditions)) {
            if (condition.value) {
                query += ` AND ${condition.clause}`;
                if (condition.paramProcessor) {
                    queryParams.push(...condition.paramProcessor(condition.value));
                } else {
                    queryParams.push(condition.value);
                }
            }
        }

        // Validate if any search criteria provided
        if (queryParams.length === 0) {
            return res.status(400).json({
                error: '至少需要提供一个查询条件 (MN、Time、Flag、IP、CN)'
            });
        }

        try {
            // Execute query using promise wrapper for cleaner error handling
            const [results] = await pool.promise().query(query, queryParams);

            if (!results.length) {
                return res.status(400).json({ error: '没有查询到数据' });
            }

            res.json({ data: results });
        } catch (err) {
            console.error('查询失败:', err);
            res.status(500).json({
                error: '查询失败，请检查查询条件或稍后再试'
            });
        }
    });

    // 获取连接过平台的服务器最后上传时间
    app.get('/getMN_lastUpdate_Data', (req, res) => {

        const querySql = `SELECT * FROM MM_last_update_data`;
        pool.query(querySql, (err, results) => {
            if (err) {
                console.log('查询MN最后更新时间数据失败:', err);
                res.status(500).json({ error: '查询历史数据失败' });
                return;
            }
            res.json({ Last_MN_TIME: results });
        });
    });


    // 更新设备地址
app.post('/updateDeviceAddress', (req, res) => {
    const { MN, Address } = req.body;

    if (!MN || !Address) {
        res.status(400).json({ error: '设备编号 (MN) 和地址 (Address) 是必需的' });
        return;
    }

    const updateQuery = `
        UPDATE MM_last_update_data
        SET Address = ?
        WHERE MN = ?;
    `;

    pool.query(updateQuery, [Address, MN], (err, results) => {
        if (err) {
            console.error(`数据库更新失败: MN=${MN}, Address=${Address}`, err.message);
            res.status(500).json({ error: '更新地址失败' });
            return;
        }

        if (results.affectedRows === 0) {
            res.status(404).json({ error: `未找到设备编号为 ${MN} 的设备` });
        } else {
            res.json({ success: true, message: `设备地址已成功更新: MN=${MN}, Address=${Address}` });
        }
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







//定义文件

const pollutantsMapping = {
    "w00000": "污水",
    "w01001": "pH 值",
    "w01002": "色度",
    "w01006": "溶解性总固体",
    "w01009": "溶解氧",
    "w01010": "水温",
    "w01012": "悬浮物",
    "w01014": "电导率",
    "w01017": "五日生化需氧量",
    "w01018": "化学需氧量",
    "w01019": "高锰酸盐指数",
    "w01020": "总有机碳",
    "w02003": "粪大肠菌群",
    "w02006": "细菌总数",
    "w03001": "总 α 放射性",
    "w03002": "总 β 放射性",
    "w19001": "表面活性剂",
    "w19002": "阴离子表面活性剂",
    "w20012": "钡",
    "w20023": "硼",
    "w20038": "钴",
    "w20061": "钼",
    "w20089": "铊",
    "w20092": "锡",
    "w20111": "总汞",
    "w20113": "烷基汞",
    "w20115": "总镉",
    "w20116": "总铬",
    "w20117": "六价铬",
    "w20119": "总砷",
    "w20120": "总铅",
    "w20121": "总镍",
    "w20122": "总铜",
    "w20123": "总锌",
    "w20124": "总锰",
    "w20125": "总铁",
    "w20126": "总银",
    "w20127": "总铍",
    "w20128": "总硒",
    "w20138": "铜",
    "w20139": "锌",
    "w20140": "硒",
    "w20141": "砷",
    "w20142": "汞",
    "w20143": "镉",
    "w20144": "铅",
    "w21001": "总氮",
    "w21003": "氨氮",
    "w21004": "凯氏氮",
    "w21006": "亚硝酸盐",
    "w21007": "硝酸盐",
    "w21011": "总磷",
    "w21016": "氰化物",
    "w21017": "氟化物",
    "w21019": "硫化物",
    "w21022": "氯化物",
    "w21038": "硫酸盐",
    "w22001": "石油类",
    "w23002": "挥发酚",
    "w25043": "苯并[α]芘",
    "w33001": "六六六",
    "w33007": "滴滴涕",
    "w99001": "有机氮",
    "a00000": "废气",
    "a01001": "温度",
    "a01002": "湿度",
    "a01006": "气压",
    "a01007": "风速",
    "a01008": "风向",
    "a01010": "林格曼黑度",
    "a01011": "烟气流速",
    "a01012": "烟气温度",
    "a01013": "烟气压力",
    "a01014": "烟气湿度",
    "a01015": "制冷温度",
    "a01016": "烟道截面积",
    "a01017": "烟气动压",
    "a01901": "垃圾焚烧炉膛内焚烧平均温度",
    "a01902": "垃圾焚烧炉膛内DCS温度",
    "a05001": "二氧化碳",
    "a05002": "甲烷",
    "a05008": "三氯一氟甲烷",
    "a05009": "二氯二氟甲烷",
    "a05013": "三氯三氟乙烷",
    "a19001": "氧气含量",
    "a20007": "砷",
    "a20016": "铍及其化合物",
    "a20025": "镉及其化合物",
    "a20026": "镉",
    "a20043": "铅及其化合物",
    "a20044": "铅",
    "a20057": "汞及其化合物",
    "a20058": "汞",
    "a20063": "镍及其化合物",
    "a20091": "锡及其化合物",
    "a21001": "氨（氨气）",
    "a21002": "氮氧化物",
    "a21003": "一氧化氮",
    "a21004": "二氧化氮",
    "a21005": "一氧化碳",
    "a21017": "氰化物",
    "a21018": "氟化物",
    "a21022": "氯气",
    "a21024": "氯化氢",
    "a21026": "二氧化硫",
    "a21028": "硫化氢",
    "a23001": "酚类",
    "a24003": "二氯甲烷",
    "a24004": "三氯甲烷",
    "a24005": "四氯甲烷",
    "a24006": "二溴一氯甲烷",
    "a24007": "一溴二氯甲烷",
    "a24008": "溴甲烷",
    "a24009": "三溴甲烷",
    "a24015": "氯乙烷",
    "a24016": "1,1-二氯乙烷",
    "a24017": "1,2-二氯乙烷",
    "a24018": "1,1,1-三氯乙烷",
    "a24019": "1,1,2-三氯乙烷",
    "a24020": "1,1,2,2-四氯乙烷",
    "a24027": "1,2-二氯丙烷",
    "a24034": "1,2-二溴乙烷",
    "a24036": "环己烷",
    "a24042": "正己烷",
    "a24043": "正庚烷",
    "a24046": "氯乙烯",
    "a24047": "1,1-二氯乙烯",
    "a24049": "三氯乙烯",
    "a24050": "四氯乙烯",
    "a24053": "丙烯",
    "a24054": "1,3-二氯丙烯",
    "a24072": "1,4-二恶烷",
    "a24078": "1,3-丁二烯",
    "a24087": "碳氢化合物",
    "a24088": "非甲烷总烃",
    "a24099": "氯甲烷",
    "a24110": "反式-1,2-二氯乙烯",
    "a24111": "顺式-1,2-二氯乙烯",
    "a24112": "反式-1,3-二氯丙烯",
    "a24113": "六氯-1,3-丁二烯",
    "a25002": "苯",
    "a25003": "甲苯",
    "a25004": "乙苯",
    "a25005": "二甲苯",
    "a25006": "1,2-二甲基苯",
    "a25007": "1,3-二甲基苯",
    "a25008": "1,4-二甲基苯",
    "a25010": "氯苯",
    "a25011": "1,2-二氯苯",
    "a25012": "1,3-二氯苯",
    "a25013": "1,4-二氯苯",
    "a25014": "三氯苯",
    "a25017": "四氯苯",
    "a25018": "苯并[a]芘",
    "a25019": "苯并(b)芘",
    "a25020": "苯并(k)芘",
    "a25021": "二噁英",
    "a25022": "二甲基苯",
    "a25023": "乙苯",
    "a25024": "苯乙烯",
    "a25025": "苯并[n]芘",
    "a25026": "氯乙烯"


    //HJ212-2005
    "B03": "噪声",
"L10": "累计百分声级 L10",
"L5": "累计百分声级 L5",
"L50": "累计百分声级 L50",
"L90": "累计百分声计 L90",
"L95": "累计百分声级 L95",
"Ld": "夜间等效声级 Ld",
"Ldn": "昼夜等效声级 Ldn",
"Leq": "30 秒等效声级 Leq",
"LMn": "最小的瞬时声级",
"LMx": "最大的瞬时声级",
"Ln": "昼间等效声级 Ln",
"S01": "O2 含量",
"S02": "烟气流速",
"S03": "烟气温度",
"S04": "烟气动压",
"S05": "烟气湿度",
"S06": "制冷温度",
"S07": "烟道截面积",
"S08": "烟气压力",
"B02": "废气",
"01": "烟尘",
"02": "二氧化硫",
"03": "氮氧化物",
"04": "一氧化碳",
"05": "硫化氢",
"06": "氟化物",
"07": "氰化物 (含氰化氢)",
"08": "氯化氢",
"09": "沥青烟",
"10": "氨",
"11": "氯气",
"12": "二硫化碳",
"13": "硫醇",
"14": "硫酸雾",
"15": "铬酸雾",
"16": "苯系物",
"17": "甲苯",
"18": "二甲苯",
"19": "甲醛",
"20": "苯并 (a) 芘",
"21": "苯胺类",
"22": "硝基苯类",
"23": "氯苯类",
"24": "光气",
"25": "碳氢化合物 (含非甲烷总烃)",
"26": "乙醛",
"27": "酚类",
"28": "甲醇",
"29": "氯乙烯",
"30": "二氧化碳",
"31": "汞及其化合物",
"32": "铅及其化合物",
"33": "镉及其化合物",
"34": "锡及其化合物",
"35": "镍及其化合物",
"36": "铍及其化合物",
"37": "林格曼黑度",
"99": "其他气污染物",
"B01": "污水",
"001": "pH 值",
"002": "色度",
"003": "悬浮物",
"010": "生化需氧量（BOD5）",
"011": "化学需氧量（CODcr）",
"015": "总有机碳",
"020": "总汞",
"021": "烷基汞",
"022": "总镉",
"023": "总铬",
"024": "六价铬",
"025": "三价铬",
"026": "总砷",
"027": "总铅",
"028": "总镍",
"029": "总铜",
"030": "总锌",
"031": "总锰",
"032": "总铁",
"033": "总银",
"034": "总铍",
"035": "总硒",
"036": "锡",
"037": "硼",
"038": "钼",
"039": "钡",
"040": "钴",
"041": "铊",
"060": "氨氮",
"061": "有机氮",
"065": "总氮",
"080": "石油类",
"101": "总磷"
};

const flagMapping = {
    "N": "在线监控（监测）仪器仪表工作正常",
    "F": "在线监控（监测）仪器仪表停运",
    "M": "在线监控（监测）仪器仪表处于维护期间产生的数据",
    "S": "手工输入的设定值",
    "D": "在线监控（监测）仪器仪表故障",
    "C": "在线监控（监测）仪器仪表处于校准状态",
    "T": "在线监控（监测）仪器仪表采样数值超过测量上限",
    "B": "在线监控（监测）仪器仪表与数采仪通讯异常"
};
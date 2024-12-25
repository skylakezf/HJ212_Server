if (key.endsWith('-Flag') && value) {
  // 生成带 MN 的 flagMessage
  const flagMessageWithMN = `${flagMessage}_编号: ${mnValue}`;
  
  // 发送消息
  sendToServerChan(flagMessageWithMN);
  sendToPushDeer(flagMessageWithMN);

  // 更新最后发送的消息
  lastSentMessage = flagMessageWithMN;

  // 更新数据库
  const updateQuery = `
      UPDATE MM_last_update_data
      SET Exceeded_Flag = ?, last_Update_date = NOW()
      WHERE MN = ?;
  `;

  pool.query(updateQuery, [value, mnValue], (err, results) => {
      if (err) {
          console.error(`数据库更新失败: MN=${mnValue}, Exceeded_Flag=${value}`, err.message);
      } else if (results.affectedRows === 0) {
          console.warn(`数据库未找到匹配的 MN=${mnValue}，无法更新 Exceeded_Flag`);
      } else {
          console.info(`成功更新数据库: MN=${mnValue}, Exceeded_Flag=${value}`);
      }
  });
}

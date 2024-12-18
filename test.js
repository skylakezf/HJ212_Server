// 假设污染物数据对象
let pollutants = {
    'a00000-Flag': 'N',
    'b00001-Flag': 'Y',
    'c00002-Flag': 'N',
    'd00003-Flag': 'Y',
    // 其他污染物...
  };
  
  // 正则表达式用于匹配以 '-Flag' 结尾的污染物键
  let regex = /^(.*)-Flag$/; // 匹配类似 'a00000-Flag' 的字符串
  
  // 遍历污染物对象
  for (let key in pollutants) {
    if (regex.test(key)) {
      let status = pollutants[key]; // 获取状态值
      if (status === 'N') {
        console.log(`污染物 ${key} 的状态是 N`);
      } else {
        console.log(`污染物 ${key} 的状态不是 N`);
      }
    }
  }
  
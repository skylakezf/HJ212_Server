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

    //hj212-2005
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
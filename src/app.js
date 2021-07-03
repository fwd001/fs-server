const express = require("express");
const path = require("path");
const schedule = require("node-schedule");
const request = require("./request.js");
const DB = require("./db.js");
const Bot = require("./bot");

const app = express();
const port = 3000;

// 没有用到
app.get("/", (req, res) => {
  res.send("Hello World!");
});

const webhook =
  "https://open.feishu.cn/open-apis/bot/v2/hook/xxxx";
// const webhook = "http://localhost:3002/test";
const secret = "83xxxx";

// 初始化机器人
const bot = new Bot({
  webhook: webhook,
  secret: secret,
  request: request,
});

// 存储数据文件路径
const dataDirPath = path.join(__dirname, "./data.json");

// 初始化存储模块
const db = new DB({
  path: dataDirPath,
});

/**
 * 周会定期推送的内容逻辑 开始
 */
// 技术分享名单顺序
const technicalShareList = [
  "刘晓林",
  "雷波",
  "古春慧",
  "胡园武",
  "潘洋",
  "蔡佳华",
  "黄崇林",
  "伏文东",
  "陈怡航",
];
// 周会分享名单顺序
const weekShareList = [
  "刘晓林",
  "陈怡航",
  "伏文东",
  "黄崇林",
  "蔡佳华",
  "潘洋",
  "胡园武",
  "古春慧",
  "雷波",
];
// 企业组总人数
const totalPeople = technicalShareList.length;

/**
 * 拼接周会文字
 *
 * @param {Number} wsIndex 周会分享人下标
 * @param {Number} tsIndex 技术分享人下标
 * @returns
 */
const spliceInstructions = (wsIndex = 0, tsIndex = 0) => {
  // 确定周几
  const weeks = ["周⑦ 😏", "周一😒", "周二😒", "周三😒", "周四😏", "周⑤ 😂", "周⑥ 🤣"];
  var wk = new Date().getDay();
  
  // 周会分享当前准备人
  const ws = weekShareList[wsIndex];
  let ws2 = weekShareList[wsIndex + 1];
  if (!ws2) {
    ws2 = weekShareList[0];
  }
  // 技术分享当前准备人
  const ts = technicalShareList[tsIndex];
  /**
   * 临时补充 正常可删
   */
  // let ts2 = technicalShareList[tsIndex + 1];
  // if (!ts2) {
  //   ts2 = technicalShareList[0];
  // }
  /*************/

  // 标准文字
  const standardStr = `今天${weeks[wk]}了，下次周会安排的周会分享(5分钟)【${ws}、${ws2}】⭐️;技术分享(超5分钟)【${ts}】🌟, 请各位提前准备！👍\n(分享地址在群公告)`;
  /**
   * 临时补充模板 可删可改动
   */
  // const temporaryStr = `今天${weeks[wk]}了，下次周会安排的周会分享(5分钟)【${ws}、${ws2}】⭐️;技术分享(超5分钟)【${ts}(补)、${ts2}】🌟, 请各位提前准备！👍\n(分享地址在群公告)`;
  /*************/
  // 确定返回模板
  return standardStr;
};
// 获取当前准备人员文字
const getCurrentPerson = async () => {
  try {
    const { ws = 1, ts = 1 } = await db.getData();
    let str = spliceInstructions(ws, ts);
    return str;
  } catch (error) {
    throw error;
  }
};
/**
 * 前进周会持久化下标
 *
 * 周会分享每次进2位 技术分享每次进1位
 * 暂定每个下标最多进两个
 */
const addIndex = async () => {
  try {
    const res = await db.getData();
    const { ws = 1, ts = 1 } = res;
    const data = {
      ws: ws + 2,
      ts: ts + 1,
    };
    if (data.ws > totalPeople - 1) {
      if (data.ws === totalPeople) {
        data.ws = 0;
      }
      if (data.ws === totalPeople + 1) {
        data.ws = 1;
      }
    }
    if (data.ts > totalPeople - 1) {
      if (data.ts === totalPeople) {
        data.ts = 0;
      }
      if (data.ts === totalPeople + 1) {
        data.ts = 1;
      }
    }
    // 写入数据文件
    db.setData(data);
  } catch (error) {
    throw error;
  }
};
/**
 * 周会定期推送的内容逻辑 结束
 */

/**
 * 定时器
 */
function scheduleObjectLiteralSyntax() {
  /**
   * 每周5的下午16：56：33分触发，其它组合可以根据我代码中的注释参数名自由组合
   * dayOfWeek
   * month
   * dayOfMonth
   * hour
   * minute
   * second
   */
  // 周五提示一次 周会分享
  schedule.scheduleJob(
    { hour: 16, minute: 56, second: 33, dayOfWeek: 5 },
    async () => {
      try {
        const text = await getCurrentPerson();
        console.log("定时推送-周五:::", text);
        bot.text(text);
      } catch (error) {
        console.error("定时推送-周五-报错:::", error);
        sendFs("啊，我出错了！");
      }
    }
  );

  // 周二提示一次 周会分享 前进当前下标
  schedule.scheduleJob(
    { hour: 10, minute: 2, second: 33, dayOfWeek: 2 },
    async () => {
      try {
        const text = await getCurrentPerson();
        console.log("定时推送-周二:::", text);
        bot.text(text);
        addIndex();
      } catch (error) {
        console.error("定时推送-周二-报错:::", error);
        sendFs("啊，我出错了！");
      }
    }
  );
}

// 启动定时器
scheduleObjectLiteralSyntax();

/**
 * 测试打印
 */
getCurrentPerson().then((text) => {
  console.log('test:::', text);
  // bot
  //   .text('别鸟我~')
  //   .then((res) => {
  //     console.log(res, "res");
  //   })
  //   .catch((err) => {
  //     console.log("err", err);
  //   });
});
/*************/

// 服务启动
app.listen(port, () => {
  console.log(`fs-server start listening at http://localhost:${port}`);
});

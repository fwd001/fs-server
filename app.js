const express = require("express");
const request = require("./request.js");
const schedule = require("node-schedule");
const db = require("./db.js");
const CryptoJS = require("crypto-js");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const url =
  "https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxx";
// const url = "http://localhost:3002/test";
const key = "xxxxxxx";
// 发送飞书通知
const sendFs = (text) => {
  const timestamp = parseInt(new Date().getTime() / 1000);
  const signStr = `${1624619679}\n${key}`;
  
  const hash = CryptoJS.HmacSHA256("Message", signStr);
  //   const sign = hash.toString(CryptoJS.enc.Base64);
  const sign = CryptoJS.enc.Base64.stringify(hash);
  console.log("hash", hash, signStr);
  const data = {
    timestamp: 1624619679 + "",
    sign: sign,
    msg_type: "text",
    content: { text },
  };
  console.log("data", data);
  request.post(url, data).then((res) => {
    console.log("res:::", res);
  });
};
// 技术分享名单
const techniqueSharingList = [
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
// 周会分享名单
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

// 拼接周会文字
const spliceInstructions = (wsIndex, tsIndex, week) => {
  // 周会分享当前准备人
  const ws = weekShareList[wsIndex];
  const ws2 = weekShareList[wsIndex + 1];
  // 技术分享当前准备人
  const ts = techniqueSharingList[tsIndex];
  const str = `今天${week}了，下次周会安排的周会分享(5分钟)【${ws}、${ws2}】⭐️;技术分享(超5分钟)【${ts}】🌟, 请各位提前准备！👍`;
  return str;
};
// 获取当前准备人员文字
const getCurrentPerson = async (week) => {
  try {
    const res = await db.getJson();
    const { ws = 1, ts = 1 } = res;
    let str = spliceInstructions(ws, ts, week);
    return str;
  } catch (error) {
    console.log("err", err);
    throw error;
  }
};
// 周会持久化下标 前进
const addIndex = async () => {
  try {
    const res = await db.getJson();
    const { ws = 1, ts = 1 } = res;
    const data = {
      ws: ws + 2,
      ts: ts + 1,
    };
    if (data.ws > weekShareList.length - 1) {
      if (data.ws === weekShareList.length) {
        data.ws = 0;
      }
      if (data.ws === weekShareList.length + 1) {
        data.ws = 1;
      }
    }
    if (data.ts > techniqueSharingList.length - 1) {
      data.ts = 0;
    }

    db.setJson(data);
  } catch (error) {
    throw error;
  }
};

// 定时器
function scheduleObjectLiteralSyntax() {
  /**
   * 每周5的下午16：11分触发，其它组合可以根据我代码中的注释参数名自由组合
   * dayOfWeek
   * month
   * dayOfMonth
   * hour
   * minute
   * second
   */
  // 周五下午提示一次
  schedule.scheduleJob(
    { hour: 13, minute: 56, second: 33, dayOfWeek: 5 },
    async () => {
      try {
        const text = await getCurrentPerson("周五😂");
        console.log(text);
        sendFs(text);
      } catch (error) {
        sendFs("啊，我出错了！");
      }
    }
  );

  // 周二下午提示一次 前进 当前下标
  schedule.scheduleJob(
    { hour: 10, minute: 2, second: 33, dayOfWeek: 2 },
    async () => {
      try {
        const text = await getCurrentPerson("周二🙂");
        sendFs(text);
        addIndex();
      } catch (error) {
        sendFs("啊，我出错了！");
      }
    }
  );
}

// 启动定时器
scheduleObjectLiteralSyntax();
// getCurrentPerson("周五😂").then((text) => {
//   console.log(text);
//   sendFs(text);
// });

app.listen(port, () => {
  console.log(`feishu app listening at http://localhost:${port}`);
});

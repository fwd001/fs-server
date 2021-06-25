const fs = require("fs");
const path = require("path");

const dataDirPath = path.join(__dirname, "./data.json");

// 读取数据文件
function getJson() {
  return new Promise((resolve, reject) => {
    fs.readFile(dataDirPath, "utf8", function (err, data) {
      if (err) return reject(err);
      var dp = JSON.parse(data); // 读取的值
      resolve(dp);
    });
  });
}

// 写入数据文件
function setJson(strObj = {}) {
  const strJson = JSON.stringify(strObj);
  return new Promise((resolve, reject) => {
    fs.writeFile(dataDirPath, strJson, "utf8", function (err) {
      if (err) return reject(err);
      resolve("done");
    });
  });
}

module.exports = { setJson, getJson };

const fs = require("fs");

/**
 * 持久化数据存储类
 */
class DB {
  /**
   * 数据存储初始化
   *
   * @param {String} options.path 存数据路径
   */
  constructor(options) {
    options = options || {};
    if (!options.path) {
      throw new Error("options.path is required");
    }
    this.path = options.path;
  }
  // 读取数据文件
  getData() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.path, "utf8", function (err, data = "{}") {
        if (err) return reject(err);
        var dp = JSON.parse(data); // 读取的值
        resolve(dp);
      });
    });
  }
  // 写入数据文件
  setData(strObj = {}) {
    const strJson = JSON.stringify(strObj);
    return new Promise((resolve, reject) => {
      fs.writeFile(this.path, strJson, "utf8", function (err) {
        if (err) return reject(err);
        resolve("done");
      });
    });
  }
}

module.exports = DB;

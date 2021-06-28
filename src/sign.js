const crypto = require('crypto');

/**
 * 飞书机器人 密钥生成签名
 * @param {String} secret 
 * @param {Number} timestamp 
 * @returns {String} sign
 */
module.exports = (secret, timestamp) => {
  const signStr = timestamp + '\n' + secret;
  return crypto.createHmac('sha256', signStr).update('').digest('base64');
};
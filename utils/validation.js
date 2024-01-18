var aesjs = require('aes-js');

var CryptoJS = require("crypto-js");
var Crykey = require("./common");

var isRealString = (str) => {
    return typeof str === 'string' && str.trim().length > 0;
};

const encryptData = function (text) {
    var ciphertext = CryptoJS.AES.encrypt(text, Crykey.cryptoKey).toString();
    return ciphertext;
};

const decryptData = function (value) {
    var bytes = CryptoJS.AES.decrypt(value, Crykey.cryptoKey);
    var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData;
};

module.exports = {
    isRealString,
    encryptData,
    decryptData,
};

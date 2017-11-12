const fs = require('fs');


var logFile = fs.createWriteStream("./log.txt", {flags: 'a'});
var errFile = fs.createWriteStream("./errlog.txt", {flags: 'a'});

function logToFile(message, responseSent) {
    const date = message.date !== undefined ? new Date(message.date*1000).toLocaleString() : "-1";
    const user = message.from;
    var userStr = "";
    if (user !== undefined) {
        userStr += user.id;
    }
    const chatType = message.chat !== undefined ? message.chat.type : "-";
    const text = message.text !== undefined ? message.text : "-";
    logFile.write(date + " " + userStr + " " + chatType + " " + text+ " " + responseSent + "\n");
}

function logError(msg) {
    errFile.write(msg + "\n");
}



module.exports = {
    logMsg: logToFile,
    logErr: logError
}
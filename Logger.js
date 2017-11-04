const fs = require('fs');


var logFile = fs.createWriteStream("./log.txt", {flags: 'a'});

function logToFile(message) {
    const date = message.date != undefined ? message.date : "-1"
    const from = message.from != undefined ? message.from.id : "???"
    const text = message.text != undefined ? message.text : "-"
    logFile.write(date +" " + from + " " + text+ "\n");
}

module.exports = logToFile;

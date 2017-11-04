const Slimbot = require('slimbot');
const token = require("./token");
const slimbot = new Slimbot(token.token);
const HuhuGen = require("./huhu.js");
const generator = new HuhuGen();
const logToFile = require("./Logger.js");
const botName = "HuhuBot"





function parseMsg(msg) {

    if (msg.match("/huhu(@"+botName+")?")) {
        return generator.generateHuhu();
    } else return null;


}


// Register listeners
slimbot.on('message', message => {
    logToFile(message);
    //tsekkaa onko viesti vanha
    if (message.date * 1000 < Date.now()- 60000 ) {
        console.log("received old message");

    } else {
            const text = message.text
        if (text != undefined && text.length != 0 && text[0] === '/') {
            const response = parseMsg(text);
            if (message.chat.type == "private") {
                //30 messages per second
            } else {
                //20 messages per minute
            }
            if (response != undefined && response != null) slimbot.sendMessage(message.chat.id, response);
        }
    }
});

// Call API

slimbot.startPolling();

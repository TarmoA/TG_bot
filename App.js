const Slimbot = require("slimbot");
const token = require("./token");
const slimbot = new Slimbot(token.token);
const HuhuGen = require("./huhu.js");
const generator = new HuhuGen();
const Logger = require("./Logger.js");
const botName = "HuhuBot";





function parseMsg(msg) {

    if (msg.match("/huhu(@"+botName+")?")) {
        return generator.generateHuhu();
    } else {
        return null;
    }


}

//Makes the bot not respons to messages for a minute
var onTimeout = false;
function timeoutBot() {
    onTimeout= true;
    setTimeout(function(){ onTimeout = false}, 60000);
}

//Queues for rate limiting
var privateMsgQ = [];
var groupMsgQ = [];
const privN = 0;
const groupN = 1;

function checkRateLimit(timestamp, type) {
    if (type === privN) {
        // 1s = 1000ms
        //30 messages per second
        const limit = 1000;
        privateMsgQ.push(timestamp);
        if (privateMsgQ.length > 30) {
            var prev = privateMsgQ.shift();
            var res = (timestamp - prev <= limit);
            if (!res) Logger.logErr("private message ratelimit reached");
            return res;
        } else {
            return true;
        }
    } else {
        //1min = 60000ms
        //20 messages per minute
        const limit = 60000;
        groupMsgQ.push(timestamp);
        if (groupMsgQ.length > 20) {
            var prev = privateMsgQ.shift();
            var res = (timestamp - prev <= limit);
            if (!res) Logger.logErr("group message limit reached");
            return res;
        } else {
            return true;
        }
    }
}



// Register listeners
slimbot.on("message", message => {
    if (onTimeout) return;
    var responseSent = false;
    //Don't respond to messages older than a minute
    if (message.date * 1000 < Date.now()- 60000 ) {
        Logger.logErr("received old message");

    } else {
            const chatType = (message.chat.type === "private" ? privN : groupN);
            const text = message.text
        if (text && text.length !== 0 && text[0] === "/" && checkRateLimit(message.date, chatType) ) {
            const response = parseMsg(text);
            if (response) {
                slimbot.sendMessage(message.chat.id, response, function(err, msg){
                    if (err) {
                        Logger.logErr("got 429 error");
                        //timeout the bot for 60 seconds
                        timeoutBot();
                    }
                });
                responseSent = true;
            }
        }
    }
    Logger.logMsg(message, responseSent);
});

// Call API

slimbot.startPolling();

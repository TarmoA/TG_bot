const Slimbot = require("slimbot");
const token = require("./token");
const slimbot = new Slimbot(token.token);
const HuhuGen = require("./huhu.js");
const generator = new HuhuGen();
const Logger = require("./Logger.js");
const DailyMessage = require("./dailyMessage.js");
const botName = "HuhuBot";

const dailySubsFile = "./dailyrecipients.json"


function parseMsg(msg) {
    const text = msg.text;
    if (text.match("/huhu(@"+botName+")?")) {
        return generator.generateHuhu();
    } else if (text.match("/subscribe(@"+botName+")?")) {
        DailyMessage.addRecipient(msg.chat.id, dailySubsFile, function() {
            dailyObj = reschedule(dailyObj);
        });
    } else if (text.match("/unsubscribe(@"+botName+")?")) {
        DailyMessage.removeRecipient(msg.chat.id, dailySubsFile, function() {
            dailyObj = reschedule(dailyObj);
        });
    } else {
        return null;
    }


}

//Makes the bot not respons to messages for a minute
var onTimeout = false;
function timeoutBot() {
    onTimeout = true;
    setTimeout(function(){ onTimeout = false;}, 60000);
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
        privateMsgQ.push(new Date(timestamp * 1000));
        if (privateMsgQ.length > 30) {
            var prev = privateMsgQ.shift();
            var res = (new Date((timestamp - limit) * 1000) <= prev);
            if (!res) Logger.logErr("private message ratelimit reached");
            return res;
        } else {
            return true;
        }
    } else {
        //1min = 60000ms
        //20 messages per minute
        const limit = 60000;
        groupMsgQ.push(new Date(timestamp * 1000));
        if (groupMsgQ.length > 20) {
            var prev = groupMsgQ.shift();
            var res = (new Date((timestamp - limit) * 1000) <= prev);
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
            const response = parseMsg(message);
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

// Should fire at 10 on the local timezone
function initDaily() {
    return DailyMessage.init("0 10 * * *", dailySubsFile, function(q) {
        var huhu = generator.generateHuhu();
        // var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        // new Date().toLocaleDateString("fi", options)
        var message = "Päivän huhu: \n" + huhu;
        var queue = q;
        var interval = setInterval(function() {
            var id = queue.shift();

            slimbot.sendMessage(id, message, function(err, msg){
                if (err) {
                    Logger.logErr("got error(429?) on daily message send");
                    //timeout the bot for 60 seconds
                    timeoutBot();
                }
            });

            if (queue.length === 0) {
                clearInterval(interval);
            }
        }, 500);


    });

}

function reschedule(obj) {
    obj.job.cancel();
    obj = initDaily();
    return obj;
}

var dailyObj = initDaily();


// Call API

slimbot.startPolling();

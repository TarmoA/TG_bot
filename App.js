const Slimbot = require("slimbot");
const token = require("./token");
const slimbot = new Slimbot(token.token);
const HuhuGen = require("./huhu.js");
const generator = new HuhuGen();
const Logger = require("./Logger.js");
const DailyMessage = require("./dailyMessage.js");
const botName = "HuhuBot";
const knownUserStore = require('./KnownUserStore.js');

const dailySubsFile = "./dailyrecipients.json"


function parseMsg(msg, cb) {
    const text = msg.text;
    if (text.match("/ping")) {
        cb("pong")
    } else if (text.match("/huhu(@"+botName+")?")) {
        const username = msg.from.first_name;
        const cleared = text.replace('/huhu', '').replace(`@${botName}`, '').trim();
        if (cleared) {
            cb(generator.generateHuhu([cleared], true))
            return;
        }
        knownUserStore.getUsers(msg.chat.id, knownUsers => {
            let users = knownUsers
            if (!knownUsers.includes(username)) {
                knownUserStore.storeUser(msg.chat.id, username)
                users = knownUsers.concat([username]);
            }
            cb(generator.generateHuhu(users))
        });
    } else if (text.match("/subscribe(@"+botName+")?")) {
        DailyMessage.addRecipient(msg.chat.id, dailySubsFile, function() {
            dailyObj = reschedule(dailyObj);
        });
    } else if (text.match("/unsubscribe(@"+botName+")?")) {
        DailyMessage.removeRecipient(msg.chat.id, dailySubsFile, function() {
            dailyObj = reschedule(dailyObj);
        });
    } else if (text.match("/lisaanimi(@" + botName + ")?")) {
        addUsers(msg);
    }
}

function addUsers(msg) {
    const text = msg.text;
    const names = text.split(" ");
    names.splice(0,1);
    names
    .filter(n => n.trim() !== "")
    .forEach(name => {
        knownUserStore.storeUser(msg.chat.id, name)
    })
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
        const limit = 1;
        privateMsgQ.push(new Date(timestamp * 1000));
        if (privateMsgQ.length > 30) {
            var prev = privateMsgQ.shift();
            // did the earliest message (prev) happen more than limit seconds ago?
            var res = (new Date((timestamp - limit) * 1000) >= prev);
            if (!res) Logger.logErr("private message ratelimit reached");
            return res;
        } else {
            return true;
        }
    } else {
        //1min = 60000ms
        //20 messages per minute
        const limit = 60;
        groupMsgQ.push(new Date(timestamp * 1000));
        if (groupMsgQ.length > 20) {
            var prev = groupMsgQ.shift();
            var res = (new Date((timestamp - limit) * 1000) >= prev);
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
            parseMsg(message, response => {
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
            });
        }
    }
    // Logger.logMsg(message, responseSent);
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

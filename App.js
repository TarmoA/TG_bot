const Slimbot = require('slimbot');
const token = require("./token");
const slimbot = new Slimbot(token.token);
const HuhuGen = require("./huhu.js");
const generator = new HuhuGen();

const botName = "HuhuBot"
// Register listeners
function parseMsg(msg) {

    if (msg.match("/huhu(@"+botName+")?")) {
        return generator.generateHuhu();
    } else return null;
    // switch(msg) {
    //     case ('/huhu'):
    //         return generator.generateHuhu()
    //         break;
    //     default:
    //         return "dasd";
    // }

}


slimbot.on('message', message => {
    const text = message.text
    if (text != undefined && text.length != 0 && text[0] === '/') {

        const response = parseMsg(text);
        if (response != undefined && response != null) slimbot.sendMessage(message.chat.id, response);
    }
});

// Call API

slimbot.startPolling();

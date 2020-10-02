var schedule = require('node-schedule');
const sqlite3 = require('sqlite3');
const config = require("./config");
const Logger = require('./Logger');

function getDB() {
    return new sqlite3.Database(config.db_name);
}

function addRecipient(chatId, cb) {
    const db = getDB();
    const stmt = db.prepare("INSERT INTO daily_recipients VALUES (?)");
    stmt.run([chatId], (err) => {
        if (err) {
            Logger.logErr(err);
        }
        if (cb) {
            cb()
        }
    })
    stmt.finalize();
    db.close();
}

function removeRecipient(chatId, cb) {
    const db = getDB();
    const stmt = db.prepare("DELETE FROM daily_recipients WHERE chat_id = ?");
    stmt.run([chatId], (err) => {
        if (err) {
            Logger.logErr(err);
        }
        if (cb) {
            cb()
        }
    })
    stmt.finalize();
    db.close();
}

function getRecipients(cb) {
    const db = getDB();
    db.serialize(() => {
        const stmt = db.prepare("SELECT chat_id FROM daily_recipients");
        stmt.all([], (err, rows) => {
            if (err) {
                Logger.logErr(err);
            }
            if (!rows) {
                cb([])
            } else {
                const names = rows.map(r => r.chat_id);
                cb(names);
            }
        });
        stmt.finalize();
    })
    db.close();
}


const funcs = {
// Init the function sendMessage to be called on a schedule
// time: chron-type string for scheduling
// returns a recipient list and the scheduled job wrapped in an object

    init: function(time, sendMessages, onFinished) {
        getRecipients(recipients => {
            const job = schedule.scheduleJob(time, function() {
                sendMessages(recipients);
            });
            onFinished({recipients, job});
        })
    },
    addRecipient,
    removeRecipient

};

module.exports = funcs;

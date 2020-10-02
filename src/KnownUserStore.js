const sqlite3 = require('sqlite3');
const config = require("../config/config");
const Logger = require("./Logger.js");

function getDB() {
    return new sqlite3.Database(config.db_name);
}

function storeUser(chatId, username, cb) {
    const db = getDB();
    const stmt = db.prepare("INSERT INTO known_users VALUES (?, ?)");
    stmt.run([chatId, username], (err) => {
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

/**
 * @return array of strings
 */
function getUsers(chatId, cb) {
    const db = getDB();
    db.serialize(() => {
        const stmt = db.prepare("SELECT username FROM known_users WHERE chat_id = ?");
        stmt.all([chatId], (err, rows) => {
            if (err) {
                Logger.logErr(err);
            }
            if (!rows) {
                cb([])
            } else {
                const names = rows.map(r => r.username);
                cb(names);
            }
        });
        stmt.finalize();
    })
    db.close();
}


module.exports = { getUsers, storeUser }

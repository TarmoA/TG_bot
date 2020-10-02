var sqlite3 = require('sqlite3').verbose();
const config = require("./config");

const db = new sqlite3.Database(config.db_name);
db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS known_users (chat_id INTEGER, username TEXT, UNIQUE(chat_id, username))");
    db.run("CREATE TABLE IF NOT EXISTS daily_recipients (chat_id integer UNIQUE)");
    db.close();
});

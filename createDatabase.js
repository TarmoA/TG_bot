var sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('huhut_database.sqlite');
db.serialize(function () {
    db.run("CREATE TABLE known_users (chat_id integer, username text)");
    db.close();
});

var schedule = require('node-schedule');
const fs = require('fs');
const Logged = require('./Logger.js');


const funcs = {
// Init the function sendMessage to be called on a schedule
// time: chron-type string for scheduling
// filename: filename for participant list
// returns a recipient list and the scheduled job wrapped in an object

    init: function(time, filename, sendMessages) {
        var recipients = [];
        fs.readFile(filename, "utf8", function(err, data) {
            if (err) {
                // console.log("error reading file");
                throw err;
            }
            recipients = JSON.parse(data);
          });
        //Daily message
        const job = schedule.scheduleJob(time, function() {
            var queue = recipients.slice();
            sendMessages(queue);
        });
    return {recipients, job};
    },

    addRecipient: function(id, filename, cb) {
        var found = false;
        var oldData = [];
        fs.readFile(filename, "utf8", function(err, data) {
            if (err) {
                // Logger.errLog("Error reading file when adding new recipient");
                throw err;
            }
            oldData = JSON.parse(data);
            // found = oldData.indexOf(id) !== -1;
            if (oldData.indexOf(id) === -1) {
                oldData.push(id);
                fs.writeFile(filename, JSON.stringify(oldData), "utf8", function(err) {
                    if (err) {
                        // Logger.errLog("Error appending new id to file");
                        throw err;
                    }
                    cb();
                });
            }
        });

    },

    removeRecipient: function(id, filename, cb) {
        var index = -1;
        var oldData = [];
        fs.readFile(filename, "utf8", function(err, data) {
            if (err) {
                // Logger.errLog("Error reading file when adding new recipient");
                throw err;
            }
            oldData = JSON.parse(data);
            index = oldData.indexOf(id);
            if (index !== -1) {
                oldData.splice(index, 1);
                const newData = JSON.stringify(oldData);
                fs.writeFile(filename, newData, "utf8", function(err) {
                    if (err) {
                        // Logger.errLog("Error writing new stuff to file, recipient list may have corrupted");
                        throw err;
                    }
                    cb();
                });
            }
        });
    }

};

module.exports = funcs;

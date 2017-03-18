var restify = require('restify');
var builder = require('botbuilder');
var calling = require('botbuilder-calling');
var fs = require('fs')

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var chatConnector = new builder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_PASSWORD
});
var chatBot = new builder.UniversalBot(chatConnector);
server.post('/api/messages', chatConnector.listen());

chatBot.dialog('/', function(session) {
    session.send("Please, call!");
});

// Create calling bot
var connector = new calling.CallConnector({
    callbackUrl: process.env.CALLBACK_URL,
    appId: process.env.APP_ID,
    appPassword: process.env.APP_PASSWORD
});
var bot = new calling.UniversalCallBot(connector);
server.post('/api/calls', connector.listen());

bot.dialog('/', [
    function(session) {
        calling.Prompts.record(session, "record", {
            maxDurationInSeconds: 600,
            recordingFormat: "Mp3"
        });
    },
    function(session, results) {
        console.log("came here");
        if (results.response) {
            var wstream = fs.createWriteStream('recording.wma');
            wstream.write(results.response.recordedAudio);
            wstream.end();
            session.endDialog();
        } else {
            session.endDialog();
        }
    }
]);

// bot.dialog('/', [
//     function(session) {
//         calling.Prompts.record(session, "12", {
//             playBeep: true
//         });
//     },
//     function(session, results) {
//         if (results.response) {
//             session.endDialog("Result", results.response.lengthOfRecordingInSecs);
//         } else {
//             session.endDialog("canceled");
//         }
//     }
// ]);

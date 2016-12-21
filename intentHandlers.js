'use strict';
var textHelper = require('./textHelper'),
    storage = require('./storage');

var registerIntentHandlers = function (intentHandlers, skillContext) {

    intentHandlers.SetDueIntent = function (intent, session, response) {
        var name = textHelper.getPlayerName(intent.slots.name.value),
            datestring = intent.slots.date.value,
            assignment = intent.slots.assignment.value;
        if (!name) {
            response.tell('sorry, I did not hear the name, please say that again');
            return;
        }
        var dateValue = Date.parse(datestring);
        if (isNaN(dateValue)) {
            console.log('Invalid date value = ' + score.value);
            response.tell('sorry, I did not hear the date, please say that again');
            return;
        }

        if (!assignment){
            response.tell('sorry, I did not hear the assignment, please say that again');
            return;
        }
        dateValue = dateValue/(24*3600);
        storage.loadGame(session, function (currentGame){
            var speechOutput = "";
            var newEvent = {};
            newEvent["date"] = dateValue;
            newEvent["content"] = assignment;
            if(currentGame.data.events[name] === undefined){
                currentGame.data.events[name] = [];
            }
            currentGame.data.events[name].push(newEvent);
            speechOutput = "Event " + assignment + " successfully added";
            currentGame.save(function () {
                response.tell(speechOutput);
            });
        });
    };

    intentHandlers.GetDueIntent = function (intent, session, response) {
        //tells the scores in the leaderboard and send the result in card.
        var name = textHelper.getPlayerName(intent.slots.name.value),
            datestring = intent.slots.date.value;
        if (!name) {
            response.tell('sorry, I did not hear the name, please say that again');
            return;
        }
        var dateValue = Date.parse(datestring);
        if (isNaN(dateValue)) {
            console.log('Invalid date value = ' + score.value);
            response.tell('sorry, I did not hear the date, please say that again');
            return;
        }
        dateValue = dateValue/(24*3600);
        storage.loadGame(session, function (currentGame) {
            if(currentGame.data.events[name] === undefined){
                response.tell("There are currently no assignments being tracked for that person.");
                return;
            }

            if(currentGame.data.events[name].length == 0){
                response.tell("There are currently no assignments being tracked for that person.");
                return;
            }

            var assignments = [];
            
            for (var i = 0; i < currentGame.data.events[name].length; i++) {
                if (currentGame.data.events[name][i]["date"] === dateValue) {
                    assignments.push(currentGame.data.events[name][i]);
                }
            }

            var speechOutput = "";

            if(assignments.length === 0){
                response.tell("There are no assignments for " + name + " due on that date.");
                return;
            }

            if(assignments.length === 1){
                speechOutput = "There is one assignment for " + name + " due on that date.";
            }else{
                speechOutput = "There are " + assignments.length + " assignments for " + name + " due on that date.";
            }

            var assignmentsString = "";

            for (var i = 0; i < assignments.length; i++) {
                assignmentsString += assignments[i]["content"] + "\n";
            }

            response.tellWithCard(speechOutput, "Assignments", assignmentsString);
        });
    };

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        var speechOutput = textHelper.completeHelp;
        response.tell(textHelper.completeHelp);
    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Okay.  Whenever you\'re ready, you can start telling me due dates.');
        } else {
            response.tell('');
        }
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Okay.  Whenever you\'re ready, you can start telling me due dates.');
        } else {
            response.tell('');
        }
    };
};
exports.register = registerIntentHandlers;

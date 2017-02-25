var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Secret Message' });
});

var groups = {};
var MAX_ATTEMPTS = 5;
var REJECT_MESSAGES = [
	"Yeah... no...",
	"Ha. Good one.",
	"You wish.",
	"Seriously??",
	"Are you even trying?",
	"This isn't the way...",
	"You're done for...",
	"Maybe try not guessing?"
];
var SECRETS = [
	{
		MESSAGE: "Secret message number 1",
		PIN: "1234"
	},
	{
		MESSAGE: "Secret message number 2",
		PIN: "1235"
	},
	{
		MESSAGE: "Secret message number 3",
		PIN: "1236"
	}
];

function findGroup(req, res, next) {
	if(req.query.groupId) {
		if(!groups[req.query.groupId]) {
			createNewGroup(req.query.groupId);
		}
		req.group = groups[req.query.groupId];
		next();
	}
	else {
		res.status(400).json({message: "BAD REQUEST: Missing or invalid group value"});
	}
};

router.get("/unlock/:pin", findGroup, function(req, res) {

	var response = {};
	if(req.group.incorrectAttempts > MAX_ATTEMPTS || (req.group.incorrectAttempts == MAX_ATTEMPTS && req.params.pin != SECRETS[req.group.secretIndex].PIN)) {
		req.group.incorrectAttempts++;
		response.success = false;
		response.message = "PERMANENTLY LOCKED! YOU LOSE!!";
	}
	else if(req.group.incorrectAttempts >= (MAX_ATTEMPTS - 3) && req.params.pin != SECRETS[req.group.secretIndex].PIN) {
		req.group.incorrectAttempts++;
		response.success = false;
		var attemptsLeft = (MAX_ATTEMPTS - req.group.incorrectAttempts + 1);
		response.message = "Warning: You have " + attemptsLeft + " more attempt" + (attemptsLeft !== 1 ? "s" : "") + " before you are locked out";
	}
	else if(req.params.pin == SECRETS[req.group.secretIndex].PIN) {
		response.success = true;
		response.message = SECRETS[req.group.secretIndex].MESSAGE;
		if(req.group.secretIndex < (SECRETS.length - 1)) {
			req.group.secretIndex++;
		}
		else {
			req.group.secretIndex = 0;
		}
		req.group.incorrectAttempts = 0;
	}
	else {
		req.group.incorrectAttempts++;
		response.success = false;
		response.message = REJECT_MESSAGES[Math.floor(REJECT_MESSAGES.length * Math.random())];
	}
	res.json(response);

});

router.get("/groups", function(req, res) {
	res.json(groups);
});

router.get("/groups/:id", function(req, res) {
	if(groups[req.params.id]) {
		res.json(groups[req.params.id]);
	}
	else {
		res.status(400).json({status: "error", message: "Group " + req.params.id + " does not exist!"});
	}
});

router.get("/groups/:id/delete", function(req, res) {
	if(groups[req.params.id]) {
		groups[req.params.id] = undefined;
		res.json({status: "success", message: "Group " + req.params.id + " was successfully deleted"});
	}
	else {
		res.status(400).json({status: "error", message: "Group " + req.params.id + " does not exist!"});
	}
});

router.get("/max", function(req, res) {
	res.json({maxAttempts: MAX_ATTEMPTS});
});

router.get("/max/:value", function(req, res) {
	var value = parseInt(req.params.value);
	if(value && value >= 3) {
		MAX_ATTEMPTS = value
		res.status(200).json({message:"MAX_ATTEMPTS set to " + MAX_ATTEMPTS});
	}
	else {
		res.status(400).json({message: "BAD REQUEST: Missing or invalid max value"});
	}
});

router.get("/secrets/:index", function(req, res) {
	
	var secretIndex = req.params.index;
	if(secretIndex) {
		res.json(SECRETS[secretIndex]);
	}
	else {
		res.status(400).json({message: "BAD REQUEST: Missing or invalid secret index"});
	}
});

router.get("/secrets/:index/pin", function(req, res) {
	
	var secretIndex = req.params.index;
	if(secretIndex) {
		res.json({pin:SECRETS[secretIndex].PIN});
	}
	else {
		res.status(400).json({message: "BAD REQUEST: Missing or invalid secret index"});
	}
});

router.get("/secrets/:index/pin/:newPin", function(req, res) {
	
	var secretIndex = req.params.index;
	var newPin = req.params.newPin;
	if(newPin && secretIndex) {
		SECRETS[secretIndex].PIN = newPin;
		res.status(200).json({status: "success", pin: SECRETS[secretIndex].PIN});
	}
	else {
		res.status(400).json({status: "error", message: "BAD REQUEST: Missing or invalid pin value"});
	}
});

router.get("/secrets/:index/message", function(req, res) {
	
	var secretIndex = req.params.index;
	if(secretIndex) {
		res.json({message:SECRETS[secretIndex].MESSAGE});
	}
	else {
		res.status(400).json({message: "BAD REQUEST: Missing or invalid secret index"});
	}
});

router.get("/secrets/:index/message/:newMessage", function(req, res) {

	var secretIndex = req.params.index;
	var newMessage = req.params.newMessage;
	if(newMessage && secretIndex) {
		SECRETS[secretIndex].MESSAGE = newMessage;
		res.status(200).json({message:"secret message set to " + SECRETS[secretIndex].MESSAGE});
	}
	else {
		res.status(400).json({message: "BAD REQUEST: Missing or invalid message value"});
	}
});

function createNewGroup(groupId) {
	groups[groupId] = {
		id: groupId,
		secretIndex: 0,
		incorrectAttempts: 0
	}
	console.log("group " + groupId + " successfully created!");
}

module.exports = router;

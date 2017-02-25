var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Secret Message' });
});

var rejectMessages = [
	"Yeah... no...",
	"Ha. Good one.",
	"You wish.",
	"Seriously??",
	"Are you even trying?",
	"This isn't the way..."
];

var MAX_ATTEMPTS = 5;
var SECRET_PIN = "1234";
var SECRET_MESSAGE = "Here is the secret you were looking for!";
var incorrectAttempts = 0;

router.get("/unlock/:pin", function(req, res, next) {

	var response = {};
	if(incorrectAttempts > MAX_ATTEMPTS || (incorrectAttempts == MAX_ATTEMPTS && req.params.pin != SECRET_PIN)) {
		incorrectAttempts++;
		response.success = false;
		response.message = "PERMANENTLY LOCKED! YOU LOSE!!";
	}
	else if(incorrectAttempts >= (MAX_ATTEMPTS - 3) && req.params.pin != SECRET_PIN) {
		incorrectAttempts++;
		response.success = false;
		var attemptsLeft = (MAX_ATTEMPTS - incorrectAttempts + 1);
		response.message = "Warning: You have " + attemptsLeft + " more attempt" + (attemptsLeft !== 1 ? "s" : "") + " before you are locked out";
	}
	else if(req.params.pin == SECRET_PIN) {
		incorrectAttempts = 0; // reset incorrectAttempts
		response.success = true;
		response.message = SECRET_MESSAGE;
	}
	else {
		incorrectAttempts++;
		response.success = false;
		response.message = rejectMessages[Math.floor(rejectMessages.length * Math.random())];
	}
	res.json(response);
});

router.get("/reset", function(req, res, next) {
	incorrectAttempts = 0;
	res.status(200).json({message:"server reset"});
});

router.get("/max/:value", function(req, res, next) {
	var value = parseInt(req.params.value);
	if(value && value >= 3) {
		MAX_ATTEMPTS = value
		res.status(200).json({message:"MAX_ATTEMPTS set to " + MAX_ATTEMPTS});
	}
	else {
		res.status(400).json({message: "BAD REQUEST: Missing or invalid max value"});
	}
});

router.get("/pin/:value", function(req, res, next) {
	var newPin = req.params.value;

	if(newPin && newPin.length == 4) {
		SECRET_PIN = newPin
		res.status(200).json({message:"pin changed to " + SECRET_PIN});
	}
	else {
		res.status(400).json({message: "BAD REQUEST: Missing or invalid pin value"});
	}
});

router.get("/message/:value", function(req, res, next) {
	if(req.params.value) {
		SECRET_MESSAGE = req.params.value
		res.status(200).json({message:"secret message set to " + SECRET_MESSAGE});
	}
	else {
		res.status(400).json({message: "BAD REQUEST: Missing or invalid message value"});
	}
});

module.exports = router;

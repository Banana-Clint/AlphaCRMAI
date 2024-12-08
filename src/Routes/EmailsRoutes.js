const express = require('express');
const router = express.Router();
const EmailEndpoint = require('../Endpoints/EmailsEndpoint.js');

router.get('/GetInbox', EmailEndpoint.GetInbox);
router.post('/SendEmail', EmailEndpoint.SendEmail);
router.post('/GenerateEmail',EmailEndpoint.GenerateEmail)

module.exports = router;

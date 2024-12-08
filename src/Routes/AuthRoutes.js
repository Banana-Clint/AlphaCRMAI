const express = require('express');
const router = express.Router();
const AuthEndpoint = require('../Endpoints/authEndpoint.js')


router.get('/Auth', AuthEndpoint.Auth);
router.get('/OAuth2Callback', AuthEndpoint.OAuth2Callback);

module.exports = router;

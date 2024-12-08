// routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const { ClientData,ClientMetaData } = require('../Endpoints/ClientEndpoint');

router.get('/Clients', ClientData);
router.get('/ClientMetaData', ClientMetaData);

module.exports = router;

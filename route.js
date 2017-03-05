var express = require('express');
var router = express.Router();
var api = require("./controllers/api");


//api
router.get('/football/:id', api.Football);
router.get('/NBA', api.NBA);
router.get('/getImg', api.getBannerImg);
router.get('/score/:id', api.Score);
router.get('/pictures', api.pictureList);
router.get('/picture/:id', api.pictureById);
router.get('/team/players/:id', api.playersByTeam);
router.get('/soccer/:id', api.Soccer);
module.exports = router;
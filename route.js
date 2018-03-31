var express = require('express');
var router = express.Router();
var api = require("./controllers/api");


//api
router.get('/News', api.News);
router.get('/PickNews',api.PickNews);
router.get('/NBA', api.NBA);
router.get('/getImg', api.getBannerImg);
router.get('/score', api.Score);
router.get('/pictures', api.pictureList);
router.get('/picture/:id', api.pictureById);
router.get('/footballTeam', api.FootballTeamInfo)
router.get('/footballTeamChangeInfo', api.FootballTeamChangeInfo)
router.get('/team/players/:id', api.playersByTeam);
module.exports = router;

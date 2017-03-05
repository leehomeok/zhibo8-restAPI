var signature = require('wx_jsapi_sign');
var configSign = require('../config/config')();
var config = require('../config/default.json');
var http = require('request-json');
var url = require("url");
var qs = require("querystring");
var fs = require("fs");
var path = require('path');
var cheerio = require("cheerio");
var superagent = require("superagent");


var football_league_api = 'http://op.juhe.cn/onebox/football/league?key=d4786948957f1d4784a4164abd8ec45a&league=';
exports.Football = function(req, res) { //联赛对阵以及完赛比分
    var reqPath = url.parse(req.url).path;
    var league = reqPath.substr(reqPath.lastIndexOf("/") + 1, reqPath.length);
    console.log(decodeURI(league));
    var client = http.createClient(config.url);
    client.post(football_league_api + league, {}, function(err, response, body) {
        //console.log(body);
        if (body.error_code == 0) {
            res.json(body);
        } else {
            var error = {
                error_code: 1,
                msg: "联赛名字有误"
            }
            res.json(error);
        }
    });
};

var score_api = "http://v.juhe.cn/football/scorerank.php";
exports.Score = function(req, res) { //足球联赛积分榜
    var reqPath = url.parse(req.url).path;
    var d = new Date();
    var year = parseInt(d.getFullYear() - 1);
    var league_id = reqPath.substr(reqPath.lastIndexOf("/") + 1, reqPath.length);
    var client = http.createClient(config.url);
    var geturl = score_api + "?league_id=" + league_id + "&season_id=" + year + "&key=a618f3a78bf8405b9001b679e9e0c63f";
    client.get(geturl, function(err, response, body) {
        //console.log(body);
        if (body.error_code == 0) {
            res.json(body);
        } else {
            var error = {
                error_code: body.error_code,
                msg: "联赛(杯赛)名字有误"
            }
            res.json(error);
        }
    });
};


var nba_api = "http://op.juhe.cn/onebox/basketball/nba?key=d0df4f2cbfbde99c065222974ba58551";
exports.NBA = function(req, res) {
    var client = http.createClient(config.url);
    client.post(nba_api, {}, function(err, response, body) {
        //console.log(body);
        if (body.error_code == 0) {
            res.json(body.result);
        } else {
            var error = {
                error_code: 1,
                msg: "请求失败"
            }
            res.json(error);
        }
    });
};

exports.getBannerImg = function(req, res) {
    var client = http.createClient(config.url);
    superagent.get('http://sports.sina.com.cn/').end(function(err, sres) {
        if (err) {
            var error = {
                err_code: 1,
                msg: "渣浪已经改标签了"
            }
            res.json(error);
        } else {
            var $ = cheerio.load(sres.text);
            var items = [];
            $('#phdnews_slide .phdnews_slide_item a img').each(function(idx, element) {
                var $element = $(element);
                items.push({
                    title: $element.attr('alt'),
                    src: $element.attr('src')
                });
            });
            var result = {
                code: 200,
                data: items
            }
            res.json(result);
        }
    })
}

exports.pictureList = function(req, res) {
    var client = http.createClient(config.url);
    superagent.get('http://m.tu.zhibo8.cc/').end(function(err, sres) {
        if (err) {
            var error = {
                err_code: 1,
                msg: "直播吧已经改标签了"
            }
            res.json(error);
        } else {
            var $ = cheerio.load(sres.text);
            // console.log(sres.text);
            var items = [];
            $('.yi-list-ul .yi-list-li').each(function(idx, element) {
                var $element = $(element);
                var _id = $element.find("a").attr("href")
                items.push({
                    id: _id.slice(1, _id.length),
                    title: $element.find(".yi-list-name").text(),
                    src: $element.find("img").attr("src"),
                    date: $element.find("span").text()
                });
            });
            var result = {
                code: 200,
                data: items
            }
            res.json(result);
        }
    })
}
exports.pictureById = function(req, res) {
    var client = http.createClient(config.url);
    var reqPath = url.parse(req.url).path;
    var pic_id = reqPath.substr(reqPath.lastIndexOf("/") + 1, reqPath.length);
    superagent.get('http://m.tu.zhibo8.cc/' + pic_id).end(function(err, sres) {
        if (err) {
            var error = {
                err_code: 1,
                msg: "直播吧已经改标签了"
            }
            res.json(error);
        } else {
            var $ = cheerio.load(sres.text);
            // console.log(sres.text);
            var items = [];
            $('.swiper-wrapper .swiper-slide').each(function(idx, element) {
                var $element = $(element);
                items.push({
                    id: idx,
                    src: $element.find("img").attr("data-original"),
                });
            });
            var result = {
                code: 200,
                data: items
            }
            res.json(result);
        }
    })
}


var player_api = "http://sports1.sina.cn/global/teaminfo?league_type_id=4&team_id=";
exports.playersByTeam = function(req, res) { //足球联赛积分榜
    var reqPath = url.parse(req.url).path;
    var league_id = reqPath.substr(reqPath.lastIndexOf("/") + 1, reqPath.length);
    var geturl = player_api + league_id;
    console.log(geturl);
    superagent.get(geturl).end(function(err, sres) {
        if (err) {
            var error = {
                err_code: 1,
                msg: "新浪已经改标签了"
            }
            res.json(err);
        } else {
            var $ = cheerio.load(sres.text);
            //console.log(sres.text);
            var items = [];
            $('.team_list .team_info').each(function(idx, element) {
                var $element = $(element);
                items.push({
                    href: $(element).find("p").eq(0).find("a").attr("href"),
                    img: $(element).find("p").eq(0).find("img").attr("src"),
                    name: $(element).find("p").eq(1).find("span").eq(0).text(),
                    number: $(element).find("p").eq(1).find("span").eq(1).text(),
                    position: $(element).find("p").eq(1).find("span").eq(2).text(),
                });

                var result = {
                    code: 200,
                    data: items
                }
                res.json(result);
            });

        }
    });
};


var soccer_api = "http://sports.qq.com/soccerdata/";
exports.Soccer = function(req, res) { //足球联赛积分榜
    var reqPath = url.parse(req.url).path;
    var league_id = reqPath.substr(reqPath.lastIndexOf("/") + 1, reqPath.length);

    var geturl = soccer_api + league_id + "/jifen.htm";
    console.log(geturl);

    superagent.get(geturl).end(function(err, sres) {
        if (err) {
            var error = {
                err_code: 1,
                msg: "腾讯已经改标签了"
            }
            res.json(err);
        } else {
            var $ = cheerio.load(sres.text);
            //console.log(sres.text);
            var items = [];
            $('.jf-table>tbody tr').each(function(idx, element) {
                var $element = $(element);
                items.push({
                    id: idx + 1,
                    img: $element.find("td").eq(1).find("img").attr("src"),
                    href: $element.find("td").eq(1).find("a").attr("href"),
                    teamName: $element.find("td").eq(1).find("a").text(),
                    games: $element.find("td").eq(2).text(),
                    win: $element.find("td").eq(3).text(),
                    draw: $element.find("td").eq(4).text(),
                    lose: $element.find("td").eq(5).text(),
                    goal: $element.find("td").eq(6).text(),
                    lost: $element.find("td").eq(7).text(),
                    difference: $element.find("td").eq(8).text(),
                    score: $element.find("td").eq(9).text()
                });

                var result = {
                    code: 200,
                    data: items
                }
                res.json(result);
            });

        }
    });
};
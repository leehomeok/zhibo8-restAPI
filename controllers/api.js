var signature = require('wx_jsapi_sign');
var configSign = require('../config/config')();
var config = require('../config/default.json');
var http = require('request-json');
var url = require("url");
var qs = require("querystring");
var fs = require("fs");
var path = require('path');
var request = require('request');
var cheerio = require("cheerio");
var superagent = require("superagent");
var async = require('async');

var urlParse = function(url){
  var arr = [],obj={};
  if(url.indexOf('?') != -1){
    var parseStr = url.split("?")[1];
    if(parseStr.indexOf("&") != -1){
      arr = parseStr.split("&");
      for(var i = 0;i < arr.length;i++){
        obj[arr[i].split("=")[0]] = arr[i].split("=")[1];
      }
    }else{
      obj[parseStr.split("=")[0]] = parseStr.split("=")[1];
    }
  }
  return obj;
}
var downImgLength = 0
var downloadImage =function(src, dest, callback){
  request.head(src, function(err, res, body){
    if(src) {
      request(src).pipe(fs.createWriteStream(dest)).on('close',function(){
        callback(null, dest);
      });
    }
  });
};
var imgArr= ['guangxia', 'liaoning','guangdong','shandong','jiangsu','xinjiang','beijing','shenzhen',
'guangzhou','shanghai','zhejiang','beikong','fujian','shanxi','tongxi','qingdao',
'jilin','tianji','sichuan','bayi']
var suffix = '.png';

exports.download = function (req, res) {
  async.map(imgArr, function(item, callback){
    setTimeout(function(){
      downloadImage('https://duihui.qiumibao.com/nba/'+ item + suffix, './download/'+item + suffix,function(err, data){
        if(err) {
          console.log(err)
        }
        if(data) {
          console.log("done: "+ data);
        }
      });
    },400);
  }, function(err, results){
  });
}

exports.News = function (req, res) {
  var url = 'https://bifen4m.qiumibao.com/json/list.htm';
  var client = http.createClient(config.url);
  client.post(url, {}, function(err, response, body) {
    // console.log(response)
    res.json({
      status:200,
      data: response.body
    });
  });
}

/*
  获取五大联赛以及中超积分榜
*/
exports.Score = function(req, res) { //足球联赛积分榜
  var reqPath = url.parse(req.url).path;
  var query = url.parse(req.url).query;
  var league = query.split('=') [1]
  league = league.replace('"', '')
  var year = parseInt(new Date().getFullYear() - 1);
  var client = http.createClient(config.url);
  var score_api = 'http://dc.qiumibao.com/shuju/public/index.php?_url=/data/index&league=英超&tab=积分榜&year=[year]';
  client.get(score_api, function(err, response, body) {
    res.json(response);
  });
};

exports.FootballTeamInfo = function(req, res) { //足球俱乐部信息
  var reqPath = url.parse(req.url).path;
  var query = urlParse(req.url);
  var teamId = query.teamId;
  var client = http.createClient(config.url);
  var score_api = 'https://db.qiumibao.com/f/index/team?id='+ teamId;
  client.get(score_api, function(err, response, body) {
    if (response.statusCode == 200) {
      res.json({
        status:200,
        data: response.body
      });
    } else {
      res.json({
        status: 1,
        msg: '请求失败'
      })
    }
  });
};

exports.FootballTeamChangeInfo = function(req, res) { //足球俱乐部转会信息
  var reqPath = url.parse(req.url).path;
  var query = urlParse(req.url);
  var teamName = query.teamName;
  var client = http.createClient(config.url);
  var score_api = 'https://dc.qiumibao.com/shuju/public/index.php?_url=/football/transfer_team&team='+ teamName;
  client.get(score_api, function(err, response, body) {
    if (response.statusCode == 200) {
      res.json({
        status:200,
        data: response.body
      });
    } else {
      res.json({
        status: 1,
        msg: '请求失败'
      })
    }
  });
};

var player_api = "http://sports1.sina.cn/global/teaminfo?league_type_id=4&team_id=";
exports.playersByTeam = function(req, res) { // 获取球员详细信息
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
            $('#j_wrap_5 .thumbnail-b-gra a img').each(function(idx, element) {
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

exports.PickNews = function (req, res) {
  var url = 'https://m.zhibo8.cc/index.htm';
  var client = http.createClient(config.url);
  superagent.get(url).end(function(err, result) {
    if (err) {
      var error = {
        err_code: 1,
        msg: "直播吧已经改标签了"
      }
      res.json(error);
    } else {
      var $ = cheerio.load(result.text);
      var itemList = [];
      $('.saishi .ent li').each(function (index, element) {
        //if (index == 0) {
          var $element = $(element);
          var $ele = $element[0]
          if ($ele.attribs.type === 'basketball ' || $ele.attribs.type.indexOf('football') > -1) {
            var tr = $element.find("tr");
            var tds = tr[0].children.filter(function(item) {
              return item.type == 'tag' && item.name == 'td'
            })
            var l = tds.length,
              host = '',
              guest = '';
            for (var i = 0;i<l ;i++ ){
              var td_team = tds[i]
              if (i==1 ) {
                if (td_team.children.length) {
                  host = td_team.children[0].children[0].data
                }
              }
              if (i==3) {
                if (td_team.children.length) {
                  guest= td_team.children[0].children[0].data
                }
              }
            }
            var td = tr.find('td');
            var first_td = tr.find(".s_time");
            var last_td = tr.find(".remind");
            var startTime = first_td.text();
            var logo = tr.find('img');
            var teamName = tr.find('b');
            var score = tr.find('.s_name').text();
            var s_keyword = tr.find('.s_keyword').text();
            var hostLogo = logo[0] ? logo[0].attribs['data-original'] : '',
                guestLogo = logo[1] ? logo[1].attribs['data-original'] : '',
                hostTeam = teamName[0] ? teamName[0].children[0].data : host,
                guestTeam = teamName[2] ? teamName[2].children[0].data : guest;
            var situation = last_td.text();
            var data = {
              sTime: startTime,
              hostTeam: hostTeam,
              hostLogo: hostLogo,
              guestTeam: guestTeam,
              guestLogo: guestLogo,
              score: score,
              type: $ele.attribs.type,
              situation: situation
            };
            itemList.push(data)
          }
        //}
      })
      res.json({
        code: 200,
        data: itemList
      });
    }
  })
}

exports.NBAScore = function (req, res) {
  
}




/**
 * Created by taylorks on 3/7/15.
 */
'use strict';

var async = require('async'),
    scrape = require('linkscrape'),
    dataProvider = require('./dataProviders/mongodb/found'),
    util = require('vulcan').util,
    blackList = ['mp3', 'avi', 'mp4', 'jpg'],
    found = {};

var contains = function (url) {
    //TODO: add logic for recrawls.
    return found[url];
};

var add = function (url) {
    found[url] = new Date();
};


var findLinks = function (url, html, cb) {
    // do an array match to exclude links that have black listed mime.
    var initialResults,
        results = [];

    scrape(url, html, function (links) {

     /*   results = links.filter(function (link) {
            if (link && link.link) {
                if (!contains(link.link) && !util.arrayMatch(blackList, link.link.toLowerCase())) {
                    add(link.link);
                    return true;
                }
                // take care of adding to frontier here too probably time to break out async
                dataProvider.contains(link.link, function (truthy) {
                    if (!truthy) {
                        dataProvider.insert(link.link);
                        return true;
                    }
                })
            }
            return false;
        }).map(function (link) {
            return link.link;
        }); */

        initialResults = links.filter(function (link) {
            return link && link.link && !util.arrayMatch(blackList, link.link.toLowerCase());
        }).map(function (link) {
            return link.link;
        });

        async.eachSeries(initialResults, function (link, callback) {
           dataProvider.contains(link, function (result) {
               if (!result) {
                   dataProvider.insert(link, function () {
                       results.push(link);
                       callback();
                   });
               } else {
                   callback();
               }
           })
        }, function (err) {
            if (err) return console.log(err);
            cb(results);
        });


    });
};

module.exports = {
    contains: contains,
    add: add,
    findLinks: findLinks,
    self: found
};

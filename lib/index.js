'use strict';

// =====================================================
// CONFIGURATION
// =====================================================

var https      = require('https'),
    logger     = require('simlog'),
    username   = process.argv[2],
    pagenumber = process.argv[3];


// =====================================================
// GET REPOSITORIES
// =====================================================

var getRepos = function(user, page, cb) {

    var opts = {
        headers: {
            'user-agent': 'node.js'
        },
        host:   'api.github.com',
        path:   '/users/' + user + '/repos?page=' + page + '&per_page=100',
        method: 'GET'
    };

    var request = https.request(opts, function (res) {

        var body = '';

        // Error on Connection
        res.on('error', function () {
            logger.error('Unable to establish connection!');
            process.exit(1);
        });

        // Retrieve data from API
        res.on('data', function (buffer) {
            body += buffer.toString('utf8');
        });

        // Render information
        res.on('end', function () {

            var repos = [],
                json  = JSON.parse(body);

            json.forEach(function (repo) {
                if (repo.fork === false) {
                    repos.push({
                        name:  repo.name,
                        stars: repo.stargazers_count,
                        url:   repo.html_url
                    });
                }
            });

            cb(repos);

        });

        // Unable to find the user
        process.on('uncaughtException', function() {
            logger.error('Unable to find user!');
            process.exit(1);
        });

    });

    request.end();

};


// =====================================================
// UTILS
// =====================================================

// Format output
// UPDATE: I don't think this is the best solution, but it works fine.
var fmt = function(str) {
    return str
        .replace(/\{+|\}+/g, '')
        .replace(/\[+|\]+/g, '')
        .replace(/\,+/g, '\n')
        .replace(/\:/g, '')
        .replace(/\"name\"+/g, '\vName: ')
        .replace(/\"stars\"+/g, 'Stars: ')
        .replace(/\"url\"+/g, 'Link: ')
        .replace(/\"+/g, '');
};


// =====================================================
// RENDER REPOSITORIES
// =====================================================

module.exports = getRepos(username, pagenumber, function(repos) {

    var print  = JSON.stringify(repos, null);

    setTimeout(function() {
        if (repos.length !== 0) {
            console.log('');
            logger.info(username + '\'s repositorires: \n' );
            console.log('---------------------------------------------------------------------------------');
            console.log(fmt(print));
            console.log('');
            console.log('---------------------------------------------------------------------------------');
            console.log('User: ' + username + ' | Repositories: ' + repos.length + ' | Github: https://github.com/' + username);
            console.log('---------------------------------------------------------------------------------');
        } else {
            logger.warn(username + ' has no more repositories.' );
        }
    }, 200);

});

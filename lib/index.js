'use strict';

// =====================================================
// CONFIGURATION
// =====================================================

var https      = require('https'),
    logger     = require('simlog'),
    username   = process.argv[2],
    pagenumber = process.argv[3];


// =====================================================
// UTILS
// =====================================================

// UPDATE: I don't think this is the best solution, but it works fine by now.

var fmt = function(str) {
    return str
        .replace(/\{+|\}+/g, '')
        .replace(/\[+|\]+/g, '')
        .replace(/\,+/g, '\n')
        .replace(/\"name"+/g, 'Repository ')
        .replace(/\:/g, ': ')
        .replace(/\"+/g, '');
};


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

        res.on('error', function () {
            logger.error('Unable to find user!');
            process.exit(1);
        });

        res.on('data', function (buffer) {
            body += buffer.toString('utf8');
        });

        res.on('end', function () {

            var repos = [],
                json  = JSON.parse(body);

            json.forEach(function (repo) {
                repos.push({
                    name: repo.name
                });
            });

            cb(repos);

        });

    });

    request.end();

};

module.exports = getRepos(username, pagenumber, function(repos) {

    var print = JSON.stringify(repos, null, '');

    setTimeout(function() {
        if (repos.length !== 0) {
            console.log('');
            logger.info(username + '\'s repositorires: \n' );
            console.log('------------------------------');
            console.log(fmt(print));
            console.log('');
            console.log('Github: https://github.com/' + username);
            console.log('Total: ' + repos.length);
            console.log('------------------------------');
        } else {
            logger.warn(username + ' has no more repositories.' );
        }
    }, 200);

});

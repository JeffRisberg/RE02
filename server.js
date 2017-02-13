/**
 * Serves the application to the browser, then handles postings of new comments
 */
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/** Return a list of comments */
app.get('/comments.json', function (req, res) {
    fs.readFile('comments.json', function (err, data) {
        res.setHeader('Cache-Control', 'no-cache');
        res.json(JSON.parse(data));
    });
});

/** Handle posting of a new comment */
app.post('/comments.json', function (req, res) {
    fs.readFile('comments.json', function (err, data) {
        var comments = JSON.parse(data);
        comments.push(req.body);
        fs.writeFile('comments.json', JSON.stringify(comments, null, 4), function (err) {
            res.setHeader('Cache-Control', 'no-cache');
            res.json(comments);
        });
    });
});

app.listen(app.get('port'), function () {
    console.log('Server is listening at %s', app.get('port'));
});

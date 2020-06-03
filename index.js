var requestPromise = require('request-promise');
var app = require('express')();
var http = require('http').Server(app);
var cors = require('cors')

const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36';

const _include_headers = function(body, response, resolveWithFullResponse) {
    return {
        'headers': response.headers, 
        'data': body, 
        'finalUrl': response.request.uri.href // contains final URL
    };
};

function checkPrecondition(request, res, next) {
    request.precondition = false;
    if (!request.params) {
       return; 
    }
    if (!request.params.url) {
        return; 
     }
     if (!request.params.auth) {
        return; 
     }
    const url = decodeURI(request.params.url); //'https://loisngarcia.com/';
    // var user = 'guest';
    // var password = '123qweasdzxc!@#';
    // var base64encodedData = new Buffer(user + ':' + password).toString('base64');
    // console.log(base64encodedData);
    var authorization = 'Basic ' + request.params.auth;//'Z3Vlc3Q6MTIzcXdlYXNkenhjIVsj';
    const options = {
        uri: url,
        followAllRedirects: true,
        method: 'get',
        gzip: true,
        transform: _include_headers,
        headers: {
            'User-Agent': userAgent,
            'Authorization': authorization
        },
        resolveWithFullResponse: true, // Get statuscode
    };
    // console.log(options);
    const p1 = requestPromise(options).then((response, error, html) => {
        request.precondition = true;
        request.headers['token'] = response.data;
        // console.log(response.data);
        next()
    });
};

app.get('/:url/:auth', checkPrecondition, cors(), (req, res, next) => {
    if(!req.precondition){
        res.redirect(req.params.url);
        return;
    }
    res.redirect(req.params.url + '/' + req.headers['token']);
})

let port = 3000;
http.listen(port, function(){
    console.log('listening on *:' + port.toString());
});
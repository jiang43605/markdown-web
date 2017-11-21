const URL = require('url');
const HttpApi = require('./httpapi');
const controller = require('./sever/controller');
const staticFile = require('./sever/staticResource');
const managePage = require('./sever/manage');
const Resources = require('./tools/resources');
const common = require('./sever/common');
const Config = require('./tools/config');

// const h = require('marked')('<test />');

Config.init();
Resources.init();
process.listeners('beforeExit', Config.save);


const port = process.env.port || 8080;
var http = HttpApi.create();

// normalization
http.use(common);

// for static file
http.use(staticFile);

// just for admin manage page
http.use(managePage);

// for logic all message
http.use(controller);


http.listen(port);
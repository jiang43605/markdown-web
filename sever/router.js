const Url = require('url');
const path = require('path');

class Router {

    constructor() {
        this.routers = {};
    }

    add(routerString, callBack) {
        this.routers[routerString] = callBack;
    }

    common(callBack) {
        this.routers['*'] = callBack;
    }

    get middleware() {
        return async (ctx, next) => {
            let rawPath = Url.parse(ctx.request.url).path;
            if (this.routers[rawPath]) await this.routers[rawPath](ctx);
            else await this.routers['*'](ctx);

            await next();
        };
    }
}

module.exports = new Router();
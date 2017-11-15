/*
 * author: chengf
 * just like koa middleware
 * support async model
 */

const http = require('http');

module.exports = class HttpAPI {
    constructor() {
        this.middlewares = [];
    }

    static create() {
        if (HttpAPI.instance) return HttpAPI.instance;
        return new HttpAPI();
    }

    // action: (ctx:object,next:function)=>{};
    use(action) {
        if (typeof action !== 'function') return;
        this.middlewares.push(action);
    }

    initMiddlewares(ctx) {
        // if (this.middlewaresHttp) return;

        this.middlewaresHttp = [];

        const self = this;

        if (!self.middlewares.length) return;

        for (let i = self.middlewares.length - 1; i >= 0; i--) {
            this.middlewaresHttp[i] = {
                action: self.middlewares[i],
                next: self.middlewares.length - 1 === i
                    ? function () {
                    }
                    : self.middlewaresHttp[i + 1].action.bind(null, ctx, self.middlewaresHttp[i + 1].next)
            }
        }

    }

    async start(ctx) {

        if (!this.middlewaresHttp.length) {

            return;
        }

        await this.middlewaresHttp[0].action(ctx, this.middlewaresHttp[0].next);
    }

    listen(...params) {
        const server = http.createServer(async (req, res) => {
            const ctx = {
                request: req,
                response: res
            };

            ctx.response.setHeader('Content-Type', 'text/html; charset=utf-8');

            this.initMiddlewares(ctx);
            await this.start(ctx);
            ctx.response.end();
        });

        server.listen(...params);
    }
}
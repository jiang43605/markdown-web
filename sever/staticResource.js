const fs = require('fs');
const path = require('path');
const Url = require('url');

module.exports = async (ctx, next) => {
    let rawPath = Url.parse(ctx.request.url);
    let allowStaticResource = ['.css', '.js', '.png', '.woff', '.ico'];
    let allowFlag = allowStaticResource.some(o => rawPath.path.endsWith(o));

    if (allowFlag) {

        switch (path.extname(rawPath.path)) {
            case '.css':
                ctx.response.setHeader('Content-Type', 'text/css; charset=UTF-8');
                break;
            case '.js':
                ctx.response.setHeader('Content-Type', 'application/javascript');
                break;
            case '.woff':
                ctx.response.setHeader('Content-Type', 'application/x-font-woff');
                break;
            case '.ico':
                ctx.response.setHeader('Content-Type', 'image/ico');
                break;
            default:
                break;
        }

        try {
            let file = fs.readFileSync(path.resolve(__dirname, '..' + rawPath.path));
            ctx.response.write(file);
        } catch (error) {
            ctx.response.writeHead(404);
        }

        return;
    }

    await next();
};
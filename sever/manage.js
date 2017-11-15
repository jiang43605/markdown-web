const Url = require('url');
const fs = require('fs');
const Path = require('path');

const pageContent = fs.readFileSync(Path.resolve(__dirname, '../dist/manage.html')).toString('utf-8');

module.exports = async (ctx, next) => {

    const rawUrl = Url.parse(ctx.request.url);

    if (rawUrl.path === '/chengf.ok') {
        let data = fs.readdirSync(Path.resolve(__dirname, '../content')).map(file => {
            let name = file.split('.')[0];
            let ext = file.split('.')[1];

            return {
                name: name,
                canRead: ext.includes('r'),
                canWrite: ext.includes('w')
            }
        });
        let stringData = JSON.stringify(data);

        let ipData = [];
        for (let item in Config.ips) {
            ipData.push({
                name: item,
                count: Config.ips[item].fileCount,
                maxCount: Config.ips[item].maxFileCount
            });
        }
        let ipStringData = JSON.stringify(ipData);

        ctx.response.write(pageContent
            .replace('@data', `[${stringData.substr(1, stringData.length - 2)}]`)
            .replace('@ipdata', `[${ipStringData.substr(1, ipStringData.length - 2)}]`)
        );
    }
    else {
        await next();
    }
}
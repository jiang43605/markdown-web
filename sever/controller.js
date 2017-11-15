const Url = require('url');
const fs = require('fs');
const Path = require('path');
const router = require('./router');

const mainPage = fs.readFileSync(Path.resolve(__dirname, '../dist/index.html'));

router.add('/', async (ctx) => {
    ctx.response.write(mainPage
        .toString('utf-8')
        .replace('@onlyRead', 'null'));
});

router.add('/api/save', async (ctx) => {

    const pathNames = ctx.request.body.file
        .split('/')
        .filter(o => o !== '');

    if (pathNames.length !== 0) ctx.request.body.file = pathNames[0];
    else {
        ctx.response.writeHead(403);
        ctx.response.write('无权操作');
        return;
    }

    // the first time a user creates a file 
    if (Resources.findFile(ctx.request.body.file) === false) {
        if (!Config.ips[ctx.request.ip]) Config.ips[ctx.request.ip] = {
            fileCount: 0,
            maxFileCount: Config.ipMaxCotentFiles,
            file: []
        }

        if (Config.ips[ctx.request.ip].fileCount < Config.ips[ctx.request.ip].maxFileCount) {
            Resources.add(ctx.request.body.file, ctx.request.body.text);
            Config.ips[ctx.request.ip].fileCount++;
            Config.ips[ctx.request.ip].file.push(ctx.request.body.file);
        } else {
            ctx.response.writeHead(403);
            ctx.response.write('无权操作');
        }

        Config.save();
        return;
    }

    // user save them file in content dir
    if (Resources.update(ctx.request.body.file, ctx.request.body.text) === false) {
        ctx.response.writeHead(403);
    }

});

router.add('/api/c', async (ctx) => {

    const flag = ctx.request.body.flag.substring(0, 1);
    const filename = ctx.request.body.filename;

    let status = Resources.update(
        filename,
        flag === 'r' ? true : false,
        flag === 'w' ? true : false
    );

    if (status === false) ctx.response.writeHead(403);
});

router.add('/api/ip', (ctx) => {
    const name = ctx.request.body.name;
    const value = ctx.request.body.value;

    Config.ips[name].maxFileCount = parseInt(value);
    Config.save();
});

router.common(async (ctx) => {

    const fileName = Url
        .parse(ctx.request.url)
        .path
        .split('/')
        .filter(o => o !== '')[0];

    const file = Resources.findFile(fileName);
    if (file === false) {
        ctx.response.write(mainPage
            .toString('utf-8')
            .replace('@onlyRead', 'null'));
        return;
    }

    const ext = Path.extname(file);

    switch (true) {
        case ext === '.null':
            ctx.response.write('<h1>you have no access!</h1>');
            break;
        case ext === '.rw' || ext === '.wr' || ext === '.w':
            ctx.response.write(mainPage
                .toString('utf-8')
                .replace('@text', `${fs.readFileSync(file)}`)
                .replace('@onlyRead', 'null'))
            break;
        case ext === '.r':
            ctx.response.write(mainPage
                .toString('utf-8')
                .replace('@text', `${fs.readFileSync(file)}`)
                .replace('@onlyRead', 'true'))
            break;
        default:
            ctx.response.writeHead(404);
            break;
    }

});

module.exports = router.middleware;
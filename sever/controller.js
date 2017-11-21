const Url = require('url');
const fs = require('fs');
const Path = require('path');
const router = require('./router');

const mainPage = fs.readFileSync(Path.resolve(__dirname, '../dist/index.html'));
const main = Path.resolve(__dirname, '../content/.main');
let mainData = `${fs.readFileSync(main)}`.replace(/</g, '$lt;').replace(/>/g, '&gt;');

router.add('/', async (ctx) => {
    ctx.response.write(mainPage
        .toString('utf-8')
        .replace('@text', mainData)
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

    // update main page
    if (pathNames.length === 1 && ctx.request.body.file === Config.mainPassword) {
        // can't call Resources.update()
        // because not its job
        fs.writeFileSync(main, ctx.request.body.text);

        // update cache
        mainData = `${fs.readFileSync(main)}`.replace(/</g, '$lt;').replace(/>/g, '&gt;');
        return;
    }

    // the first time a user creates a file 
    // this block for limit ip
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

    const isSuper = pathNames[1] === undefined ? false
        : pathNames[1] === Config.password ? true : false;

    // super user can force update
    if (isSuper) {
        if (Resources.forceUpdate(ctx.request.body.file, ctx.request.body.text) === false) {
            ctx.response.writeHead(403);
        }

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

router.add('/api/ip', async (ctx) => {
    const name = ctx.request.body.name;
    const value = ctx.request.body.value;

    Config.ips[name].maxFileCount = parseInt(value);
    Config.save();
});

router.add('/api/uploadPic', async (ctx) => {

    if (!ctx.request.file) return;
    const image = ctx.request.file.type.match(/^image\/(jpg|gif|png|jpeg|svg|bmp|apng)$/i);

    if (!image) return;

    const filename = Resources.saveImage(image[1], ctx.request.file.file);
    ctx.response.write('/image/' + filename);
});

router.common(async (ctx) => {

    const fileNames = Url
        .parse(ctx.request.url)
        .path
        .split('/')
        .filter(o => o !== '');

    const file = Resources.findFile(fileNames[0]);
    const isSuper = fileNames[1] === undefined ? false
        : fileNames[1] === Config.password ? true : false;

    if (file === false) {
        ctx.response.write(mainPage
            .toString('utf-8')
            .replace('@text', mainData)
            .replace('@onlyRead', 'null'));
        return;
    }

    const ext = Path.extname(file);

    switch (true) {
        case ext === '.null' && !isSuper:
            ctx.response.write('<h1>you have no access!</h1>');
            break;
        case ext === '.rw' || ext === '.wr' || ext === '.w' || isSuper:
            ctx.response.write(mainPage
                .toString('utf-8')
                .replace('@text', Resources.getFile(fileNames[0]))
                .replace('@onlyRead', 'null'))
            break;
        case ext === '.r':
            ctx.response.write(mainPage
                .toString('utf-8')
                .replace('@text', Resources.getFile(fileNames[0]))
                .replace('@onlyRead', 'true'))
            break;
        default:
            ctx.response.writeHead(404);
            break;
    }

});

module.exports = router.middleware;
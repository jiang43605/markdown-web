let getPost = function (ctx) {
    let chunks = '';
    ctx.request.addListener('data', chunk => chunks += chunk);
    return new Promise((reslove, reject) => {
        ctx.request.addListener('end', () => {
            let obj = JSON.parse(chunks);
            obj.text = decodeURIComponent(obj.text);
            ctx.request.body = obj;
            reslove();
        });
    });
};

module.exports = async (ctx, next) => {

    let ip =/(\w{1,3}\.){3}\w{1,3}/.exec(ctx.request.headers['x-forwarded-for'] ||
    ctx.request.connection.remoteAddress ||
    ctx.request.socket.remoteAddress ||
    ctx.request.connection.socket.remoteAddress);

    if(ip===null) ctx.request.ip = ip;
    else ctx.request.ip = ip[0];

    if (ctx.request.method === 'POST') {
        await getPost(ctx);
    }

    await next();
};
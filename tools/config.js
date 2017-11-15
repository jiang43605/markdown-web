const Fs = require('fs');
const Path = require('path');
const path = Path.resolve(__dirname, '../config/web.config.json');

module.exports = {
    init() {
        const configPath = Path.resolve(__dirname, '../config/web.config.json');

        if (global.Config) return;

        try {
            const data = Fs.readFileSync(configPath, { encoding: 'utf-8' });
            global.Config = JSON.parse(data);
        } catch (error) {
            global.Config = {
                ipMaxCotentFiles: 10,
                ips: {}
            }
        }

        global.Config.save = this.save;
    },

    save() {
        require('fs').writeFile(path, JSON.stringify(global.Config));
    }
}
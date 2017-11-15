const path = require('path');
const fs = require('fs');
const url = require('url');

const defulatContent = path.resolve(__dirname, '../content');
const resloveExt = Symbol('resloveExt');

// uniform resource management, for content
class Resources {
    constructor(path) {
        this._path = path;
    }

    static init(path = defulatContent) {
        if (!global.Resources)
            global.Resources = new Resources(path);
    }

    [resloveExt](canRead, canWrite) {
        let ext = canRead ? 'r' : '';
        ext += canWrite ? 'w' : '';
        return ext === '' ? 'null' : ext;
    }

    // find specified fileName in this._path
    findFile(fileName) {
        let files = fs.readdirSync(this._path)
            .filter(file => new RegExp(`^${fileName}\.(r|w|rw|wr|null)$`).test(file));

        if (files.length === 0) return false;
        if (files.length > 1) throw new Error('the file found is greater than 1');

        return path.resolve(this._path, files[0]);
    }

    // add new file, two required parameters: fileName, data
    // if you want update file, please call update()
    // only read: fileName.r
    // only write: fileName.w
    // read and write: fileName.rw
    // other: fileName.null
    add(fileName, data, canRead = true, canWrite = true) {
        if (!fileName) return false;

        const ext = this[resloveExt](canRead, canWrite);
        const filePath = path.resolve(this._path, `${fileName}.${ext}`);
        fs.writeFileSync(filePath, data);
        return true;
    }

    // update file data or access
    // if there are 2 parameters, they mean: fileName, data
    // if there are 3 parameters, they mean: fileName, readStatusChange, writereadStatusChange
    update(fileName, ...params) {
        if (!fileName) return false;

        let file = this.findFile(fileName);
        if (file === false) return false;

        if (params.length === 1) {
            // replace data
            fs.writeFileSync(file, params[0]);
        } else {
            // change the read or write property
            let ext = path.extname(file);
            // change read property
            if (params[0] === true) {
                if (ext.includes('r')) ext = ext.replace('r', '');
                else ext = ext === '.null' ? '.r' : ext + 'r';
            }
            // change write property
            if (params[1] === true) {
                if (ext.includes('w')) ext = ext.replace('w', '');
                else ext = ext === '.null' ? '.w' : ext + 'w';
            }

            // reset
            if (ext === '.') ext = '.null';

            fs.renameSync(file, path.resolve(this._path, fileName + ext));
        }
    }

    // delete file
    delete(fileName) {
        fs.unlinkSync(this.findFile(fileName));
    }

    get count() {
        return fs.readdirSync(this._path).length;
    }
}

module.exports = Resources;
```javascript
/* eslint-disable no-console */
const fs = require('fs-extra');
const path = require('path');
require('colors');

const isIgnored = (file, ignores) => ignores.indexOf(file) > -1 || /^\..*/.test(file);

const isValidExtension = (file, extensions) => extensions.indexOf(file.split('.').pop()) > -1

const listFilesSync = (dir, list = [], extensions, ignores) => {
  fs.readdirSync(dir).forEach(file => {
    if (isIgnored(file, ignores)) return list;
    list = fs.statSync(path.join(dir, file)).isDirectory()
      ? (listFilesSync(path.join(dir, file), list, extensions, ignores))
      : (isValidExtension(file, extensions) ? list.concat(path.join(dir, file)) : list);
  });
  return list;
}

module.exports = {
  listFilesSync: (dir, extensions, ignores) => listFilesSync(dir, [], extensions, ignores),
  cleanFilesSync: (files) => {
    for (var i = 0; i < files.length; i++) {
      console.log(files[i].red)
      fs.remove(files[i]);
    }
  }
}```

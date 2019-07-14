// # Working with Files
// This file is used to work with file system as middleware

/* eslint-disable no-console */
const fs = require('fs-extra')
const path = require('path')
require('colors')

// ## Ignore Files
// Ignoring file or folders. Ignore list is coming from command line.
const isIgnored = (file, ignores) => ignores.indexOf(file) > -1 || /^\..*/.test(file)

// ## File Extensions to Convert
// Same as ignore list, file extensions are are coming from command line
const isValidExtension = (file, extensions) => extensions.indexOf(file.split('.').pop()) > -1

// ## List all files
// This will create an array list of files recursively.
const listFilesSync = (dir, list = [], extensions, ignores) => {
  fs.readdirSync(dir).forEach(file => {
    if (isIgnored(file, ignores)) return list
    list = fs.statSync(path.join(dir, file)).isDirectory()
      ? (listFilesSync(path.join(dir, file), list, extensions, ignores))
      : (isValidExtension(file, extensions) ? list.concat(path.join(dir, file)) : list)
  })
  return list
}

//
module.exports = {
  listFilesSync: (dir, extensions, ignores) => listFilesSync(dir, [], extensions, ignores),
  cleanFilesSync: (files) => {
    for (var i = 0; i < files.length; i++) {
      console.log(files[i].red)
      fs.removeSync(files[i])
    }
  }
}

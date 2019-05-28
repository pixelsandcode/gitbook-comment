/* eslint-disable no-console */
// # Markdown Generator
// This is an easy `.md` generator for gitbook.com. It creates markdown file using comments in the source file
// And place them next to the original file by default
const program = require('commander')
const fs = require('fs-extra')
const path = require('path')
const git = require('simple-git')();
require('colors');

const file = require('./file.js')
const parser = require('./parser.js')

/* eslint-disable-next-line no-console */
const print = console.log
/* eslint-disable-next-line no-undef */
const root = path.join(__dirname, '../')

// ## End of Process Callback
// This is called when there is an error with saving the file
const callback = () => print('Error in processing files'.red)

// ## How Files are Processed?
// This method is getting a list of files and perform below steps: 
// 1. Read one by one
// 2. Parse them:
//   * Code
//   * Comment
// 3. Save the result as MD ([MarkDown](https://www.markdownguide.org/cheat-sheet/))
const processFiles = function(files, complete) {
  var source, target;
  source = files.shift();
  target = source.substr(0, source.lastIndexOf(".")) + '.md';
  return fs.readFile(source, function(error, buffer) {
    var code, sections
    if (error) return callback(error)
    code = buffer.toString()
    // Separate Code from MD comments
    sections = parser.parse(code, {})
    fs.outputFileSync(target, parser.compile(sections))
    print(`${source} => ${target}`.green)
    return (files.length) ? processFiles(files, complete) : complete() 
  });
};

const generateDocs = (path, ignores, extensions) => {
  const files = file.listFilesSync(path, extensions, ignores)
  const totalFiles = files.length
  print(`${totalFiles} file(s) to convert:`.green.bold)
  const complete = () => print(`All ${totalFiles} file(s) are converted!`.green.bold)
  processFiles(files, complete);
}

// ## CLI Commands
// There are 3 commands in this CLI
// 
// ### 1. Generate doc file
//
// `./bin/gitbook-comment generate -e js,css -i node_modules,bin -p ./src`
// All arguments are explained in the command: `./bin/gitbook-comment --help` or `./bin/gitbook-comment generate -h`
program
  .version('0.1.0')
  .command('generate')
  .description('Generate docs')
  .option('-p, --path [path]', 'Source path', root)
  .option('-i, --ignores [ignores]', 'Comma separated folder names to ignore', 'node_modules')
  .option('-e, --extensions [extensions]', 'Comma separated extension names to include', 'js')
  .action((cmd) => {
    cmd.ignores = cmd.ignores.split(',')
    cmd.extensions = cmd.extensions.split(',')
    generateDocs(cmd.path, cmd.extensions, cmd.ignores)
  })

// ### 2. Clean up doc files
//  
// `./bin/gitbook-comment clean-up -p ./src`
program
  .command('clean-up')
  .description('Remove generated docs')
  .option('-p, --path [path]', 'Source path', root)
  .option('-i, --ignores [ignores]', 'Comma separated folder names to ignore', 'node_modules')
  .action((cmd) => {
    // Make sure README.md files are not deleted in the project
    cmd.ignores = ['README.md', ...cmd.ignores.split(',')]
    const files = file.listFilesSync(cmd.path, ['md'], cmd.ignores)
    const totalFiles = files.length
    print(`Cleaning up all generated doc files (${totalFiles})`.red.bold)
    file.cleanFilesSync(files);
  })

// ### 3. Clean up doc files
//  
// `./bin/gitbook-comment clean-up -p ./src`
program
  .command('publish')
  .description('Publish generated docs')
  // eslint-disable-next-line no-undef
  .option('-p, --path [path]', 'Source path', root)
  .option('-i, --ignores [ignores]', 'Comma separated folder names to ignore', 'node_modules')
  .option('-e, --extensions [extensions]', 'Comma separated extension names to include', 'js')
  .action((cmd) => {
    //cmd.ignores = cmd.ignores.split(',')
    //cmd.extensions = cmd.extensions.split(',')
    //generateDocs(cmd.path, cmd.extensions, cmd.ignores)
    git.checkoutBranch("gh-pages")
  })

program
  // eslint-disable-next-line no-undef
  .parse(process.argv)


// # Markdown Generator
// This is an easy `.md` generator for gitbook.com. It creates markdown file using comments in the source file
// And place them next to the original file by default
const program = require('commander')
const fs = require('fs-extra')
const path = require('path')
const exec = require('node-exec-promise').exec;
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
// 2. Parse them
// 3. Save the result as MD ([MarkDown](https://www.markdownguide.org/cheat-sheet/))
const processFiles = function(files, complete) {
  var source, target;
  source = files.shift();
  target = source.substr(0, source.lastIndexOf(".")) + '.md';
  return fs.readFileSync(source, function(error, buffer) {
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

const generateDocs = (path, extensions, ignores) => {
  const files = file.listFilesSync(path, extensions, ignores)
  const totalFiles = files.length
  print(`${totalFiles} file(s) to convert:`.green.bold)
  const complete = () => print(`All ${totalFiles} file(s) are converted!`.green.bold)
  return processFiles(files, complete);
}

// ## CLI Commands
// There are 2 commands in this CLI
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

const getBranchName = () => exec("git branch").then(
  (out) => {
    var branch;
    out.stdout.split('\n').forEach((name) => {
      if (name[0] === '*') branch = name.split(' ')[1];
    })
    print(`Currently at ${branch}`.green);
    return branch;
  }
)

const execGit = (cmd) => exec(cmd).then(
  (out) => {
    print(out.stdout)
    return true;
  },
  (error) => {
    print(error.toString().red)
    return false;
  }
)


// ### 3. Generate and publish doc files
//  
// `./bin/gitbook-comment publish`
program
  .command('publish')
  .description('Generate and publish doc files')
  .option('-b, --branch [path]', 'Git branch for docs', 'gh-pages')
  .option('-p, --path [path]', 'Source path', root)
  .option('-i, --ignores [ignores]', 'Comma separated folder names to ignore', 'node_modules')
  .option('-e, --extensions [extensions]', 'Comma separated extension names to include', 'js')
  .action((cmd) => {
    cmd.ignores = cmd.ignores.split(',')
    cmd.extensions = cmd.extensions.split(',')
    getBranchName()
      .then((branch) => {
        execGit(`git checkout ${cmd.branch}`)
          .then((success) => {
            if (!success) return false
            print(`Switched to ${cmd.branch}`.green.bold)
            return execGit(`git pull origin ${branch}`)
          })
          .then((success) => {
            if (!success) return false
            print(`Pull updates from remote branch '${branch}'`.green.bold)
            return generateDocs(cmd.path, cmd.extensions, cmd.ignores)
          })
          .then((success) => {
            if (!success) return false
            return execGit('git commit -a -m "add doc"')
          })
          .then((success) => {
            if (!success) return false
            print(`Commit changes at ${cmd.branch}`.green.bold)
            return execGit(`git push origin ${cmd.branch}`)
          })
          .then((success) => {
            if (!success) return false
            print(`Push changes ${cmd.branch}`.green.bold)
            return execGit(`git checkout ${branch}`)
          })
          .then((success) => {
            if (!success) return print("Finished with error(s). Please use git command to solve the issue before next run".red)
            print(`Switch back to ${branch}`.green.bold)
            print("Finished with no error".green.bold)
          })
      })
    //
  })
program
  // eslint-disable-next-line no-undef
  .parse(process.argv)


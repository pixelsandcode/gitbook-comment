// # Markdown Generator

// This is an easy `.md` generator for gitbook.com. It creates markdown file using comments in the source file
// And place them next to the original file by default
const program = require('commander')
const fs = require('fs-extra')
const path = require('path')
const exec = require('node-exec-promise').exec
require('colors')

const file = require('./file.js')
const parser = require('./parser.js')

/* eslint-disable-next-line no-console */
const print = console.log
/* eslint-disable-next-line no-undef */
const root = path.join(__dirname, '../')

// ## Core methods
// ### How Files are Processed?
// This method is getting a list of files and perform below steps:
//
// 1. Read one by one
// 2. Parse them
// 3. Save the result as MD ([MarkDown](https://www.markdownguide.org/cheat-sheet/)) in the same path as source files
const processFiles = (files) => {
  var source, target, i, code, sections
  for (i = 0; i < files.length; i++) {
    source = files[i]
    target = source.substr(0, source.lastIndexOf('.')) + '.md'
    code = fs.readFileSync(source).toString()
    // Separate Code from MD comments
    sections = parser.parse(code, {})
    fs.outputFileSync(target, parser.compile(sections))
    print(`${source} => ${target}`.green)
  }
}

// ### Reading files
// This method is using `processFiles` to compile `.md` files and
// uses [file.js](./file.md) to list all files in given path.
const generateDocs = (path, extensions, ignores) => {
  const files = file.listFilesSync(path, extensions, ignores)
  const totalFiles = files.length
  print(`${totalFiles} file(s) to convert:`.green.bold)
  processFiles(files)
  print(`All ${totalFiles} file(s) are converted!`.green.bold)
  return true
}

// ### Delete generated .md docs
// This is used to clean up generated `.md` docs in a given path and useful if you create doc files by mistake.
// and ignore README.md files and others if specified
const cleanupDocs = (path, ignores) => {
  // Make sure README.md files are not deleted in the project
  ignores = ['README.md', ...ignores]
  const files = file.listFilesSync(path, ['md'], ignores)
  const totalFiles = files.length
  print(`Cleaning up all generated doc files (${totalFiles})`.red.bold)
  file.cleanFilesSync(files)
  return true
}

// ### Delete generated .md docs
// Get current branch name using git commands to be able to revert after publishing docs.
const getBranchName = () => exec('git branch').then(
  (out) => {
    var branch
    out.stdout.split('\n').forEach((name) => {
      if (name[0] === '*') branch = name.split(' ')[1]
    })
    print(`Currently at ${branch}`.green)
    return branch
  }
)

// ### Execute git commands
// Execute git commands and print outputs
const execGit = (cmd) => exec(cmd).then((out) => true, (error) => { throw error })

// ## CLI commands
// There are 3 commands in this CLI
//
// ### 1. Generate doc file
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
// `./bin/gitbook-comment clean-up -p ./src`
program
  .command('clean-up')
  .description('Remove generated docs')
  .option('-p, --path [path]', 'Source path', root)
  .option('-i, --ignores [ignores]', 'Comma separated folder names to ignore', 'node_modules')
  .action((cmd) => {
    cmd.ignores = cmd.ignores.split(',')
    cleanupDocs(cmd.path, cmd.ignores)
  })

// ### 3. Generate and publish doc files
// This is publishing to docs branch by default. You need to make sure the branch exist locally using `git branch docs`.
// Also you can choose any other branch by passing the `-b` argument.
//
// **Note:** docs is chosen as default value as it is default branch in gitbook.
// `./bin/gitbook-comment publish -b gh-pages`
program
  .command('publish')
  .description('Generate and publish doc files')
  .option('-b, --branch [path]', 'Git branch for docs', 'docs')
  .option('-p, --path [path]', 'Source path', root)
  .option('-i, --ignores [ignores]', 'Comma separated folder names to ignore', 'node_modules')
  .option('-e, --extensions [extensions]', 'Comma separated extension names to include', 'js')
  .action((cmd) => {
    cmd.ignores = cmd.ignores.split(',')
    cmd.extensions = cmd.extensions.split(',')
    getBranchName()
      .then((branch) => {
        execGit(`git checkout ${cmd.branch}`)
          .then(() => {
            print(`Switched to ${cmd.branch} branch`.green.bold)
            return execGit(`git pull origin ${branch} -f`)
          })
          .then(() => {
            print(`Pull updates from remote branch '${branch.bold}'`.green)
            return cleanupDocs(cmd.path, cmd.ignores)
          })
          .then(() => generateDocs(cmd.path, cmd.extensions, cmd.ignores))
          .then(() => execGit('git add -A && git commit -a -m "docs: add doc"'))
          .then(() => {
            print(`Commit changes on ${cmd.branch.bold} branch`.green)
            return execGit(`git push origin ${cmd.branch}`)
          })
          .then(() => {
            print(`Push changes to ${cmd.branch.bold} branch`.green)
            return execGit(`git checkout ${branch}`)
          })
          .then(() => {
            print(`Switch back to ${branch}`.green.bold)
            print('Finished with no error'.green.bold)
          }).catch((error) => print(error.toString().red))
      })
    //
  })
program
  // eslint-disable-next-line no-undef
  .parse(process.argv)


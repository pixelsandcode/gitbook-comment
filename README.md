# Markdown Generator based on comment (Ideal for Gitbook)

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

## What does it do?
It generate markdown for any comment line starting with `/// ` **(there is a space at the end of it)**.

```javascript
/// ### Method Name
/// This is my awesome method.
function Sum(a, b) {
  /// This will convert to markdown
  // This is a normal comment
  return a + b
}
/* Another normal comment */
```
Above code will become this:

### Method Name
This is my awesome method.
```javascript
function Sum(a, b) {
```
This will convert to markdown
```javascript
  // This is a normal comment
  return a + b
}
/* Another normal comment */
```


## Instruction
1. Install the npm using `npm install --save gitbook-comment` 
2. Use `gitbook-comment --help` to read the command line instructions
3. Edit your package.json with
```json
  "scripts": {
    "doc-generate": "gitbook-comment generate -p ./",
    "doc-clean-up": "gitbook-comment clean-up -p ./",
    "doc-publish": "gitbook-comment publish -p ./"
  }
```
4. Make suer you have `docs` branch created locally on your machine by `git branch docs`
5. Make sure you have your code committed on your working branch
6. Run `npm run doc-generate` on your working branch:
   * This will switch branch automatically to `docs`
   * Create documents next to source files
   * Push them to github
   * Switch back to working branch

**Note** If you do not commit your work in working branch, it may get lost in switching the branches.

**note:** This generator is creating the `.md` files in same folder next to the original files.

Alternatively you can generate or clean up docs in any branch
```bash
# Generate doc in current branch
npm run doc-generate

# Check help for a command
npm run doc-generate -- -h

# Get full documentation
./node_modules/gitbook-comment/bin/gitbook-comment -h

# Use more more options on a command
npm run doc-generate -- -p ./src -i bin -e js,css,scss

# Clean up generated docs
npm run doc-comment clean-up
```

If you generate doc manually, make sure they are uploaded to **docs or any other none development branch** and use gitbook.com integration to view them.



* You can learn more on how it works [here](https://app.gitbook.com/@teepee/s/gitbook-comment/)
* Demo project is located at https://github.com/pixelsandcode/gitbook-comment-demo

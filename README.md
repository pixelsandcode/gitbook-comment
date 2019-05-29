# Markdown Generator for gitbook.com

## Instruction
1. install the npm using `npm install --save gitbook-comment` 
2. use `gitbook-comment --help` to read the command line instructions
3. You can generate doc by a command like this:

```
gitbook-comment generate

//or if you want more options use

gitbook-comment generate -p ./src -i bin -e js,css,scss
```
4. Or clean up the created `.md` files
```
gitbook-comment clean-up
```
**note:** This generator is creating the `.md` files in same folder next to the original files.

5. You should upload this to **gh-pages or any other none development branch** and use gitbook.com to load it as reference.

You can learn more on how it works [here](https://tipi-1.gitbook.io/gitbook-comment/v/gh-pages/)
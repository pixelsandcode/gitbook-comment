// # Code Parser
// This file is used to parse code and extract comments and code for creating markdown files

// ## Parser
// Separate code from comments. All comments should be written single line format `//`. Otherwise
// This parser will skip them. This is very useful when you want to have lint comments not tracked
// in documentation.
const parse = (source) => {
  var code, doc, hasCode, line
  doc = code = ''
  var lines = source.split('\n')
  var len = lines.length
  var sections = []
  const lang = {
    singleLineComment: /^(\s)*\/\/\/(\s)?/
  }
  hasCode = !lang.singleLineComment.test(lines[0])

  const save = () => {
    if (doc === '') sections.push({ code })
    if (code === '') sections.push({ doc })
    doc = code = ''
    hasCode = true
  }

  for (var i = 0; i < len; i++) {
    line = lines[i]
    if (lang.singleLineComment.test(line)) {
      if (hasCode) save()
      hasCode = false
      doc += line.replace(lang.singleLineComment, '') + '\n'
    } else {
      if (!hasCode) save()
      hasCode = true
      code += line + '\n'
    }
  }
  save()
  return sections
}

// ## Compiler
// Convert the sections created in Parser to markdown content and code to markdown javascript code blocks.
// Currently other types of code blocks are not supported.
const compile = (sections) => {
  var len = sections.length
  var section
  var text = ''
  for (var i = 0; i < len; i++) {
    section = sections[i]
    if (section.code) {
      if (section.code.replace(/\n/, '') !== '') {
        text += '\n```javascript\n' + section.code.replace(/(\n)*$/, '').replace(/^(\n)*/, '') + '\n```\n'
      }
    }
    if (section.doc) text += section.doc
  }
  return text
}

module.exports = {
  parse,
  compile
}

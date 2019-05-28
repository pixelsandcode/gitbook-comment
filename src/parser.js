const parse = function(source) {
  var code, doc, hasCode, line;
  doc = code = '';
  var lines = source.split('\n');
  var len = lines.length;
  var sections = [];
  const lang = {
    singleLineComment: /^\/\/\s/
  }
  hasCode = ! lang.singleLineComment.test(lines[0]);
  
  const save = function() {
    if (doc === '') sections.push({code});
    if (code === '') sections.push({doc});
    doc = code = '';
    return hasCode = true;
  };
  
  for (var i = 0; i < len; i++) {
    line = lines[i];
    if (lang.singleLineComment.test(line)) {
      if (hasCode) save();
      hasCode = false;
      doc += line.replace(lang.singleLineComment, '') + '\n';
    } else {
      if (!hasCode) save();
      hasCode = true;
      code += line + '\n';
    }
  }
  save();
  return sections;
};

const compile = function(sections) {
  var len = sections.length;
  var section;
  var text = '';
  for (var i = 0; i < len; i++) {
    section = sections[i];
    if (section.code) text += '```javascript\n' + section.code.replace(/\n$/, '') + '```\n';
    if (section.doc) text += section.doc;
  }
  return text;
}

module.exports = {
  parse,
  compile
}
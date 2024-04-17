const fs = require('fs')
const package_json = require('./package.json')

let names = []
for (let file of package_json.files) {
  if (match = file.match(/^common\/([a-zA-Z_]+).js$/)) {
    const name = match[1]
    if (['helpers', 'runtime'].includes(name)) {
      continue
    }
    names.push(name)
  }
}
names.sort()

let main_js = ''

const l = (line) => {
  main_js += `${line}\n`
}

l("const tpm = require('./common/runtime').theprogrammablemind")
for (let name of names) {
  l(`const ${name} = require('./common/${name}')`)
}

l('')
l('module.exports = {')
l('  Config: tpm.Config,')
for (let name of names) {
  l(`  ${name},`)
}

l('}')

fs.writeFileSync('./main.js', main_js)

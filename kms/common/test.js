const package = require('../package.json')
const { exec } = require('child_process');

let tests = []
let retrains = []
for (let file of package.files) {
  if (!/^.*.js$/.exec(file)) {
    continue
  }
  if (file == 'main.js') {
    continue
  }
  if (/^common.helper/.exec(file)) {
    continue
  }

  file = file.slice('common/'.length).slice(0, -3)
  if (['', 'pipboyTemplate', 'runtime', 'tester', 'helpers'].includes(file)) {
    continue
  }

  retrains.push(`node ${file} -rt -g`)
  tests.push(`node ${file} -tva -g`)
  tests.push(`node tester -m ${file} -tva -tmn ${file} -g`)
}

// tests = [tests[0]]

const loop = (tests, failed) => {
  if (tests.length == []) {
    if (failed.length > 0) {
      console.log("FAILED Tests", JSON.stringify(failed, null, 2))
    }
    return
  }
  const test = tests.shift()
  exec(test,
    (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
          console.log(`exec error: ${error}`);
          failed.push(test)
      }
      loop(tests, failed)
    });
}

loop(retrains.concat(tests), [])

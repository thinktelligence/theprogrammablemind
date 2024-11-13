const package = require('../package.json')
const { exec } = require('child_process');

console.time('tests time')

const sleep = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

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
  if (!['pipboy'].includes(file)) {
    continue
  }

  retrains.push(`node ${file} -rtf -g`)
  tests.push(`node ${file} -tva -g`)
  // tests.push(`node tester -m ${file} -tva -tmn ${file} -g`)
  // tests.push(`node tester_rebuild -m ${file}`)
}

// tests = [tests[0]]

const loop = async (tests, failed) => {
  if (tests.length == []) {
    if (failed.length > 0) {
      console.log("FAILED Tests", JSON.stringify(failed, null, 2))
    }
    console.timeEnd('tests time')
    for (let i = 0; i < 7; ++i) {
      console.log('\u0007')
      await sleep(1000)
    }
    return
  }
  const test = tests.shift()
  console.log("Doing", test)
  exec(test,
    (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
          console.log(`exec error: ${error}`);
          failed.push(test)
      } else if (stdout.includes('ERROR')) {
          failed.push(test)
      }
      loop(tests, failed)
    });
}

(async () => {
  await loop(retrains.concat(tests), [])
})()

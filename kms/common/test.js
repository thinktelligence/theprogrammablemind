const package_json = require('../package.json')
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function hasDebugCommand(cmd) {
  let hasError = false
  try {
    const { stdout } = await execAsync(`git grep "${cmd}" | grep -v test.js: | grep -v .json`)
    console.log(await stdout)
    hasError = true
  } catch (error) {
  }
  if (hasError) {
    throw new Error(`There are "${cmd}" commands in the files`)
  }
}

async function hasDebugCommands(cmd) {
  await hasDebugCommand('debug.counter')
  await hasDebugCommand('debug.breakAt')
}

console.time('tests time')

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let FAST = false
let FAST_2 = false
let FAST_3 = false

const args = process.argv.slice(2);
if (args.includes("--fast")) {
  FAST = true
}
if (args.includes("--fast2")) {
  FAST_2 = true
  FAST = true
}
if (args.includes("--fast3")) {
  FAST_3 = true
}

const tests = []
const retrains = []
tests.push(`npm run test`)
tests.push(`npm run lint`)
for (let file of package_json.files) {
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
  if (file.includes("_helper")) {
    continue
  }
  if (FAST_2 && (file.includes("drone") || file.includes('fastfood'))) {
    continue
  }
  if (FAST_3) {
    if (file.includes('crew') || file.includes('emotions') || file.includes('ordering') || file.includes('can')) {
    } else {
      continue
    }
  }
  retrains.push(`node ${file} -rtf -g`)
  tests.push(`node ${file} -tva -g`)
  if (!FAST) {
    tests.push(`node tester -m ${file} -tva -tmn ${file} -g`)
  }
  // tests.push(`node tester_rebuild -m ${file}`)
}

// tests = [tests[0]]

async function loop(tests, atEnd, failed) {
  if (tests.length == []) {
    if (failed.length > 0) {
      console.log("FAILED Tests", JSON.stringify(failed, null, 2))
    } else {
      await atEnd()
    }
    console.timeEnd('tests time')
    // for (let i = 0; i < 7; ++i) {
    //   console.log('\u0007')
    //   await sleep(1000)
    // }
    exec('/home/dev/bin/ding');
    return
  }
  const test = tests.shift()
  console.log("Doing", test)
  await exec(test,
    async (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
          console.log(`exec error: ${error}`);
          failed.push(test)
      } else if (stdout.includes('ERROR')) {
          failed.push(test)
      }
      await loop(tests, atEnd, failed)
    });
}

(async () => {
  await loop(retrains.concat(tests), () => hasDebugCommands(), []).catch((e) => {
    console.log(e.toString())
  })
})()

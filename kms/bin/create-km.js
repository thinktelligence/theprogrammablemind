#! /usr/bin/env node

if (process.argv.length < 3) {
  console.log('usage "npx create-km <kmName>"')
  process.exit(-1)
}

const kmName = process.argv[2]

writeFileSync(`${kmName}.instance.json`, '{}')
writeFileSync(`${kmName}.test.json`, '{}')
writeFileSync(`${kmName}.js`, '{}')

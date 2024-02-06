const tpm = require('./common/runtime').theprogrammablemind
const animals = require('./common/animals');
const avatar = require('./common/avatar');
const characters = require('./common/characters');
const crew = require('./common/crew');
const comparable = require('./common/comparable');
const currency = require('./common/currency');
const dialogues = require('./common/dialogues');
const dimension = require('./common/dimension');
const formulas = require('./common/formulas');
const gdefaults = require('./common/gdefaults');
const help = require('./common/help');
const hierarchy = require('./common/hierarchy');
const javascript = require('./common/javascript');
const kirk = require('./common/kirk');
const meta = require('./common/meta');
const numbers = require('./common/numbers');
const people = require('./common/people');
const pos = require('./common/pos');
const ordering = require('./common/ordering');
const properties = require('./common/properties');
const countable = require('./common/countable');
const pipboyTemplate = require('./common/pipboyTemplate');
const pipboy = require('./common/pipboy');
const reports = require('./common/reports');
const scorekeeper = require('./common/scorekeeper');
const spock = require('./common/spock');
const stgame = require('./common/stgame');
const stm = require('./common/stm');
const tell = require('./common/tell');
const time = require('./common/time');
const ui = require('./common/ui');

module.exports = { 
  Config: tpm.Config,
  animals,
  avatar,
  characters,
  countable,
  crew,
  comparable,
  currency,
  dialogues,
  dimension,
  formulas,
  gdefaults,
  help,
  hierarchy,
  javascript,
  kirk,
  meta,
  numbers,
  ordering,
  properties,
  pipboyTemplate,
  pipboy,
  reports,
  pos,
  scorekeeper,
  spock,
  stgame,
  stm,
  tell,
  time,
  ui,
}

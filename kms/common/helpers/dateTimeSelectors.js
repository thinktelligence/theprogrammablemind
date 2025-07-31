const pluralize = require('pluralize')
const deepEqual = require('deep-equal')
const { chooseNumber, zip } = require('../helpers.js')
const { compose, translationMapping, translationMappingToInstantiatorMappings } = require('./meta.js')

function getNextDayOfWeek(date, targetDay) {
  const dayMap = {
    'sunday_dates': 0,
    'monday_dates': 1,
    'tuesday_dates': 2,
    'wednesday_dates': 3,
    'thursday_dates': 4,
    'friday_dates': 5,
    'saturday_dates': 6
  };

  const targetDayNum = dayMap[targetDay.toLowerCase()]
  if (!targetDayNum) {
    return
  }
  const currentDay = date.getDay();

  let daysUntilNext = targetDayNum - currentDay;
  if (daysUntilNext <= 0) {
    daysUntilNext += 7; // If target day is today or past, get next week's occurrence
  }

  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + daysUntilNext);
  return nextDate;
}

instantiate = (now, context) => {
  if (context.dateTimeSelector) {
    const dateTimeSelector = getNextDayOfWeek(now, context.dateTimeSelector?.value)
    if (dateTimeSelector) {
      return dateTimeSelector.toISOString()
    }
  }
}

until = (time) => {
}

module.exports = {
  instantiate,
  until,
}

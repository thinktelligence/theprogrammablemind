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

function getTime(time) {
  let hour = 0
  const minute = 0
  const second = 0
  let hour_offset = 0
  if (time.time.ampm.ampm == 'pm') {
    hour_offset = 12
  }
  if (time.marker == 'integer') {
    hour = time.value
  } else if (time.marker == 'atTime') {
    hour = time.time.value
  }
  hour += hour_offset
  return { hour, minute, second }
}

instantiate = (now, context) => {
  if (context.dateTimeSelector) {
    const dateTimeSelector = getNextDayOfWeek(now, context.dateTimeSelector?.value)
    if (dateTimeSelector) {
      return dateTimeSelector.toISOString()
    }
  } else if (context.marker == 'dateTimeSelector') {
    // (on date) OR (date)
    const date = context.date?.date || context.date
    const dateTimeSelector = getNextDayOfWeek(now, date.value)
    const hms = getTime(context.time)
    dateTimeSelector.setHours(hms.hour)
    dateTimeSelector.setMinutes(hms.minute)
    dateTimeSelector.setSeconds(hms.second)
    dateTimeSelector.setMilliseconds(0)
    return dateTimeSelector.toISOString()
  }
}

until = (time) => {
}

module.exports = {
  instantiate,
  until,
}

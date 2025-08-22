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

function toMonthNumber(value) {
  const map = {
    "jan_dates": 1,
    "feb_dates": 2,
    "mar_dates": 3,
    "apr_dates": 4,
    "may_dates": 5,
    "jun_dates": 6,
    "jul_dates": 7,
    "aug_dates": 8,
    "sept_dates": 9,
    "oct_dates": 10,
    "nov_dates": 11,
    "dec_dates": 12,
    "january_dates": 1,
    "february_dates": 2,
    "march_dates": 3,
    "april_dates": 4,
    "june_dates": 6,
    "july_dates": 7,
    "august_dates": 8,
    "september_dates": 9,
    "october_dates": 10,
    "november_dates": 11,
    "december_dates": 12,
  }
  return map[value]
}

function getTime(time) {
  let hour = 0
  const minute = 0
  const second = 0
  let hour_offset = 0
  if (time.time?.ampm?.ampm == 'pm') {
    hour_offset = 12
  }
  if (time.marker == 'integer') {
    hour = time.value
  } else if (time.marker == 'atTime') {
    hour = time.time.value
  }
  hour += hour_offset
  if (time.hour) {
    hour = time.hour
  }
  if (time.second) {
    second = time.second
  }
  if (time.minute) {
    minute = time.minute
  }
  return { hour, minute, second }
}

instantiate = (isA, now, context) => {
  const getType = (context, type) => {
    if (context.marker == 'onDate_dates' && context.date?.marker == type) {
      return context.date
    } if (context.marker == type) {
      return context
    }
  }
  let value
  if (value = getType(context, 'monthDay_dates')) {
    const day = value.day.value;
    const month = toMonthNumber(value.month.value);
    const currentMonth = now.getMonth() + 1; // 1-based (January = 1)
    const currentYear = now.getFullYear();
    const year = currentMonth >= month ? currentYear + 1 : currentYear;
    const date = new Date(year, month-1, day)
    return date.toISOString()
  } else if (value = getType(context, 'monthDayYear_dates')) {
    const day = value.day.value;
    const month = toMonthNumber(value.month.value);
    const year = value.year.value;
    const date = new Date(year, month-1, day)
    return date.toISOString()
  } else if (isA(context?.marker, 'dateTimeSelector')) {
    // (on date) OR (date)
    const date = context.date?.date || context.date
    const dateTimeSelector = getNextDayOfWeek(now, date.value)
    const time = context.time || context.defaultTime
    if (time) {
      const hms = getTime(time)
      dateTimeSelector.setHours(hms.hour)
      dateTimeSelector.setMinutes(hms.minute)
      dateTimeSelector.setSeconds(hms.second)
      dateTimeSelector.setMilliseconds(0)
    }
    return dateTimeSelector.toISOString()
  } else if (context.dateTimeSelector) {
    const dateTimeSelector = getNextDayOfWeek(now, context.dateTimeSelector?.value)
    if (dateTimeSelector) {
      return dateTimeSelector.toISOString()
    }
  } else if (context.value) {
    const dateTimeSelector = getNextDayOfWeek(now, context.value)
    if (dateTimeSelector) {
      return dateTimeSelector.toISOString()
    }
  }
}

// function getNthDayOfMonth(dayName, ordinal, monthName, year = new Date().getFullYear()) {
function getNthDayOfMonth(dayName, ordinal, monthName, now) {
  // Validate inputs
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  let year = now.getFullYear()

  dayName = dayName.toLowerCase();
  monthName = monthName.toLowerCase();

  if (!days.includes(dayName)) throw new Error('Invalid day name');
  if (!months.includes(monthName)) throw new Error('Invalid month name');
  if (!Number.isInteger(ordinal) || ordinal < 1 || ordinal > 5) throw new Error('Ordinal must be an integer between 1 and 5');

  const monthIndex = months.indexOf(monthName);
  if (monthIndex <= now.getMonth()) {
    year += 1
  }
  const targetDayIndex = days.indexOf(dayName);

  const date = new Date(year, monthIndex, 1);

  while (date.getDay() !== targetDayIndex) {
    date.setDate(date.getDate() + 1);
  }

  date.setDate(date.getDate() + (ordinal - 1) * 7);

  if (date.getMonth() !== monthIndex) {
    throw new Error(`The ${ordinal}th ${dayName} does not exist in ${monthName} ${year}`);
  }

  return date.toISOString();
}

until = (time) => {
}

module.exports = {
  instantiate,
  until,
  getNthDayOfMonth,
}

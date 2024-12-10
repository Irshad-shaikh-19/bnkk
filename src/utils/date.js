// const concateDate = function (date) {
//   return {
//     $dateToString: {
//       format: '%d-%m-%Y %H:%M',
//       date: date,
//       timezone: 'UTC',
//     },
//   };
// };

// module.exports = {
//   concateDate,
// };
const concateDate = function (date) {
  return {
    $dateToString: {
      format: '%d-%m-%Y %H:%M',
      date: date,
      timezone: '+05:30', // Indian Standard Time
    },
  };
};

module.exports = {
  concateDate,
};

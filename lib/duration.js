module.exports = duration;

function duration(seconds) {
  var date = new Date(0);
  date.setSeconds(date.getSeconds() + seconds);
  return date.toISOString().slice(11, 11+8).replace(/^00:/, '');
}

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { USERDATA } = require('./usertable_schema.js');
function throw_promise_error(error) {
  return new Promise(function(resolve, reject) {
    reject(error);
  });
}


function getUserDetails(userId) {
  console.log("getuserdetails function called with argument " + userId);
  return new Promise(function(resolve, reject) {
    var query = { _id: userId };
    mongoose.model.USERDATA.findOne(query, function(err, doc) { 
      if (err)
      {
      console.log("no records found for id" + userId); 
      reject(err);
      }
      else 
      {
        console.log(doc);
        resolve(doc);
      } 
    }); 
  });
}
function formatOutput(doc, limit, to, from) {
  var output = { _id: doc._id, username: doc.username };
  var logs = doc.exercise.slice();
  var filteredLogs = [];
  //deep clone each object
  for (var i in logs) {
    var date = new Date(logs[i].date);
    var log = {
      description: logs[i].description,
      duration: logs[i].duration,
      date: date.toDateString()
    };
    if (typeof from !== "undefined") {
      output.from = from;
    }
    if (typeof to !== "undefined") {
      output.to = to;
    }
    if (
      (typeof to === "undefined" && typeof from === "undefined") ||
      (typeof to !== "undefined" &&
        new Date(to) > date &&
        typeof to === "undefined") ||
      (typeof from !== "undefined" &&
        new Date(from) < date &&
        typeof to === "undefined") ||
      (typeof from !== "undefined" &&
        new Date(from) < date &&
        typeof to !== "undefined" &&
        new Date(to) > date)
    ) {
      filteredLogs.push(log);
    }
    console.log(i);
  }
  console.log(logs);
  if (typeof limit !== "undefined") filteredLogs = filteredLogs.slice(0, limit);
  output.count = filteredLogs.length;
  output.log = filteredLogs;
  return output;
}

module.exports = {
  throw_promise_error: throw_promise_error,
  getUserDetails: getUserDetails,
  formatOutput: formatOutput
};
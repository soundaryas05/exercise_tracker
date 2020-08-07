const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var exerciseSchema = new Schema({
  username:{type:String,required:true,},
  description:{type:String,required:true},
  duration:{type:Number,required:true},
  date:{type:Date,required:false}
})

var userSchema = new Schema({
  username:{type:String,unique:true},
  exercise:{type:[exerciseSchema],required:false}
})
var USERDATA = mongoose.model('USERDATA',userSchema)

module.exports.USERDATA = USERDATA;
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const crypto = require('crypto');
const cors = require('cors')
const { USERDATA } = require('./usertable_schema.js');
const { Exercisetable } = require('./exercisetable_schema.js');
const mongoose = require('mongoose')
const mongooseConfig = require('./mongoose_myconfig.js');
//mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/exercise-track' );
var MongoClient = require('mongodb').MongoClient;




app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors()); 

//DB connection part
mongoose.connect(process.env.MONGO_URI, mongooseConfig);

const db = mongoose.connection;

db.on('error', err => console.error('connection error:${err}'));
 
db.once('open', () => console.log('db connection successful'));
 //End of db connection part
 
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

 
   app.post('/api/exercise/new-user',(req,res,next)=> {
     
     var userName = req.body.username
     var userdata = new USERDATA ({
       username : userName
     });
     userdata.save((err, data) => {
       if(err){
         console.log('error in saving the data');
         USERDATA.findOne({username: userName}).then(result=>{
           res.send('username is not available');
         });
       }else{
         res.json({
           usename:userdata.username, _id:userdata._id
         });
       }
     });
   });

app.post('/api/exercise/add',(req,res,next)=>{
  USERDATA.findById(req.body.userId).then(result=>{
    req.username = result.username
    var exercise = {
      username:req.username,
      description:req.body.description,
      duration:req.body.duration,
      date:req.body.date||new Date(),
      _id:req.body.userId
    }
    result.exercise.push(exercise)
    result.save()
    res.send(exercise)
  });
});


app.get('/api/exercise/user',(req,res,next)=>{
  USERDATA.find({}).then(result => {
    res.send(result)
  });
});

/*
app.get('/api/exercise/log?', (req,res,next)=>{
  req.userId = req.query.userId
  USERDATA.findById(req.userId).then(record => {
    res.send(record.exercise)
  });
});
*/ 
app.get('/api/exercise/log', (req, res, next) => {
  const { userId, from, to, limit } = req.query;
  const dateValidation = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
  const fromString = (from && dateValidation.test(from)) ? new Date(from.replace('-', ',')).toDateString() : undefined;
  const toString = to ? new Date(to.replace('-', ',')).toDateString() : undefined;
  if (!userId) res.send('UserId Required');
  USERDATA.findOne({ _id: userId }, (err, user) => {
    if (err) next(err);
    let { _id, username, log } = user;
    switch (user) {
      case from:
        log = log.filter(exercise => { 
          new Date(exercise.date) >= new Date(from); 
        });
      case to:
        log = log.filter(exercise => { 
          new Date(exercise.date) <= new Date(to); 
        });
      case limit:
        log = log.slice(0, limit);
        break;
      default:
        return res.send('Unknown UserId');
    }
    res.status(201).json({ _id, username, from: fromString, to: toString, count: log.length, log });
  });
});

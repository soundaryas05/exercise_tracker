const express = require('express')
const app = express() 
const bodyParser = require('body-parser')
const crypto = require('crypto');
const cors = require('cors')
const moment = require('moment');
const { USERDATA } = require('./usertable_schema.js');
//const { Exercisetable } = require('./exercisetable_schema.js');
const mongoose = require('mongoose')
const mongooseConfig = require('./mongoose_myconfig.js');
//mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/exercise-track' );
var MongoClient = require('mongodb').MongoClient;


  const controller = require("./logs_module");
 
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


app.get('/api/exercise/users',(req,res,next)=>{
  USERDATA.find({}).then(result => {
    res.send(result)
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

app.get("/api/exercise/log", function(req, res) {
  console.log(req.query.userId);
  console.log(req.query.from);
  console.log(req.query.to);
  console.log(req.query.limit);
  //console.log(req.query);
  /*var promise = controller.getUserDetails(req.query.userId);
  
  /*promise
    .then(function(data) {
      return res.json(
        controller.formatOutput(
          data,
          req.query.limit,
          req.query.to,
          req.query.from
        )
      );
    })
    .catch(function(reason) {
      return res.json(reason);
    });*/
  
  let { userId, from, to, limit } = req.query;
      //from = moment(from, 'YYYY-MM-DD').isValid() ? moment(from, 'YYYY-MM-DD') : 0;
    //to = moment(to, 'YYYY-MM-DD').isValid() ? moment(to, 'YYYY-MM-DD') : moment().add(1000000000000);
  from = moment(from).format('YYYY-MM-DD[T00:00:00.000Z]');
  to = moment(to).format('YYYY-MM-DD[T00:00:00.000Z]');
  console.log(to);
  console.log(from);
  USERDATA.findById(userId).then(user =>
  {
    if (!user) throw new Error('Unknown user with _id');
    else
      { 
        console.log("user found");
        console.log("Searching for exercise records");
        console.log(user.exercise);
        
         USERDATA.find({ userId })
        .where('date').gte(from).lte(to)
        .limit(+limit).exec()
        .then(resultt => console.log(resultt))           
        
        
        USERDATA.find({userId})
        .where('date').gte(from).lte(to)
        .limit(+limit).exec()
        .then(logg => res.status(200).send({
        _id: userId,
        username: user.username,
        count: logg.length,
        log: logg.map(o => ({
        description: o.description,
        duration: o.duration,
        date: moment(o).format('ddd MMMM DD YYYY')
        }))
        }))         
      }
      })
  .catch(err => {
            console.log(err);
            res.status(500).send(err.message);
        })
});        


/*
app.get('/api/exercise/log?', (req,res,next)=>{
  req.userId = req.query.userId
  USERDATA.findById(req.userId).then(record => {
    res.send(record.exercise)
  });
});

app.get('/api/exercise/log?', (req, res, next) => {
  const userId = req.query.userId;
  //duration: parseInt(duration)
  console.log(userId);
  res.status(201).json({bodyparseroutput:req.query.userId,variableoutput: userId});
  //const { usersId, from, to, limit } = req.body;
  //const dateValidation = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
  //const fromString = (from && dateValidation.test(from)) ? new Date(from.replace('-', ',')).toDateString() : undefined;
  //const toString = to ? new Date(to.replace('-', ',')).toDateString() : undefined;
  //console.log(userId,fromString,toString,limit);
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
});*/

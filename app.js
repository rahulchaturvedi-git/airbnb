// Core Module
const path = require('path');

// External Module
const express = require('express');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');
const  {default: mongoose} = require('mongoose');

const DB_PATH = "mongodb+srv://root:roooot@completecoding.zdj3ny3.mongodb.net/airnb?retryWrites=true&w=majority&appName=CompleteCoding";

const store = new mongoDBStore({
  uri: DB_PATH,
  collection: 'sessions'
});



//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
//const db = require("./utils/databaseUtil");
//const {mongoConnect} = require('./utils/databaseUtil');
const { resourceUsage } = require('process');

// db.execute('SELECT * FROM homes').then(([rows, feilds]) => {
//   console.log('Getting from DB, ', rows);
// })
//  .catch(error => {
//   console.log('Error getting from DB, ', error);
//  });

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const randomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) * '-' + file.originalname);
  }  
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg"){
    cb(null, true);
  }
  else{
    cb(null, false);
  }
}

const multerOptions = {
  storage, fileFilter
};

app.use(express.urlencoded({ extended: true }));
app.use(multer(multerOptions).single('photo'));
app.use(express.static(path.join(rootDir, 'public')))
app.use('/uploads',express.static(path.join(rootDir, "uploads")));
app.use('/host/uploads',express.static(path.join(rootDir, "uploads")));
app.use('/homes/uploads',express.static(path.join(rootDir, "uploads")));

app.use(express.json());

app.use(session({
  secret: "Knowledge AI is the future",
  resave: false,
  saveUninitialized: true,
  store
}))

app.use((req,res,next) => {
  // console.log("Session check middleware");
  req.isLoggedIn = req.session.isLoggedIn || false;
  //console.log("isLoggedIn:", req.isLoggedIn);
  next();
});

app.use(authRouter);
app.use(storeRouter);
app.use("/host", (req,res,next) => {
  if(!req.isLoggedIn){
    return res.redirect("/login");
  }
  next();
});
app.use("/host", hostRouter);



app.use(errorsController.pageNotFound);

const PORT = 3003;

mongoose.connect(DB_PATH).then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });
}).catch(err => {
  console.log("Error while connecting to MongoDB with Mongoose", err);
})

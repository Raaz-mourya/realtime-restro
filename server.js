require("dotenv").config();
const express = require("express");
const app = express();

const ejs = require("ejs");
const path = require("path");
const expressLayout = require("express-ejs-layouts");

const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const MongoDbStore = require("connect-mongo");
const passport = require("passport");

mongoose.set("strictQuery", false); // to hide special warning
//Database connection
const url = "mongodb://localhost:27017/pizza";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection
  .once("open", function () {
    console.log("Database connected...");
  })
  .on("error", function (err) {
    console.log("Connection failed..." + err);
  });


//session store
let mongoStore = new MongoDbStore({
  mongoUrl: url,
  collection: "sessions",
});

//session config
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, //24 hours
  })
);

// Passport config

const passportInit = require("./app/config/passport");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());



app.use(flash());

//Asset
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user;
  next();
});

//set template engine
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

require("./routes/web")(app);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

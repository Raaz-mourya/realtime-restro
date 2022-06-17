// require('dotenv').config()
const express = require('express')
const app = express()

const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')

const PORT = process.env.PORT || 3000
const mongoose = require('mongoose')
const session = require('express-session')
// const flash = require('express-flash')
// const MongoDbStore = require('connect-mongo')(session)
// before this run command
// yarn add express-flash
// yarn add connect-mongo





//Database connection
const url = 'mongodb://localhost/pizza';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true});
const connection = mongoose.connection;
connection.once('open', function () {
    console.log('Database connected...');
}).on('error', function (err) {
    console.log('Connection failed...'+err)
});

// Session store
// let mongoStore = new MongoDbStore({
//                mongooseConnection: connection,
//                collection: 'session'
// })
//session config
// app.use(session({
//     secret: process.env.COOKIE_SECRET,
//     resave: false,
//     store: mongoStore,
//     saveUninitialized: false,
//     cookie: {maxAge:1000 * 60 * 60 * 24 }
// }))

//asset
app.use(express.static('public'))



//set template engine
app.use(expressLayout)
app.set('views',path.join(__dirname, '/resources/views'))
app.set('view engine','ejs')

require('./routes/web')(app)


app.listen(PORT , () => {
    console.log(`Listening on port ${PORT}`)
})
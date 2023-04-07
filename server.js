const express = require('express');
const userRoutes = require("./user/routes")
const packageRoutes = require("./package/routes")
const app = express();
const session = require('express-session');
const flash = require('express-flash');
const passport = require("passport");
const initializePassport = require("./passportConfig")
initializePassport(passport)

app.set('view engine', 'ejs')
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize())
app.use(passport.session())
app.use(flash());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"))
app.use('/public/css/', express.static('./public/css'));
app.use(express.urlencoded({ extended: false }));
app.listen(7000);
app.use('/TraceBox', packageRoutes);
app.use('/TraceBox', userRoutes );
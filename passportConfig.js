const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { findMyEmail, findAccountById } = require("./db/queriesUser");

function initialize(passport) {

  const authenticateUser = async (email, password, done) => {
    
    const emailUser = await findMyEmail(email);
    
     if(emailUser) {
        bcrypt.compare(password, emailUser.password, (err, isMatch) => {
          if (err) {
            throw err;
          }
          if (isMatch) {
            return done(null, emailUser);
          } else {
            return done(null, false, { message: "The password is not correct" });
          }
        });
      } else {
        return done(null, false, { message: "Email does not exist" });
      }
  }
  
  passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
  },
    authenticateUser
  ));
  
  passport.serializeUser((emailUser, done) => done(null, emailUser.id)); // cookie de sesiune

  passport.deserializeUser(async (id, done) => { // id-ul sesiune pentru a naviga
    try {
      const user = await findAccountById(id);
      return done(null, user);
    } catch (err) {
      throw err
    }
  });
}

module.exports = initialize; 

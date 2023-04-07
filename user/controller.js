const bcrypt = require("bcrypt");
const passport = require('passport');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { updateAccountPassword, findResetToken ,newAccount, findMyEmail, deleteExpiredResetToken, markResetTokenAsUsed, createResetToken } = require('../db/queriesUser');

const getHomePage = async (req, res) => {
  try {
  if (req.user) {
    res.render("user/index.ejs", { user: req.user.name, email: req.user.email })
  } else {
    res.render("user/index.ejs", { user: undefined })
  }
  } catch (err) {
  res.status(500).send("An error occurred while rendering the homepage")
  } 
}

const getLoginPage = async (req, res) => {
  try {
  res.render("user/login.ejs")
  } catch(err) {
    res.status(500).send("An error occurred while rendering the login page")
  }
}

const getRegisterPage = async (req, res) => {
  try {
  res.render("user/register.ejs")
  } catch(err) {
    res.status(500).send("An error occurred while rendering the register page")
  }
}

const getResetPasswordPage = async (req, res) => {
  try {
  res.render("user/resetPassword.ejs");
  } catch(err) {
    res.status(500).send("An error occurred while rendering the reset password page");
  }
}

const checkResetPassword = async (req, res) => {
    const { email } = req.body;
    try {
    if (!email) {
      req.flash('msg', 'Fill in the field to search for your account');
      return res.render('user/resetPassword');
    }
    const user = await findMyEmail(email);
    if (!user) {
      req.flash('msg', "Email doesn't exist");
      return res.render('user/resetPassword');
    }
    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);
    await createResetToken(token, user.id, expiresAt);
    const mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'paul.bunduc00@gmail.com',
        pass: 'moeryctkkxtgsbqg',
      },
    });
    const mailDetails = {
      from: 'TraceBox',
      to: email,
      subject: 'TraceBox password change request',
      html: `We have received a password change request for your TraceBox account. If you did not ask to change your password, then you can ignore this email and your password will not be changed. The link below will remain active for 3 hours.<br><br>` +
        `<a href="http://localhost:7000/TraceBox/reset-password/${token}"><button type="button" style="background-color: white; border-color:black; color:black; border-radius: 40px" class="btn btn-outline-danger">Reset password</button></a>`,
    };
    await mailTransporter.sendMail(mailDetails);
    res.render('user/emailSent', { email: email });
  } catch (err) {
    req.flash('msg', 'An error occurred while processing your request');
    return res.render('user/resetPassword');
  }
};

const verifyToken = async (req, res) => {
  const token = req.params.token;
  try {
    await removeExpiredTokens();
    const result = await findResetToken(token);
    if (result && !result.used) {
      await markResetTokenAsUsed(token); 
      return res.render("user/reset-password", { token: token });
    } else {
      res.status(500).send("The link you accessed is no longer valid or has already been used.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("The link you accessed is not valid");
  }
};

const removeExpiredTokens = async () => {
  try {
    const currentDate = new Date();
    await deleteExpiredResetToken(currentDate)
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const validatePassword = (password, password2) => {
  const errors = [];
  let validPass = true;
  if (!password || !password2) {
    errors.push({ message: "Complete all the fields" });
  } else {
    if (password.length < 8) {
      errors.push({ message: "Password must be at least 8 characters long" });
      validPass = false;
    }
    if (!password.match(/^(?=.*[A-Z])(?=.*\d)/)) {
      errors.push({ message: "Password must contain at least one capital letter and one number" });
      validPass = false;
    }
    if  (password !== password2 && validPass) {
      errors.push({ message: "Passwords do not match" });
    }
  }
  return errors;
}

const reqPass = async (req, res) => {
  const { token, password, password2 } = req.body;
  try {
    const errors = validatePassword(password, password2);
    console.log(errors);
    if (errors.length > 0) {
      return res.render("user/reset-password", { token: token , errors });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const queryResult = findResetToken(token);
      const id = queryResult.user_id;
      await updateAccountPassword(hashedPassword, id);
      res.render("user/successfulPasswordReset");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred in the password reset process.");
  }
}

const reqBody = async (req, res) => {
  const { name, email, password, password2 } = req.body;
  const errors =[];
  try {
    const errors = validatePassword(password, password2);
    if (!name.match(/^[a-zA-Z]+$/)) {
      errors.push({ message: "The name must contain only letters" });
    }
    if (errors.length > 0) {
      return res.render("user/register", { errors });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await findMyEmail(email)
    if (result) {
      errors.push({ message: "Email already registered" });
      return res.render("user/register", { errors });
    }
    await newAccount (name, email, hashedPassword);
    req.flash('msg', `You have been successfully registered.`)
    res.redirect("/TraceBox/login");
  } catch (err) {
    errors.push({ message: "An error occurred, please try again later." });
    return res.render("user/register", { errors });
  }
};

const checkLogin =
  passport.authenticate("local", {
    successRedirect: "/TraceBox/HomePage",
    failureRedirect: "/TraceBox/login",
    failureFlash: true
  });

const logout = (req, res) => {
  req.logOut((err) => {
    if (err) {
      throw err
    }
    req.flash("msg", "You've been logged out");
    res.redirect('/TraceBox/login')
  });
}

const checkAutheticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/TraceBox/HomePage")
  }
  next();
}

const checkNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('msg', `Please log in before accessing the page`)
  res.redirect("/TraceBox/login");
}

const getProfile = (req, res) => {
  res.render("user/profile.ejs", { user: req.user.name, email: req.user.email })
}

module.exports = {
  getHomePage,
  getLoginPage,
  getRegisterPage,
  reqBody,
  checkLogin,
  logout,
  checkAutheticated,
  checkNotAuthenticated,
  getProfile,
  getResetPasswordPage,
  checkResetPassword,
  verifyToken,
  reqPass,
}
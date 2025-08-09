const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    editing: false,
    isLoggedIn: req.isLoggedIn,
    errors: [],
    oldInput: {email: '',},
    user: {},
  });
};

exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "signup",
    currentPage: "signup",
    isLoggedIn: req.isLoggedIn,
    errors: [],
    oldInput: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirm_password: '',
      userType: ''
    },
    user: {},
  });
};

exports.postSignup = [
    // First Name validation
  check('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters'),

  // Last Name validation
  check('lastName')
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Last name can only contain alphabets'),

  // Email validation
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),

  // Password validation
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[@$!%*#?&]/)
    .withMessage('Password must contain at least one special character')
    .trim(),

  // Confirm password validation
  check('confirmPassword')
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  // User Type validation
  check('userType')
    .notEmpty()
    .withMessage('User type is required')
    .isIn(['guest', 'host'])
    .withMessage('Invalid user type'),

  // Terms and Conditions
  check('terms')
    .notEmpty()
    .withMessage('You must accept the terms and conditions')
    .custom((value , {req}) => {
      if (value !== 'on') {
        throw new Error('You must accept the terms and conditions');
      }
      return true;
    }),
  

  (req, res, next) => {
    const {firstName, lastName, email, password, userType} = req.body;
    const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "signup",
      currentPage: "signup",
      isLoggedIn: false,
      errors: errors.array().map(err => err.msg),
      oldInput: {firstName,lastName,email,password, userType},
      user: {},
    });
  }

 bcrypt.hash(password, 12)
 .then(hashedPassword => {
  const user = new User({firstName, lastName, email, password: hashedPassword, userType});
  return user.save();
})
.then(() => {
  res.redirect("/login");
})
.catch(err => {
  return res.status(422).render("auth/signup", {
    pageTitle: "Signup",
    currentPage: "signup",
    isLoggedIn: false,
    errors: [err.message],
    oldInput: {firstName, lastName, email, userType},
    user: {},
  });
});


  }
  ];


exports.postLogin = async (req, res, next) => {
  const {email, password} = req.body;
  const user = await User.findOne({email});
  if(!user){
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      editing: false,
      isLoggedIn: false,
      errors: ['User does not exist'],
      oldInput: {email, password},
      user: {},
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch){
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ['Invalid password'],
      oldInput: {email, password},
      user: {},
    });
  }

  //console.log(req.body);
  req.session.isLoggedIn = true;
  req.session.user = user;
  res.redirect("/");
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  })
}
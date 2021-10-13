const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const db = require('../database')
const helpers = require('../lib/helpers')

// Authentification
// Login
passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    console.log(req.body)
    const rows = await db.query('SELECT * FROM users WHERE username = ?', [username])
    if(rows.length > 0){
        const user = rows[0]
        // pwd validation
        const validPWD = await helpers.matchPassword(password, user.password)
        if(validPWD) {
            done(null, user, req.flash('success', 'Welcome ' + user.username))
        } else {
            done(null, false, req.flash('message', 'Incorrect password...'))
        }
    } else {
        return done(null, false, req.flash('message', 'The Username does not exists...'))
    }
}))

// Sign Up
passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {

    // Register new User
    const { email, role} = req.body
    const newUser = {
        username,
        role,
        password,
        email
    }
    // CHECK FOR USER
    const rows = await db.query('SELECT * FROM users WHERE username = ?', [username])
    if(rows.length <= 0) {
        newUser.password = await helpers.encryptPassword(password) // Encrypt the pwd

        const result = await db.query('INSERT INTO users SET ?', [newUser])
        newUser.id = result.insertId
        return done(null, newUser)
    }else {
        return done(null, false, req.flash('message', 'This username is already in use...'))
    }
}))

passport.serializeUser((user, done) => {
    return done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const rows = await db.query('SELECT * FROM users WHERE id = ?', [id])
    return done(null, rows[0])
})

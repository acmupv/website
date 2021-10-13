const express = require('express')
const router = express.Router()
const passport = require('passport')
const pool = require('../database')
const helpers = require('../lib/helpers') // Possibly wrong
const { isLoggedIn, isAuthenticatedAdmin, isNotLoggedIn } = require('../lib/auth')


// Main route
router.get('/signup', isAuthenticatedAdmin,(req, res) => { //isNotAdmin
    res.render('auth/signup')
})

router.get('/signin', isNotLoggedIn, (req, res) => {
    res.render('auth/signin')
})

// Create an Admin Account
router.post('/signup', isAuthenticatedAdmin, passport.authenticate('local.signup', { //isNotAdmin
    successRedirect: '/profile', // /profile
    failureRedirect: '/signup',
    failureFlash: true
}))

router.post('/signin', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local.signin', {
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true
    })(req, res, next)
})

router.get('/profile', isLoggedIn, async (req, res) => {
    const posts = await pool.query('SELECT * FROM posts WHERE (user_id = ? AND deleted = "1") ORDER BY id DESC', [req.user.id])
    res.render('profile', {posts: posts})
})

router.get('/logout', isLoggedIn, (req, res) => {
    req.logOut()
    res.redirect('/signin')
})
module.exports = router
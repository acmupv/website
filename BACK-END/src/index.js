const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const path = require('path')
const flash = require('connect-flash')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')
const passport = require('passport')

const { isLoggedIn, isAuthenticatedAdmin , isAuthenticatedCollaborator} = require('./lib/auth')
const helpers = require('./lib/helpers') // Possibly wrong
const { database } = require('./keys')

const pool = require('./database')
const app = express()
//files
const expressFileUpload = require('express-fileupload')

// Initializations
require('./lib/passport')

// Settings
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars.js'),
    insecureAuth : true
}))
app.set('view engine', '.hbs')


// Middlewares
// Uploading files
app.use(expressFileUpload({
    createParentPath: true,
    limits: {
        fileSize: 2 * 1024 * 1024 * 1024
    }
}))

//end upload
app.use(session({
    secret: 'sessionacm',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}))

app.use(flash())
app.use(morgan('dev'))
app.use(express.urlencoded({extended: false})) // Only admits plain text, not images
app.use(express.json())

app.use(passport.initialize())
app.use(passport.session())




// Global variables
app.use((req, res, next) => {
    app.locals.success = req.flash('success')
    app.locals.message = req.flash('message')
    // User info
    app.locals.user = req.user

    next()
})

// Routes
app.use(require('./routes/index'))
app.use(require('./routes/auth'))

// Link to POST section
app.use('/posts', require('./routes/posts'))

// Public (all the code that the browser can use)
app.use(express.static(path.join(__dirname, 'public')))



// =========================================================================================================================
// POSTS CREATE AND EDIT 
// =========================================================================================================================
//upload
app.get('/create_post', isAuthenticatedAdmin, async (req, res) => {
    res.render('./new_post')
})

// ADD POST
app.post('/img', isLoggedIn, async (req, res, next) => {
    // checking req.files is empty or not
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const file = req.files.target_file
    file.mv(__dirname + '/public/uploads/'+ file.name, async (err, result) => { 
        if(err){
            res.send({
                message: 'Error!'
            })
        }else {
            const user = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id])
            var prop = 0
            var post_type = 'POST'
            // Admin or Collaborator?
            if(user[0].role == "Administrator") {
                prop = 1
                post_type = req.body.post_t
            }

            var title = req.body.title //"Tituli"
            var body = req.body.body //"bodyus"
            var url = '/uploads/'+ file.name
            //var post_type = req.body.post_t

            if(title.length > 0 & body.length > 0 & file.name.length > 0){ 
                const new_post = {
                    title,
                    body,
                    user_id: req.user.id,
                    post_type,
                    proposed: prop,
                    proposed_by: prop,
                    image_url: url 
                }
                
                await pool.query('INSERT INTO posts set ?', [new_post])
                req.flash('success', 'Post was created successfully!')
                res.status(200)
                if(user[0].role == "Administrator") {
                    res.redirect('/posts')
                }else{
                    res.redirect('/')
                }
            }else{
                req.flash('message', 'Write on title and body!')
                res.redirect('/create_post')
            } 
        }
    })
    //res.redirect('/posts') 
})

// EDIT post
app.get('/posts/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params
    const posts = await pool.query('SELECT * FROM posts WHERE id = ?', [id])
    res.render('./edit_post', {posts: posts[0]})
})

// UPDATE post
app.post('/post/edit/:id', isLoggedIn, async (req, res, next) => {
    // checking req.files is empty or not
    if (req.files && Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }
    const { id } = req.params
    //New data
    const { title, body, post_t, tg_file} = req.body
    if(req.files){
        const file = req.files.tg_file
        file.mv(__dirname + '/public/uploads/'+ file.name, async (err, result) => { 
            if(err){
                res.send({
                    message: 'Error!'
                })
            } else {
                img_url = '/uploads/'+ file.name
                const newPost = {
                    title, 
                    body,
                    post_type: post_t,
                    image_url: img_url
                }
                await pool.query('UPDATE posts SET ? WHERE id = ?', [newPost, id])
                req.flash('success', 'Post was edited successfully!')
                res.redirect('/posts')
            }
        })
    }else {
        const newPost = {
            title, 
            body,
            post_type: post_t,
        }
        await pool.query('UPDATE posts SET ? WHERE id = ?', [newPost, id])
        req.flash('success', 'Post was edited successfully!')
        res.redirect('/posts')
    }
})

// DELETE POST
app.get('/posts/delete/:id', isAuthenticatedAdmin, async (req, res) => {
    const { id } = req.params
    await pool.query('DELETE FROM posts WHERE ID = ?', [id])
    req.flash('success', 'Post was deleted successfully!')
    res.redirect('/posts')
})

app.get('/posts/to_delete/:id', isAuthenticatedAdmin, async (req, res) => {
    const { id } = req.params
    await pool.query('UPDATE posts SET deleted = "0" WHERE ID = ?', [id])
    req.flash('success', 'The post was moved to garbage successfully!')
    res.redirect('/posts')
})

app.get('/posts/revive/:id', isAuthenticatedAdmin, async (req, res) => {
    const { id } = req.params
    await pool.query('UPDATE posts SET deleted = "1" WHERE ID = ?', [id])
    req.flash('success', 'The post was resurrected successfully!')
    res.redirect('/posts')
})

app.get('/posts/delete_all', isAuthenticatedAdmin, async (req, res) => {
    const { id } = req.params
    await pool.query('DELETE FROM posts WHERE deleted = "0"')
    req.flash('success', 'Posts was deleted successfully!')
    res.redirect('/posts/deleted')
})

//upload
app.get('/propose_post', isAuthenticatedCollaborator, async (req, res) => {
    res.render('./propose_post')
})

// Proposed posts
app.get('/posts/proposed', isAuthenticatedAdmin, async (req, res) => {
    const posts = await pool.query('SELECT * FROM posts WHERE (deleted = "1" AND proposed = "0") ORDER BY id DESC')
    for(let i = 0; i < posts.length; i++){
        const user = await pool.query('SELECT * FROM users WHERE id = ?', [posts[i].user_id]) 
        posts[i].by = user[0].username
    }
    var count = posts.length
    res.render('posts/proposed_post_list', {posts: posts, count: count})
})

// Accepts the post proposal
app.get('/posts/accept_propose/:id', isAuthenticatedAdmin, async (req, res) => {
    const { id } = req.params
    await pool.query('UPDATE posts SET proposed = 1 WHERE id = ?', [id])
    // Send message to user
    /* TODO */
    res.redirect('/posts')
})


// =========================================================================================================================
// USER CREATE AND EDIT 
// =========================================================================================================================
// Update profile
app.get('/profile/edit/:id', isLoggedIn, async (req, res) => {
    const user = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id])
    res.render('edit', {user: user[0]})
})

app.post('/profile/edit/:id', isLoggedIn, async (req, res) => {
    // checking req.files is empty or not
    if (req.files && Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const { id } = req.params
    // New data
    const { name, email, password, password_r, img_profile, description} = req.body

    if(req.files){
        const file = req.files.tg_file
        file.mv(__dirname + '/public/uploads/'+ file.name, async (err, result) => { 
            if(err){
                res.send({
                    message: 'Error!'
                })
            } else {
                img_url = '/uploads/'+ file.name
                const newUser = {
                    id, 
                    password,
                    email, 
                    name,
                    description,
                    image_url: img_url
                }
                if( password == password_r){
                    if(password.length > 0) {
                        newUser.password = await helpers.encryptPassword(password)
                    }else {
                        newUser.password = req.user.password
                    }
                }else {
                    req.flash('message', 'Password missmatch...')
                    res.redirect('/profile/edit/:id')
                }
                
                await pool.query('UPDATE users SET ? WHERE id = ?', [newUser, id])
                req.flash('success', 'Your profile was edited successfully!')
                res.redirect('/profile')
            }
        })
    }else {
        if( password == password_r){
            const newUser = {
                id, 
                password,
                email, 
                name,
                description
            }
    
            if(password.length > 0) {
                newUser.password = await helpers.encryptPassword(password)
            }else {
                newUser.password = req.user.password
            }
            
            await pool.query('UPDATE users SET ? WHERE id = ?', [newUser, id])
            req.flash('success', 'Your profile was edited successfully!')
            res.redirect('/profile')
    
        }else{
            req.flash('message', 'Password missmatch...')
            res.redirect('/profile/edit/:id')
        }
    }

    /*
    if( password == password_r){
        const newUser = {
            id, 
            password,
            email, 
            name,
            description
        }

        if(password.length > 0) {
            newUser.password = await helpers.encryptPassword(password)
        }else {
            newUser.password = req.user.password
        }
        
        await pool.query('UPDATE users SET ? WHERE id = ?', [newUser, id])
        req.flash('success', 'Your profile was edited successfully!')
        res.redirect('/profile')

    }else{
        req.flash('message', 'Password missmatch...')
        res.redirect('/profile/edit/:id')
    }*/
})

// Users and Admins
app.get('/active_users', isAuthenticatedAdmin, async (req, res) => {
    const users = await pool.query('SELECT * FROM users WHERE NOT id = ?', [req.user.id])
    res.render('./admin_list', {users: users})
})

// Starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port ', app.get('port'))
})

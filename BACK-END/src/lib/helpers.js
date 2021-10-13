const db = require('../database')
const bcrypt = require('bcryptjs')
const helpers = {}

// Encrypting our passwords
helpers.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)
    const pwd_hash = await bcrypt.hash(password, salt)
    return pwd_hash
}

// Match Passwords when logging
helpers.matchPassword = async (password, DB_password) => {
    try {
        return await bcrypt.compare(password, DB_password)
    } catch (error) {
        console.log(error)
    }
}

helpers.toUsername = async (id) => {
    const user = await db.query('SELECT * FROM users WHERE id = ?', [id])
    return user[0].username
}

module.exports = helpers
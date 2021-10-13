module.exports = {
    // Permit to proove if its logged in
    isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }else{
            return res.redirect('/signin')
        }
    },

    isNotLoggedIn(req, res, next) {
        if (!req.isAuthenticated()) {
            return next()
        }else{
            return res.redirect('/profile')
        }
    },

    // Permit to use only admin methods
    isAuthenticatedAdmin(req, res, next) {
        if (req.isAuthenticated() && req.user.role == 'Administrator') {
            return next()
        }else {
            return res.redirect('/profile')
        }
    },

    // Permit to use only admin methods
    isAuthenticatedCollaborator(req, res, next) {
        if (req.isAuthenticated() && (req.user.role == 'Administrator' || req.user.role == 'Collaborator')) {
            return next()
        }else {
            return res.redirect('/profile')
        }
    }
}
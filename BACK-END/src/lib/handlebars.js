const { format } = require('timeago.js')

const helpers = {}

helpers.timeago = (timestamp) => {
    return format(timestamp)
}

// There are something new for admins
helpers.new_content = () => {

}

// filter by Administrator
helpers.is_admin = (user) => {
    if(user.role == "Administrator") {
        return `
            <li class="nav-item">
                <a class="nav-link" href="/posts">Publications</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/create_post">Publish</a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Admin Stuff <!--<span class="badge badge-secondary"> New</span>-->
                </a>
                
                <div class="dropdown-menu bg-dark" aria-labelledby="navbarDropdownMenuLink">
                    <a class="nav-link" href="/signup">Add New Profile</a>
                    <a class="nav-link" href="/posts/proposed">Proposed Posts</a>
                    <a class="nav-link" href="/posts/deleted">Deleted Posts</a>
                    <a class="nav-link" href="/active_users">Active Users</a>                   
                </div>
            </li>
            `
    }else if(user.role == "Collaborator"){
        return `
            <li class="nav-item">
                <a class="nav-link" href="/">Publications</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/propose_post">Propose Post</a>
            </li>
        `
    }else{
        return ""
    }
}

// Personal buttons for admin in profile
helpers.restrict_delete = (user) => {
    if(user == 1) {
        return `
            <div onclick="sure_about({{id}})" class="btn btn-danger">
                Delete
            </div>
        `
    }else if(user == 0){
        return ""
    }
}

// Current situation of the post
helpers.state = (post) => {
    if(post == "1") {
        return `
            <span class="badge badge-success">Published</span>
        `
    }else if(post == "0"){
        return `
            <span class="badge badge-warning">Under Review</span>
        ` 
    }
}

// Add post admin or collaborator in profile
helpers.profile_post = (role) => {
    if(role == "Administrator") {
        return `
            <a href="/create_post" class="btn btn-primary m-2">Add post</a>
        `
    }else if(role == "Collaborator"){
        return `
            <a href="/propose_post" class="btn btn-primary m-2">Propose post</a>
        ` 
    }
}

// Role text color
helpers.role_color = (role) => {
    if(role == "Administrator") {
        return `
            profile_img_admin
        `
    }else if(role == "Collaborator"){
        return `
            profile_img_collaborator
        ` 
    }
}


module.exports = helpers
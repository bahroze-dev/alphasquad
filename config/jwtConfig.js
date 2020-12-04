const expressJwt = require('express-jwt');

module.exports = jwt;

function jwt() {
    
    return expressJwt({ secret:"loli" }).unless({
        path: [
            // public routes that don't require authentication
            /^\/auth\//,
            /^\/uploads\//,
            
            
        ]
    });
}
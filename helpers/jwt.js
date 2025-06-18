const expressJwt = require('express-jwt');

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/giftrequests(.*)/, methods: ['POST','GET', 'PUT','OPTIONS'] },
            { url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS', 'POST'] },
            { url: /\/api\/v1\/users\/[^/]+$/, methods: ['PUT'] },
            { url: /\/api\/v1\/users\/address\/[^/]+$/, methods: ['GET'] },

            { url: /\/api\/v1\/users\/[^/]+$/, methods: ['GET'] },
            { url: /\/api\/v1\/users\/address\/[^/]+$/, methods: ['GET'] },


            `${api}/users/login`,
            `${api}/users/register`,
            `${api}/users/guser`,
            `${api}/users/create-order`,
            `${api}/users/save-payment`,

            // { url: /(.*)/ },
        ]
    });
}

async function isRevoked(req, payload, done) {
    if (!payload.isAdmin) {
        done(null, true);
    }

    done();
}

module.exports = authJwt;

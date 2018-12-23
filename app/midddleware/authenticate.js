/**
 * File name:   authenticate.js
 * Description: This file contains the middleware.
 *              It checks for user authentication, it is invoked everytime request comes to server.
 *              It checks if auth token provided in request is available in database.
 *              If token is valid and present in db it will add found user and token in request object,
 *              which then subsequently used by request handler.
 * Author:      Harshal Bawaskar
 */

const { User } = require('./../model/user');

const authenticate = (req, res, next) => {
    const token = req.header('x-auth');

    User.findUserByToken(token)
        .then((user) => {
            if (!user) {
                return Promise.reject();
            }
            req.user = user;
            req.token = token;
            next();
        })
        .catch((error) => {
            res.status(401).send({ message: 'Unauthorized User!' });
        });
};

module.exports = {
    authenticate
};
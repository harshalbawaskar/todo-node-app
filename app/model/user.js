/**
 * File name:   user.js
 * Description: This file contains user model.
 * Author:      Harshal Bawaskar
 */

const { mongoose } = require('./../db/db');
const { isEmail } = require('validator');
const { sign, verify } = require('jsonwebtoken');
const { pick } = require('lodash');
const { genSalt, hash, compare } = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        default: 'Unknown'
    },
    email: {
        type: String,
        min: 6,
        required: true,
        unique: true,
        validate: {
            validator: isEmail,
            message: '{VALUE} is not a valid email address.'
        }
    },
    contactno: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: [
        {
            access: {
                type: String,
                required: true
            },
            token: {
                type: String,
                required: true
            }
        }
    ]
});

UserSchema.methods.toJSON = function () {
    const user = this;

    // toObject() converts mongoose object to normal object instance. 
    const userObj = user.toObject();

    return pick(userObj, ['name', 'email', 'location', 'contactno']);
};

UserSchema.methods.generateAuthToken = function () {
    // In context of user object.
    const user = this;
    const access = 'auth';

    // Generate token with user id.
    const token = sign({ _id: user._id.toHexString(), access }, 'secret').toString();

    // Push token object in tokens array.
    user.tokens.push({ token, access });

    // Save user object with token 
    return user.save().then((user) => {
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    var user = this;

    return user.update({
        $pull: {
            tokens: { token }
        }
    });
};

UserSchema.statics.findUserByToken = function (token) {
    var User = this;
    var decoded = null;
    try {
        decoded = verify(token, 'secret');
    } catch (error) {
        // Reject when invaid token.
        return Promise.reject();
    }

    // Find user by the token and return found user.
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findUserByCredentials = function (email, password) {
    var User = this;

    return User.findOne({
        email
    }).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        return compare(password, user.password).then((result) => {
            if (result) {
                return user;
            } else {
                return Promise.reject();
            }
        }).catch((err) => {
            return Promise.reject();
        });
    });
};

UserSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        genSalt(10, (error, salt) => {
            if (!error) {
                hash(user.password, salt, (err, hashpwd) => {
                    if (!err) {
                        user.password = hashpwd;
                        next();
                    }
                });
            }
        });
    } else {
        next();
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = {
    User
};
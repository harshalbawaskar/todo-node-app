/**
 * File name:   db.js
 * Description: This file contains the database configuration and conection code.
 *              Dev has to install mongodb on local machine in order to use database.
 * Author:      Harshal Bawaskar
 */

const mongoose = require('mongoose');
const dbUrl = 'mongodb://localhost:27017';
const dbName = 'TodosApp';

mongoose.Promise = global.Promise;

mongoose.connect(dbUrl, {
    dbName: dbName
});

module.exports = {
    mongoose
};
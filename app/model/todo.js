/**
 * File name:   todo.js
 * Description: This file contains todo model.
 * Author:      Harshal Bawaskar
 */

const { mongoose } = require('./../db/db');

const Todo = mongoose.model('Todo', {
    title: {
        type: String,
        required: true,
        trim: true,
        min: 5
    },
    description: {
        type: String,
        required: false,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});

module.exports = {
    Todo
};
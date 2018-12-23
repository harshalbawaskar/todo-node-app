/**
 * File name:   server.js
 * Description: This is the main entry file.
 *              It has route configured to serve request made by client/user agent.
 *              There are two types of routes which are handled
 *                1: Todos
 *                2: Users
 * Author:      Harshal Bawaskar
 */

const express = require('express');
const _ = require('lodash');
const bodyParcer = require('body-parser');
const { ObjectID } = require('mongodb');

const { User } = require('./model/user');
const { Todo } = require('./model/todo');
const { authenticate } = require('./midddleware/authenticate');

const server = express();

// Add body parcer middleware which transforms body into json.
server.use(bodyParcer.json());

// Todos request goes here on.......

server.get('/todos', authenticate, (req, res) => {
  Todo.find({
    createdBy: req.user._id
  }).then(result => {
    res.send({ todos: result });
  });
});

server.get('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    res.status(404).send({
      message: 'Invalid id.'
    });
  }

  Todo.findOne({ _id: id, createdBy: req.user._id }).then(todo => {
    if (!todo) {
      return res.status(404).send({
        message: 'No matching todo found!'
      });
    }

    res.send(todo);
  }, err => {
    res.status(400).send({ message: 'Failed to find the todo.' })
  });

});

server.post('/todos', authenticate, (req, res) => {

  const todo = new Todo({
    title: req.body.title,
    description: req.body.description,
    createdBy: req.user._id
  });

  todo.save().then((todoNote) => {
    res.send(todoNote);
  }, (error) => {
    res.status(400).send({ message: 'Failed to save the todo.' });
  });

});

server.delete('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    res.status(404).send({
      message: 'Invalid id.'
    });
  }

  Todo.findOneAndDelete({ _id: id, createdBy: req.user._id }).then(todo => {
    if (!todo) {
      return res.status(404).send({
        message: 'No matching todo found!'
      });
    }

    res.send(todo);
  }, err => {
    res.status(400).send({ message: 'Failed to delete the todo.' })
  });

});

server.patch('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;

  const todo = _.pick(req.body, ['completed', 'title', 'description']);

  if (!ObjectID.isValid(id)) {
    res.status(404).send({
      message: 'Invalid id.'
    });
  }

  if (_.isBoolean(todo.completed) && todo.completed) {
    todo.completedAt = new Date().getTime();
  } else {
    todo.completed = false;
    todo.completedAt = null;
  }

  Todo.findOneAndUpdate({ _id: id, createdBy: req.user._id },
    {
      $set: todo
    }, {
      new: true
    }).then(todoNote => {
      if (!todoNote) {
        return res.status(404).send({
          message: 'No matching todo found!'
        });
      }

      res.send(todoNote);
    }, err => {
      res.status(400).send({
        message: 'Failed to update the todo.'
      });
    });
});


// Users request goes here on.......

server.post('/users', (req, res) => {
  const body = _.pick(req.body, ['name', 'location', 'email', 'contactno', 'password', 'tokens']);

  const user = new User(body);
  user.save()
    .then((user) => {
      return user.generateAuthToken();
    })
    .then((token) => {
      res.header('x-auth', token).send(user);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error);
    });
});

server.get('/users/me', authenticate, (req, res) => {
  res.header('x-auth').send(req.user);
});

server.post('/users/login', (req, res) => {
  const user = new User(_.pick(req.body, ['email', 'password']));

  User.findUserByCredentials(user.email, user.password)
    .then((user) => {
      if (user) {
        user.generateAuthToken()
          .then((token) => {
            res.header('x-auth', token).send(user);
          });
      } else {
        return Promise.reject();
      }
    })
    .catch((error) => {
      res.status(400).send({ message: 'Error while logging in user.' });
    });
});

server.delete('/users/me/token', authenticate, (req, res) => {
  const user = req.user;
  user.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch((error) => {
    res.status(400).send();
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

module.exports = {
  server
};

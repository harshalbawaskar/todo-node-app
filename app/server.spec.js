const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { server } = require('./server');
const { Todo } = require('./model/todo');

const todos = [
  {
    _id: new ObjectID(),
    title: 'Todo1'
  },
  {
    _id: new ObjectID(),
    title: 'Todo2'
  }
];

describe('POST /todos', () => {

  beforeEach((done) => {
    Todo.deleteMany({}).then(() => done(), (err) => done(err));
  });

  it('should return valid response', (done) => {
    request(server)
      .post('/todos')
      .send({
        "title": "Mail",
        "description": "Send mail"
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.title).toBe('Mail');
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }

        Todo.find({}).then((result) => {
          expect(result.length).toBeGreaterThan(00);
          expect(result[0].title).toBe('Mail');
          done();
        }, (err) => done(err));
      });
  });

  it('should return 400 response status on error', (done) => {
    request(server)
      .post('/todos')
      .send({})
      .expect(400)
      .end((error, response) => {
        if (error) {
          return done(error);
        }

        Todo.find({}).then((result) => {
          expect(result.length).toBe(0);
          done();
        }, (err) => done(err));
      });
  });
});

describe('GET /todos', () => {

  beforeEach((done) => {
    Todo.deleteMany({})
      .then(() => {
        return Todo.insertMany(todos);
      })
      .then(() => done())
      .catch((err) => done(err));
  });

  it('should return todos', (done) => {
    request(server)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {

  beforeEach((done) => {
    Todo.deleteMany({})
      .then(() => {
        return Todo.insertMany(todos);
      })
      .then(() => done())
      .catch((err) => done(err));
  });

  it('should return todo matching with id', (done) => {
    request(server)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.title).toBe('Todo1');
      })
      .end(done);
  });

  it('should return 404 if not found', (done) => {
    const id = new ObjectID();

    request(server)
      .get(`/todos/${id.toHexString()}`)
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toBe('No matching todo found!');
      })
      .end(done);
  });

  it('should return 404 for non matching todo id', (done) => {
    request(server)
      .get(`/todos/123`)
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toBe('Invalid id.');
      })
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {

  beforeEach((done) => {
    Todo.deleteMany({})
      .then(() => {
        return Todo.insertMany(todos);
      })
      .then(() => done())
      .catch((err) => done(err));
  });

  it('should delete and return deleted todo', (done) => {
    request(server)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.title).toBe('Todo1');
      })
      .expect((res) => {
        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(1);
          })
          .catch(error => done(error));
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    const id = new ObjectID();

    request(server)
      .delete(`/todos/${id.toHexString()}`)
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toBe('No matching todo found!');
      })
      .expect((res) => {
        Todo.find()
          .then(result => {
            expect(result.length).toBe(2);
          })
          .catch(error => done(error));
      })
      .end(done);
  });

  it('should return 404 for non matching todo id', (done) => {
    request(server)
      .delete(`/todos/123abc`)
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toBe('Invalid id.');
      })
      .expect((res) => {
        Todo.find()
          .then(result => {
            expect(result.length).toBe(2);
          })
          .catch(error => done(error));
      })
      .end(done);
  });
});

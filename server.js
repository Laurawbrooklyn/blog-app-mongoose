const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {blogPost} = require('./models');

const app = express();
app.use(bodyParser.json());

app.get('/blogPost', (req, res) => {
  blogPost
    .find()
    .limit(10)
      res.json({
        blogPosts: blogPosts.map(
          (blogPost) => blogPost.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

app.get('/blogPosts', (req, res) => {
    const filters = {};
    const queryableFields = ['title', 'author.firstName', 'author.lastName'];
    queryableFields.forEach(field => {
        if (req.query[field]) {
            filters[field] = req.query[field];
        }
    });
    blogPost
        .find(filters)
        .then(blogPosts => res.json(
            blogPosts.map(blogPost => blogPost.apiRepr())
        ))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'})
        });
});

app.post('/blogPosts', (req, res) => {

  const requiredFields = ['title', 'author.firstName', 'author.lastName'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  blogPost
    .create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author})
    .then(
      blogPost => res.status(201).json(blogPost.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.put('/blogPosts/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updateableFields = ['title', 'content', 'author'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  blogPost
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(blogPost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/blogPosts/:id', (req, res) => {
  blogPost
    .findByIdAndRemove(req.params.id)
    .then(blogPost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};

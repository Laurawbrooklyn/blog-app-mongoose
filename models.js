const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: String,
    lastName: String
  },
});

blogPostSchema.virtual('fullName').get(function() {
  const auth = this.author;
  return `${this.auth.firstName} ${this.auth.lastName}`;
})
.set(function (fullName) {
  const [first, last] = fullName.split('');
  this.author.firstName = first;
  this.author.lastName = last;
});

blogPostSchema.methods.apiRepr = function() {

  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorName
  };
}

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {BlogPost};

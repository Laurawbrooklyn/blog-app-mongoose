const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: String,
    lastName: String
  },
});

//Not sure how to handle the "space" between firstName & lastName
blogPostSchema.virtual('authorString').get(function() {
  return `${this.author.firstName} {$ + } ${this.author.lastName}`.trim()});

blogPostSchema.methods.apiRepr = function() {

  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorString
  };
}

const blogPost = mongoose.model('blogPost', blogPostSchema);

module.exports = {blogPost};

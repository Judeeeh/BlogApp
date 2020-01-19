var express = require('express');
var methodOverride = require('method-override');
var expressSanitizer = require('express-sanitizer');
var mongoose = require('mongoose');
var app = express();

//APP CONFIG
require('dotenv').config();

var port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(expressSanitizer());

//SCHEMA
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: { type: Date, default: Date.now }
});

var Blog = mongoose.model('Blog', blogSchema);

// INDEX ROUTES
app.get('/', function(req, res) {
  res.redirect('/blogs');
});

app.get('/blogs', function(req, res) {
  Blog.find({}, function(err, blogs) {
    if (err) {
      console.log('ERROR!');
    } else {
      res.render('index.ejs', { blogs: blogs });
    }
  });
});

//NEW ROUTE
app.get('/blogs/new', function(req, res) {
  res.render('new.ejs');
});

//CREATE ROUTE
app.post('/blogs', function(req, res) {
  // create blog
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, function(err, newBlog) {
    if (err) {
      res.render('new');
    } else {
      // then, redirect to the index
      res.redirect('/blogs');
    }
  });
});

//SHOW ROUTE
app.get('/blogs/:id', function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.render('show', { blog: foundBlog });
    }
  });
});

// EDIT ROUTE
app.get('/blogs/:id/edit', function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.render('edit', { blog: foundBlog });
    }
  });
});

//UPDATE ROUTE
app.put('/blogs/:id', function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(
    err,
    updatedBlog
  ) {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.redirect('/blogs/' + req.params.id);
    }
  });
});

//DELETE ROUTE
app.delete('/blogs/:id', function(req, res) {
  //destroy blog
  Blog.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.redirect('/blogs');
    }
  });
  //redirect somwhere
});

app.listen(port, function() {
  console.log('SERVER IS RUNNING!');
});

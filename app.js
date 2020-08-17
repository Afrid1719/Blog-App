var express = require('express'),
    mongoose = require('mongoose'),
    methodOverride = require('method-override'),
    sanitizer = require('express-sanitizer');
    bodyParser = require('body-parser'),
    app = express();

mongoose.connect('mongodb://localhost:27017/blog_app',{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(sanitizer());

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model('Blog', blogSchema);

// Blog.create({
//     title: "Harry Potter",
//     image: "https://images.unsplash.com/photo-1565292266983-74457d481f44?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
//     create: Date.now,
//     body: "Harry Potter is an awesome movie"
// }).catch(console.log);

// RESTful Routes

// Index
app.get('/', (req,res)=>{
    res.redirect('/blogs');
});

//Redirected Index
app.get('/blogs', (req,res)=>{
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err.message);
        } else {
            res.render('index', {blogs: blogs});
        }
    });
});

//New
app.get('/blogs/new', (req,res)=>{
    res.render('newBlogForm');
});

//Create
app.post('/blogs', (req,res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog,function(err, blog){
        if(err){
            res.render('newBlogForm');
        } else {
            res.redirect('/');
        }
    });
});

//Show
app.get('/blogs/:id', (req,res)=>{
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            console.log(err.message);
        } else {
            res.render('blogShow',{blog: blog});
        }
    });
})

//Edit
app.get('/blogs/:id/edit', (req,res)=>{
    Blog.findById(req.params.id, (err,blog)=>{
        if(err){
            console.log(err.message);
        } else {
            res.render('editBlogForm',{blog: blog});
        }
    })
});

//Update
app.put('/blogs/:id', (req,res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, oldBlog){
        if(err){
            console.log(err.message);
            res.redirect('/blogs');
        } else {
            console.log(oldBlog);
            res.redirect('/blogs/' + req.params.id);
        }
    });
});

//Delete
app.delete('/blogs/:id', (req,res)=>{
    Blog.findByIdAndDelete(req.params.id, function(err, deletedBlog){
        if(err){
            console.log(err.message);
            res.redirect('/blogs/' + req.params.id);
        } else {
            res.redirect('/blogs');
        }
    });
});

app.listen(3000, function(){
    console.log('Blog App running...');
});
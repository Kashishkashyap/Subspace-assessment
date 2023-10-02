const express = require('express');
const app = express();
const axios = require('axios');
const lodash = require('lodash');

const path= require('path');
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

const fetchBlogDataMiddleware = async(req, res, next)=>{
    try {
        const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
            headers: {
                'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
            }
        });
        req.blogData = response.data;

        next();
    } catch (error) {
        console.error('Error while we are fetching blog data:', error);
        next(error);
    }
};



app.get('/api/blog-stats', fetchBlogDataMiddleware, async(req, res)=>{
    try{
        const blogData = req.blogData;
        // res.send(blogData)
    
        const totalBlogs = lodash.size(blogData.blogs);
        const blogWithLongestTitle = lodash.maxBy(blogData.blogs, blog => blog.title.length);
    
        const blogsWithPrivacyTitle = lodash.filter(blogData.blogs, (blog)=>lodash.includes(lodash.toLower(blog.title), 'privacy')).length;
    
        const uniqueBlogTitles = lodash.chain(blogData.blogs).map('title').uniq().value();
        console.log(blogWithLongestTitle);
        const response = {
            totalBlogs,
            longestBlogTitle: blogWithLongestTitle.title,
            blogsWithTitlePrivacy: blogsWithPrivacyTitle,
            uniqueBlogTitles,
        };
        // res.json(response)
        res.render('index', {response});
    }catch(error) {
        console.error('Error while processing blog statistics:', error);
    }

})

app.get('/api/blog-search', fetchBlogDataMiddleware, async(req, res, next) => {
    try{
        const blogData= req.blogData;
        const query = req.query.query;
        if (!query) {
          return res.send({ error: 'Query parameter "query" is missing.' });
        }
        const matchingBlogs = blogData.blogs.filter((blog) =>
          blog.title.toLowerCase().includes(query.toLowerCase())
        );
        res.render('search', {matchingBlogs})
        // res.json(matchingBlogs)
        
    }catch(error) {
        console.error('Error while searching:', error);
    }
   
  });
  
app.listen(3000, () => {
    console.log("Port 3000")
})
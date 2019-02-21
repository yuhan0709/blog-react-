var express = require("express");
var router = express.Router();
var formidable = require("formidable");
var marked = require("marked");
var hljs = require("highlight.js");
var fs = require("fs");
var path = require("path");
var Life = require("../models/articles");
var utils = require("./utils");
var bodyParser = require("body-parser");
var urlendedParser = bodyParser.urlencoded({ extended: false });
router.get("/", (req, res) => {
    Life.find({},(err,data)=>{
        if(err){
            console.log(err);
        }
        res.render("lifeArticles/index.ejs",{data:data})
    })
});
router.get("/edit/:id", (req, res) => {
    Life.find({_id:req.params.id},(err,data)=>{
        var obj = utils.Format(data[0].date,'yyyy-MM-dd');
        data[0].newdate = obj;
        res.render('lifeArticles/edit.ejs',{data:data[0]})  
    })
})
router.post("/edit/:id",urlendedParser,(req,res)=>{
    var body = req.body;
    body.id = req.params.id;
    utils.update(Life,body,res,'/lifeArticles');
})
router.get("/new", (req, res) => {
    res.render('lifeArticles/new.ejs')
})
router.post("/new",(req,res)=>{
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname+"/../public/file";
    form.parse(req,(err,fields,files)=>{
        if(err){
            console.log(err);
        }
        var oldpath = files.body.path;
        var newpath = path.join(path.dirname(oldpath),files.body.name);
        fs.rename(oldpath,newpath,function (err){
            if(err){
               throw Error("失败");
            }
            fs.readFile("public/file/"+files.body.name,'utf-8',(err,data)=>{
                if(err) {console.log(err)};
                marked.setOptions({
                    renderer: new marked.Renderer(),
                    gfm: true,
                    tables: true,
                    breaks: false,
                    pedantic: false,
                    sanitize: false,
                    smartLists: true,
                    smartypants: false,
                    highlight: function (code) {
                    return hljs.highlightAuto(code).value;
                  }
                })
                var html = marked(data);
                fields.body = html;
                utils.new(Life,fields,res,"/lifeArticles");
            })
        })
    })
})
router.delete("/delete/:id",(req,res)=>{
    utils.delete(Life,req.params.id,res);
})
module.exports = router;
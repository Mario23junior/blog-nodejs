const express = require('express')
const router = express.Router()
const Category = require('../categories/Category')
const Article = require('./Article')
const slugify = require('slugify')
const adminAuth = require('../middlewares/adminAuth')

// renderizando artigos na tela e mostrando id = categoria
router.get('/admin/articles', adminAuth,(req, res) => {
   Article.findAll({
       include: [{model: Category}]
   }).then(articles => {
        res.render('admin/articles/index', {articles: articles})
   })    
})

// rederizando formulario de  para novos artigos
router.get('/admin/articles/new',adminAuth,(req ,res) => { 
    Category.findAll().then(categories => {
        res.render('admin/articles/new',{categories: categories})
    })
})


// salvando artigos no banco de dados 
router.post('/articles/save',adminAuth,(req, res) => {
    let title = req.body.title
    let body = req.body.body
    let category = req.body.category
       
    Article.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId: category
    }).then(() => {
         res.redirect('/admin/articles')
    })
})

// rota deletando artigos
router.post('/articles/delete',adminAuth,(req, res) => {
    let id = req.body.id 
      if(id != undefined){
          if(!isNaN(id)){
             Article.destroy({
                 where: {
                     id:id
                  }
             }).then(() => {
                 res.redirect('/admin/articles')
             })

          }else{// se não for um numero
          redirect('/admin/articles')
       }
      }else{ // null
         redirect('/admin/articles')
      }
})

//  rota de exibição da pagina atualizar e edição de artigos
router.get('/admin/articles/edit/:id',adminAuth, (req, res) => { 
     let id = req.params.id
      Article.findByPk(id).then(article => {
          if(article != undefined){
              
              Category.findAll().then(categories => {

                res.render("admin/articles/edit",{categories:categories, article:article })

              })

          } else {
              res.redirect('/')
          }
      }).catch(err => {
          res.redirect('/')
      })
})
  
// salvando formulario de atualização de artigos 
router.post('/articles/update',adminAuth,(req, res) => {
     let id = req.body.id
     let title = req.body.title
     let body = req.body.body
     let category = req.body.category

       Article.update({title:title, body:body, categoryId:category, slug:slugify(title)},{
            where: {
                id: id
             }
       }).then(() => {
           res.redirect('/admin/articles')
       }).catch(err => {
           res.redirect('/')
       })
})

// rota de paginação de artigos
router.get('/articles/page/:num',(req, res) => {
  let page = req.params.num
  let offset = 0

    if(isNaN(page) || page == 1 ){
        offset = 0
    } else {
        offset = (parseInt(page) -1) * 3
    }
     
    Article.findAndCountAll({
        limit: 3,
        offset: offset,
        order:[
            ['id','desc']
        ]
    }).then(articles => {

     let next 
        if(offset + 4 >= articles.count){
        next = false
    } else {
        next = true
    }

        let result =  {
            page: parseInt(page),
            next: next,
            articles : articles
        }
            
        Category.findAll().then(categories => {
            res.render('admin/articles/page', {result: result, categories: categories})
        })
    })
})

module.exports = router
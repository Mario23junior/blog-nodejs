const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const connection = require('./database/database')
const session = require('express-session')

//importando controllers
const categoriesController = require('./categories/CategoriesController')
const articlesController = require('./articles/ArticlesController')
const usersController = require('./users/UsersController')

// importação de models
const Article = require('./articles/Article')
const Category = require('./categories/Category')
const User = require('./users/User')

// views engine configurando
app.set('view engine', 'ejs')

//configuraçãoes de sessão de login / onde a seção fica salva
app.use(session({
    secret:'sddcscs#@_+#sdclo%365jkennchkwwdccm9272', 
    cookie: {maxAge: 30000000},
}))

// static
app.use(express.static('public'))


// body parser configury
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//conectando com banco de dados 
connection
      .authenticate()
      .then(() => {
           console.log('conexao realizada com successo')
      }).catch((error) => {
          console.log('falha na conexeção com banco de dados ')
      })

// rotas controlles  
app.use('/',categoriesController)
app.use('/',articlesController)
app.use('/',usersController)


app.get('/', (req, res) => {
     Article.findAll({
         order:[
             ['id','desc']
         ],
          limit: 3
     }).then(articles => {
         Category.findAll().then(categories => {
             res.render('index', {articles: articles, categories: categories})
         })
     })
})


//  abrindo artigo unico em pagina unica pelo slug
app.get('/:slug',(req, res) => {
  let slug = req.params.slug
   Article.findOne({
       where: {
           slug:slug
       }
   }).then(article => {
         if(article != undefined){
            Category.findAll().then(categories => {
                res.render('article', {article: article, categories: categories})
            })
         }else{
           res.redirect('/')
        }
   }).catch( err => {
       redirect('/')
   })
})


// filtrando artigos por categoria
app.get('/category/:slug', (req, res) => {
    let slug = req.params.slug
      Category.findOne({
          where:{
              slug: slug
          },
           include: [{model: Article}]
      }).then( category => {

      Category.findAll().then(categories => {
           res.render('index', {articles: category.articles, categories:categories})
      })

     if(category != undefined) {
       
     } else {
         redirect('/')
    }
}).catch ( err => {
    res.redirect('/')
  })
})

app.listen(8080, () => {
    console.log('Servirdor rodando com sucesso...')
}).fin
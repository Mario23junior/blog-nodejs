const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('./User')

// listagem de usuarios  cadastrados
router.get('/admin/users', (req, res) => {
    if(req.session.user == undefined){
        res.redirect('/')
    }
    User.findAll().then(users => {
         res.render('admin/users/index',{users: users})
    })
})

// exibindo pagina de exibição de cadastro de usuarios 
router.get('/admin/users/create',(req, res) => {
    res.render('admin/users/create')
})

// recebendo dados do formulario e salvando no banco de dados
router.post('/users/create', (req, res ) => {
    let email = req.body.email
    let password = req.body.password


    // evitando cadastro de email iguais na base dados
    User.findOne({where: {email: email}}).then( user => {
         if(user == undefined){

            // processo de criptografia de senha 
          let salt = bcrypt.genSaltSync(10)
          let hash = bcrypt.hashSync(password, salt)

            User.create({
                email: email,
                password: hash
            }).then(() => {
                res.redirect('/')
            }).catch((err => {
                    res.redirect('/')
            }))

         } else {
             res.redirect('/admin/users/create')
         }
    })
})

// renderizando pagina de login no sistema
router.get('/login',(req, res) => {
    res.render('admin/users/login')
})

// validando/  e autenticando dados de usuario
router.post('/authenticate',(req, res) => {
   let email = req.body.email
   let password = req.body.password
     
   User.findOne({where:{email: email}}).then(user => {
       if(user != undefined) { // se existi um susuario com esse email 
           // validand senha
           let correct = bcrypt.compareSync(password,user.password)

           if(correct){
               req.session.user = {
                   id: user.id,
                   email:user.email
               }
               res.redirect('/admin/articles')
           }else{
             res.redirect('/login')
           }

       } else {
           res.redirect('/login')
       }
   })
})

// logout do sistema destruindo seção 
router.get('/logout',(req, res) => { 
  req.session.user = undefined
  res.redirect('/')
})


module.exports = router
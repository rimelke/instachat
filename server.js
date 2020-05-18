const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const createDb = require('./db.js')
const createAuth = require('./auth.js')

const app = express()
const server = http.createServer(app)
const sockets = socketio(server)
const db = createDb()
const auth = createAuth()

app.use(express.static('public'))
app.set('views', './public')
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', function(req, res) {
    res.render('login.html')
})

app.post('/login', function(req, res) {
    const resAuth = auth.registerUser(req.body.username)
    if (resAuth.status == 'ok') {
        res.cookie('token', resAuth.token)
        res.redirect('/chat')
    } else {
        res.redirect(`/?status=${resAuth.status}&reason=` + encodeURIComponent(resAuth.reason))
    }
})

app.get('/chat', function(req, res) {
    let token = req.cookies.token
    if (token) {
        let user= auth.getUserFromToken(token)
        if (user) {
            res.render('chat.html')
        } else res.redirect('/')
    } else res.redirect('/')
})

sockets.on('connection', socket => {
    let cookies = {}
    socket.request.headers.cookie.split('; ').forEach((cookie) => {
        cookie = cookie.split('=')
        cookies[cookie[0]] = cookie[1]
    })
    let user = auth.getUserFromToken(cookies.token)
    if (cookies.token && user) {
        socket.emit('usernameInfo', user.username)
        socket.emit('previousMessages', db.messages)

        socket.on('sendMessage', message => {
            message.author = user.username
            db.saveMessage(message)
            sockets.emit('receivedMessage', message)
        })

        socket.on('disconnect', () => {
            auth.deleteUser(cookies.token)
        })
    } else socket.emit('mustLoggin', true)
});

server.listen(3000, () => {console.log('Server listening on port: 3000!')})
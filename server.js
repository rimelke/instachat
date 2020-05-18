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
        res.redirect('/')
    }
})

app.get('/chat', function(req, res) {
    let token = req.cookies.token
    if (token) {
        let username = auth.getUsername(token)
        if (username) {
            res.render('chat.html')
        } else res.redirect('/')
    } else res.redirect('/')
})

sockets.on('connection', socket => {
    socket.emit('previousMessages', db.messages)
    socket.on('sendMessage', message => {
        db.saveMessage(message)
        sockets.emit('receivedMessage', message)
    })
});

server.listen(3000, () => {console.log('Server listening on port: 3000!')})
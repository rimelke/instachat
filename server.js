const express = require('express')
const app = express()
const http = require('http')
const socketio = require('socket.io')
const createDb = require('./db.js')

const server = http.createServer(app)
const sockets = socketio(server)
const db = createDb()

app.use(express.static('public'))
app.set('views', './public')
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

app.get('/', function(req, res) {
    res.render('index.html')
})

sockets.on('connection', socket => {
    socket.emit('previousMessages', db.messages)
    socket.on('sendMessage', message => {
        db.saveMessage(message)
        sockets.emit('receivedMessage', message)
    })
});

server.listen(3000, () => {console.log('Server listening on port: 3000!')})
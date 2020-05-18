const fs = require('fs')

function createDb() {
    let messages = []
    let fileName = new Date().toISOString().replace(/\D/g,'')

    function saveMessage(message) {
        message.sentAt = new Date()
        messages.push(message)
        fs.writeFile(`./db/${fileName}.json`, JSON.stringify(messages, null, 4), (err) => {
            if (err) console.log(err)
        })
    }

    return {
        messages,
        saveMessage
    }
}

module.exports = createDb
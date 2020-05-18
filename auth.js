function createAuth() {
    let users = {}

    function registerUser(username) {
        if (!users[username]) {
            let token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
            users[username] = token
            return {status: 'ok', token}
        } else return {status: 'error', reason: 'User already logged in!'}
    }

    function getUsername(token) {
        for (let username in users) {
            if (users[username] == token) {
                return username
            }
        }
    }

    return {
        registerUser,
        getUsername
    }
}

module.exports = createAuth
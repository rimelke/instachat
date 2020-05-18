function createAuth() {
    let users = {}
    function registerUser(username) {
        let userExists = false
        for (let token in users) {
            if (users[token].username == username) {
                userExists = true
                break
            }
        }
        if (!userExists) {
            let token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
            users[token] = {username}
            return {status: 'ok', token}
        } else return {status: 'error', reason: 'User already logged in!'}
    }

    function deleteUser(token) {
        delete users[token]
    }

    function getUserFromToken(token) {
        return users[token]
    }

    return {
        registerUser,
        getUserFromToken,
        deleteUser,
    }
}

module.exports = createAuth
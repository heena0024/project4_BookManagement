const jwt = require('jsonwebtoken')


const authentication = function (req, res, next) {
    try {
        const jwtToken = req.headers['x-auth-token']
        if (!jwtToken) {
            res.status(401).send({ status: false, message: "Mandatory header is missing" })
            return
        }

        const decodedToken = jwt.verify(jwtToken, 'ourSecret')

        if (!decodedToken) {
            res.status(401).send({ status: false, message: "Please provide valid token" })
            return
        }
        req['userId'] = decodedToken['userId']
        next()
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { authentication }
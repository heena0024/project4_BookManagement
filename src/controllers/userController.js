const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken')


//validation
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidEmail = function (email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}
const isValidPhone = function (phone) {
    return /^\d{10}$/.test(phone)
}

const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) > -1
}

/////////////////////////////////// CREATE USER//////////////////////////
const createUser = async function (req, res) {
    try {
        const requestBody = req.body
        let { title, name, phone, email, password, address } = requestBody

        //validation starts here
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: "Please provide valid request body" })
            return
        }
        if (!isValid(title)) {
            res.status(400).send({ status: false, message: "Title is required" })
            return
        }

        if (!isValidTitle(title)) {
            res.status(400).send({ status: false, message: "Title should be among Mr, Mrs and Miss" })
            return
        }

        if (!isValid(name)) {
            res.status(400).send({ status: false, message: "name is required" })
            return
        }

        if (!isValid(phone)) {
            res.status(400).send({ status: false, message: "phone is required" })
            return
        }
        if (!isValidPhone(phone)) {
            res.status(400).send({ status: false, message: "provide valid phone number" })
            return
        }

        const isPhoneAlreadyUsed = await userModel.findOne({ phone })

        if (isPhoneAlreadyUsed) {
            res.status(400).send({ status: false, message: "phone is already in use, try something different" })
            return
        }

        if (!isValid(email)) {
            res.status(400).send({ status: false, message: "email is required" })
            return
        }
        if (!isValidEmail(email)) {
            res.status(400).send({ status: false, message: "provide valid email" })
            return
        }

        const isEmailAlreadyUsed = await userModel.findOne({ email })

        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: "Email is already in use, try something different" })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, message: "password is required" })
            return
        }

        if (password.trim().length < 8 || password.trim().length > 15) {
            res.status(400).send({ status: false, message: "password should be of minimum 8 and maximum 15 character" })
            return
        }
        //validation ends here

        const userData = { title, name, phone, email, password, address: address ? address : null }
        const userDetails = await userModel.create(userData)
        res.status(200).send({ status: true, data: userDetails })
        return
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })

    }
}

const loginUser = async function (req, res) {
    try {
        const requestBody = req.body
        const { email, password } = requestBody

        // validation starts

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: "Please provide valid credentials" })
            return
        }

        if (!isValid(email)) {
            res.status(400).send({ status: false, message: "please provide email" })
            return
        }
        if (!isValid(password)) {
            res.status(400).send({ status: false, message: "please provide password" })
            return
        }

        const userDetails = await userModel.findOne(requestBody)

        if (!userDetails) {
            res.status(401).send({ status: "false", message: "Either password or email is not correct, try with valid one" })
            return
        }
        const payload = { "userId": userDetails['_id'], 'exp': Math.floor(Date.now() / 1000) + (60 * 60 * 5), "iat": Math.floor(Date.now() / 1000) }
        const jwtToken = jwt.sign(payload, 'ourSecret')
        return res.status(200).send({ status: true, message: "success", jwt_token: jwtToken })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })

    }
}

module.exports = { createUser, loginUser }

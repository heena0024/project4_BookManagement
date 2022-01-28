const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    title: {
        type: String,
        enum: ['Mr', 'Mrs', 'Miss'],
        required: 'Title is required'
    },
    name: {
        type: String,
        required: 'Name is required',
        trim: true
    },
    phone: {
        type: String,
        required: 'Phone number is required',
        unique: true,
        trim : true

    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: {
            validator: function (email) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
            }, message: 'Please fill a valid email address', isAsync: false
        }
    },
    password: {
        type: String,
        required: 'Password is required',
        minlength : 8,
        maxlength : 15,
        trim : true
    },
    address: {
        street: String,
        city: String,
        pincode: String
    }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)


const {Schema, model} = require("mongoose");

const PetSchema = Schema({
    name: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: true
    },    
    type: {
        type: String,
        required: true
    },     
    image: {
        type: String,
        default: "default.png"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = model("Pet", PetSchema, "pets");
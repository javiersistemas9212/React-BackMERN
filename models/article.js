const {Schema, model} = require("mongoose");

const ArticleSchema = Schema({    
    name: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },    
    amount: {
        type: Number,
        required: true
    },     
    image: {
        type: String,
        default: "default.jpg"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = model("Article", ArticleSchema, "articles");
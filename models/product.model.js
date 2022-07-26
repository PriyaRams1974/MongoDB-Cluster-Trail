const mongoose = require('mongoose');
const crypto = require('crypto');

const itemSchema = new mongoose.Schema({
    uuid: {type: String, required:false},
    ProductName:{type: String, required: true, trim: true},
    quantity:{type: Number, required: true},
    price:{type: String, required: true},
    inStock: {type: Boolean, required: false, default: true},
},
{
    timestamps: true
});

// UUID generation
itemSchema.pre('save', function(next){
    this.uuid = 'ITEM-'+crypto.pseudoRandomBytes(6).toString('hex').toUpperCase()
    console.log(this.uuid);
    next();
});

module.exports=mongoose.model('item',itemSchema);
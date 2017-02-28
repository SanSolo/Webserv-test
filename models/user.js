const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Define the schema for users
const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2, // longueur min
    maxlength: 20 // longueur max
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2, // longueur min
    maxlength: 20 // longueur max
  },
  role: {
    type: String,
    required: true,
    enum: [ 'citizen', 'manager' ] //définit soit le mot cizizen ou manager
  },
  createdAt: { type: Date, default: Date.now  } //créé la date et lui met la date du moment de la création
});

userSchema.index({ firstName:1, lastName:1}, {unique:true});


// Create the model from the schema and export it
module.exports = mongoose.model('User', userSchema);

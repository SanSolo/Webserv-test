const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Define the schema for users
const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
    minlength: 2, // longueur min
    maxlength: 20 // longueur max
  },
  lastname: {
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
// Create the model from the schema and export it
module.exports = mongoose.model('User', userSchema);

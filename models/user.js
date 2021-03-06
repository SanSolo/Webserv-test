const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Definit le schema pour users
const userSchema = new Schema({
  firstName: { // Prénom
    type: String,
    required: true,
    minlength: 2, // longueur min
    maxlength: 20 // longueur max
  },
  lastName: { // Nom
    type: String,
    required: true,
    minlength: 2, // longueur min
    maxlength: 20 // longueur max
  },
  role: {
    type: String,
    required: true,
    enum: [ 'citizen', 'manager' ] //définit le role, soit cizizen soit manager
  },
  createdAt: { type: Date, default: Date.now  } //créé la date et lui met la date du moment de la création
});
// Contrainte d'unicité, 2 users ne peuvent pas avoir le même nom de famille et prénom
userSchema.index({ firstName: 1, lastName: 1  }, { unique: true });
// Créé le model à partir du schema and l'exporte
module.exports = mongoose.model('User', userSchema);

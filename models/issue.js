const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Define the schema for issues
const issueSchema = new Schema({
  title:{
    type: String,    //Type valiation (String)
    required: true, // Obligatoire
    maxlength: 20  // Taille maximale (20 car.)
  },
  status:{
    type: String, // Type de validation
    enum: ['new', 'inProgress', 'canceled', 'completed'], //Statut du probleme. Est un seul de ces choix et évolue
    default: "new"
  },
  description:{
    type: String, // Type de validation
    maxlength: 1000 // Taille maximale de la description
  },
  imageUrl:{
    type: String, // Type de validation
    maxlength: 500 // Taille maximale de l'URL de l'image'
  },
  latitude: {
    type: Number, // Type de validation
    required: true, // Obligatoire
    min: -90, // Minimum value
    max: 90 // Maximum value
  },
  longitude: {
    type: Number, // Type de validation
    required: true, // Obligatoire
    min: -180, // Minimum value
    max: 180 // Maximum value
  },
  tags: [{ type: String, maxlength: 20 , required:true}], // Tableau de String, chaque item max 20 car.
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // Lien avec le model User
    ref: 'User',
    required: true
  },
  createdAt: { // Date + heure de création
    type: Date,
    default: Date.now
  },
  updatedAt: { // Date + heure de mise à jour
    type: Date,
  },
  updatedBy: { // Permet de connaître la dernière personne ayant mis à jour l'issue
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});
// Crée le model à partir du schéma and l'exporte
module.exports = mongoose.model('Issue', issueSchema);

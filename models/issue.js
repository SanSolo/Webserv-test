const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Define the schema for issues
const issueSchema = new Schema({
  title:{
    type: String,
    required: true,
    maxlength: 20
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
  tags: [{ type: String, maxlength: 20 }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});
// Create the model from the schema and export it
module.exports = mongoose.model('Issue', issueSchema);

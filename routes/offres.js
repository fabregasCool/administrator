import express from 'express';
import {
  addOffre,
  deleteOffre,
  getOffre,
  getOffres,
  updateOffre,
} from '../controllers/offre.js';

const router = express.Router();

//Recupère toutes les offres
router.get('/list', getOffres);

//Recupère un seul offre
router.get('/read/:id', getOffre);

//Crée une offre
router.post('/create', addOffre);

//Supprime un offre
router.delete('/delete/:id', deleteOffre);

//Mise à jour d'une offre
router.put('/update/:id', updateOffre);

export default router;

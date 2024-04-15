import express from 'express';
import {
  addEntreprise,
  deleteEntreprise,
  getEntreprise,
  getEntreprises,
  updateEntreprise,
  All_Entreprise_Of_User_Connected,
} from '../controllers/entreprise.js';
import { isAuth } from '../utils/isAuth.js';

const router = express.Router();

//Recupère tous les entreprises
router.get('/list', getEntreprises);

//Recupère un seul entreprise
router.get('/read/:id', getEntreprise);

//Crée un entreprise
router.post('/create', addEntreprise);

//Supprime un entreprise
router.delete('/delete/:id', deleteEntreprise);

//Mise à jour d'un entreprise
router.put('/update/:id', updateEntreprise);

//Recupère tous les entreprises de l'utilisateur connecté
router.get(
  '/all_entreprise_of_user_connected',
  isAuth,
  All_Entreprise_Of_User_Connected
);

export default router;

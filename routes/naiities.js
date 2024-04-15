import express from 'express';
import {
  deleteNaiitie,
  getNaiities,
  getNaiitie,
  createNaiitie,
  updateProfile,
  updateAncienPassword,
  forgotPasswordNaiitie,
  resetPasswordGetNaiitie,
  resetPasswordPostNaiitie,
} from '../controllers/naiitie.js';
import { isAuth } from '../utils/isAuth.js';

const router = express.Router();

//Recupérer tous les utilisateurs
router.get('/list', getNaiities);

//Recupérer un utilisateur
router.get('/read/:matricule', getNaiitie);

//Supprimer un utilisateur
router.delete('/delete/:matricule', deleteNaiitie);

//Créer un utilisateur
router.post('/create', createNaiitie);

//Modifier un utilisateur
router.put('/updateProfile', isAuth, updateProfile);

//Modifier Mot de passe oublié étant connecté
router.put('/updateAncienPassword', isAuth, updateAncienPassword);

//Reinitialiser Mot de passe oublié
router.post('/forgot-password', forgotPasswordNaiitie);

//Mot de passe oublié (Celui ci est un get, il permet d'afficher l'émail de l'utilisateur et le formualire pour réinitailser)
router.get('/reset-password/:matricule/:token', resetPasswordGetNaiitie);

//Mot de passe oublié (Formulaire qui envoie le nouveau password)
router.post('/reset-password/:matricule/:token', resetPasswordPostNaiitie);

export default router;

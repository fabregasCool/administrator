import express from 'express';
import {
  addContestationEntreprise,
  //   deleteSecteurDactivite,
  //   getSecteurDactivite,
  //   getSecteurDactivites,
  //   updateSecteurDactivite,
} from '../controllers/contestationEntreprise.js';

const router = express.Router();

//Recupère tous les secteurDactivite
//router.get('/list', getSecteurDactivites);

//Recupère un seul secteurDactivite
//router.get('/read/:id', getSecteurDactivite);

//Crée un secteurDactivite
router.post('/create', addContestationEntreprise);

//Supprime un secteurDactivite
//router.delete('/delete/:id', deleteSecteurDactivite);

//Mise à jour d'un secteurDactivite

//router.put('/update/:id', updateSecteurDactivite);

export default router;

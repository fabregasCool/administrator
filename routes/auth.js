import express from 'express';
import {
  login,
  register_first_step,
  register_second_step,
} from '../controllers/auth.js';

const router = express.Router();

// 1ere Etape de l'inscription
router.post('/register_first_step', register_first_step);

//S'inscrire
router.post('/register_second_step', register_second_step);

//Se connecter
router.post('/login', login);

export default router;

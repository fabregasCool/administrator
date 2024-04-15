import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';

const app = express();

import authRoutes from './routes/auth.js';
import naiitieRoutes from './routes/naiities.js';
import secteurdactiviteRoutes from './routes/secteurdactivites.js';
import entrepriseRoutes from './routes/entreprises.js';
import contestationEntrepriseRoutes from './routes/contestationEntreprises.js';
import offreRoutes from './routes/offres.js';

dotenv.config();

app.use(express.json());

// Il permet de laisser passer les infos venant de ejs
app.use(express.urlencoded({ extended: false }));

//Template ejs permettant de créer les interfaces html, css et js etant toujours dans le backend
app.set('view engine', 'ejs');

//Configuration de cors
// app.use(
//   cors({
//     origin: "*",
//   })
// );

//Cette configuration de cors permet l'envoi des informations du back vers le front notamment les cookies
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

//MULTER ET SES CONFIGURATIONS

//Grace à multer et ce code ci-dessous, on stocke les images et vidéos dans le dossier:"client/public/upload"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../frontend/public/uploads'); //chemin du dossier qui va recevoir nos images (on le crée nous même)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
    //file.originalname: recupère le nom de l'image;
    //Si ns téléchargeons la même image avec le meme nom, le 2nd va écraser le 1er
    //Pour éviter cela on ajoute la date(Date.now() )
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de taille des fichiers (ici 5 Mo)
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Veuillez télécharger uniquement des images.'), false);
    }
  },
});
// //CREATION DE NOTRE REQUETE

app.post('/api/upload', upload.single('file'), function (req, res) {
  //"/api/upload": designe notre route, on peut ce qu'on veut
  //upload: c'est la variable qui est crér grace à "multer" en haut
  //single: tous les fichiers télechrgés seront dans un seul fichier
  //file: le nom de ce fichier est "file" que nous utiliserons dans "write.js"

  const file = req.file;
  res.status(200).json(file?.filename); //on recupère l'URL(nom_de_fichier + extension) de l'image
});

//Fin MULTER
app.use('/api/auth', authRoutes);
app.use('/api/naiities', naiitieRoutes);
app.use('/api/secteurdactivites', secteurdactiviteRoutes);
app.use('/api/entreprises', entrepriseRoutes);
app.use('/api/contestationEntreprises', contestationEntrepriseRoutes);
app.use('/api/offres', offreRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Quelque chose s'est mal passé";
  return res.status(status).json({
    success: false,
    status: status,
    message: message,
  });
});

app.listen(process.env.PORT, () => {
  console.log('Server Connected Correctly');
});

import { db } from '../db.js';

//Recupère toutes les activités

//Recupère un seule activité

//Crée une activite
export const addContestationEntreprise = (req, res) => {
  const q =
    'INSERT INTO contestationEntreprises(`raison_sociale`,`registre_commerce`,`date_creation`,`nom_gerant`,`prenom_gerant`,`phone_gerant`,`objet`) VALUES (?)';

  const values = [
    req.body.raison_sociale,
    req.body.registre_commerce,
    req.body.date_creation,
    req.body.nom_gerant,
    req.body.prenom_gerant,
    req.body.phone_gerant,
    req.body.objet,
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.status(401).json(err);

    return res.json('Contestation has been created');
  });
};

//Supprime un post

//Mise à jour d'un post

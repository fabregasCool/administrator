import { db } from '../db.js';

//Recupère toutes les activités
export const getSecteurDactivites = (req, res) => {
  const q = 'SELECT * FROM secteurdactivites';

  db.query(q, (err, data) => {
    //le q represente "SELECT *FROM activites"

    //Cette requête peut renvoyer une erreur(err) ou une donnée(data)
    if (err) return res.status(500).send(err); //renvoie le message spécifique en cas d'erreur
    return res.status(200).json(data); //S'il ya pas d'erreur alors il renvoie la donnée demandée
  });
};

//Recupère un seule activité
export const getSecteurDactivite = (req, res) => {
  const activiteId = req.params.id;

  const q = 'SELECT * FROM secteurdactivites WHERE id_secteurdactivite=?';

  db.query(q, [activiteId], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
};

//Crée une activite
export const addSecteurDactivite = (req, res) => {
  const q = 'INSERT INTO secteurdactivites(`title`) VALUES (?)';

  const values = [req.body.title];

  db.query(q, [values], (err, data) => {
    if (err) return res.status(401).json(err);

    return res.json('Secteur dActivite has been created');
  });
};

//Supprime un post
export const deleteSecteurDactivite = (req, res) => {
  const activiteId = req.params.id;
  const q = 'DELETE FROM secteurdactivites WHERE id_secteurdactivite=?';

  db.query(q, [activiteId], (err, data) => {
    if (err) return res.json(err);
    return res.json('Secteur dActivite has been deleted successfully');
  });
};

//Mise à jour d'un post
export const updateSecteurDactivite = (req, res) => {
  //On récupère l'identifiant
  const activiteId = req.params.id;

  const q =
    'UPDATE secteurdactivites SET `title`=?  WHERE id_secteurdactivite=?';

  //On définit nos valeurs
  const values = [req.body.title];

  db.query(q, [...values, activiteId], (err, data) => {
    if (err) return res.status(401).json(err);

    return res.json('Secteur dActivite has been updated');
  });
};

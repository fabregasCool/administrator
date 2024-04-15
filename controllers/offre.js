import { db } from '../db.js';

//Recupère toutes les offres
export const getOffres = (req, res) => {
  const q = 'SELECT * FROM offres';

  db.query(q, (err, data) => {
    //le q represente "SELECT *FROM offres"

    //Cette requête peut renvoyer une erreur(err) ou une donnée(data)
    if (err) return res.status(500).send(err); //renvoie le message spécifique en cas d'erreur
    return res.status(200).json(data); //S'il ya pas d'erreur alors il renvoie la donnée demandée
  });
};

//Recupère un seule offre
export const getOffre = (req, res) => {
  const offreId = req.params.id;

  const q = 'SELECT * FROM offres WHERE id_offre=?';

  db.query(q, [offreId], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
};

//Crée une offre
export const addOffre = (req, res) => {
  //Inscrire notre utilisateur dans la base de données
  const q =
    'INSERT INTO offres(`title`,`description`,`img`,`id_user`) VALUES (?)';

  const values = [
    req.body.title,
    req.body.description,
    req.body.img,
    req.body.id_user,
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.status(401).json(err);

    return res.json('Offre has been created');
  });
};

//Supprime un offre
export const deleteOffre = (req, res) => {
  const offreId = req.params.id;
  const q = 'DELETE FROM offres WHERE id_offre=?';

  db.query(q, [offreId], (err, data) => {
    if (err) return res.json(err);
    return res.json('Offre has been deleted successfully');
  });
};

//Mise à jour d'un offre
export const updateOffre = (req, res) => {
  //On récupère l'identifiant
  const offreId = req.params.id;

  //   const q = 'UPDATE offres SET `title`=?,`description`=?,`img`=?, `id_user`=?';
  const q =
    'UPDATE offres SET `title`=?,`description`=?,`img`=?, `id_user`=? WHERE id_offre=?';

  //On définit nos valeurs
  const values = [
    req.body.title,
    req.body.description,
    req.body.img,
    req.body.id_user,
  ];

  db.query(q, [...values, offreId], (err, data) => {
    if (err) return res.status(401).json(err);

    return res.json('Offre has been updated');
  });
};

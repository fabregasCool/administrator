import { db } from '../db.js';
import { createError } from '../utils/error.js';

//Recupère toutes les activités
export const getEntreprises = (req, res) => {
  const q = 'SELECT * FROM entreprises';

  db.query(q, (err, data) => {
    //le q represente "SELECT *FROM entreprises"

    //Cette requête peut renvoyer une erreur(err) ou une donnée(data)
    if (err) return res.status(500).send(err); //renvoie le message spécifique en cas d'erreur
    return res.status(200).json(data); //S'il ya pas d'erreur alors il renvoie la donnée demandée
  });
};

//Recupère un seule activité
export const getEntreprise = (req, res) => {
  const entrepriseId = req.params.id;

  const q = 'SELECT * FROM entreprises WHERE entreprise_id=?';

  db.query(q, [entrepriseId], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
};

//Crée une entreprise
export const addEntreprise = (req, res, next) => {
  // Cette requete empeche les doublons de nom d'entreprise
  const q = 'SELECT * FROM entreprises WHERE raison_sociale =? ';
  db.query(q, [req.body.raison_sociale], (err, data) => {
    if (err) return res.json(err); //En cas d'erreur, on renvoi le message qui convient

    //Si il n y'a pas d'erreur, c'est que cet utilisateur existe deja dans la
    //BD donc on renvoi le message ci dessous
    if (data.length) {
      // return next(
      //   createError(
      //     400,
      //     'This Entreprise already exists, choose another raison_sociale ! '
      //   )
      // );
      return res.status(400).json({
        error: 'Une entreprise à déja ce nom, avez vous déclarer la votre?',
        link: 'http://localhost:3000/contestationEntreprise',
      });
    }

    //Inscrire notre utilisateur dans la base de données
    const q =
      'INSERT INTO entreprises(`raison_sociale`,`naiitie_id`,`rcn`,`slogan`,`taille`,`description`,`logo_url`,`couverture_url`,`localisation`) VALUES (?)';

    const values = [
      req.body.raison_sociale,
      req.body.naiitie_id,
      req.body.rcn,
      req.body.slogan,
      req.body.taille,
      req.body.description,
      req.body.logo_url,
      req.body.couverture_url,
      req.body.localisation,
    ];

    db.query(q, [values], (err, data) => {
      //if (err) return res.status(401).json(err);

      if (err) {
        return next(createError(400, "L'un des champs n'est pas renseigné"));
      }
      return res.status(200).json('Entreprise has been created');
    });
  });
};

//Supprime un post
export const deleteEntreprise = (req, res) => {
  const entrepriseId = req.params.id;
  const q = 'DELETE FROM entreprises WHERE entreprise_id=?';

  db.query(q, [entrepriseId], (err, data) => {
    if (err) return res.json(err);
    return res.json('Entreprise has been deleted successfully');
  });
};

//Mise à jour d'un post
export const updateEntreprise = (req, res) => {
  //On récupère l'identifiant
  const entrepriseId = req.params.id;

  const q =
    'UPDATE entreprises SET `raison_sociale`=?,`rcn`=?,`slogan`=?,`taille`=?,`description`=?,`logo_url`=?,`couverture_url`=?,`localisation`=? WHERE entreprise_id=?';

  //On définit nos valeurs
  const values = [
    req.body.raison_sociale,
    req.body.rcn,
    req.body.slogan,
    req.body.taille,
    req.body.description,
    req.body.logo_url,
    req.body.couverture_url,
    req.body.localisation,
  ];

  db.query(q, [...values, entrepriseId], (err, data) => {
    if (err) return res.status(401).json(err);

    return res.json('Entreprise has been updated');
  });
};

export const All_Entreprise_Of_User_Connected = (req, res) => {
  const userId = req.user.id; //On récupère le id de l'utilsateur connecté
  //console.log('userid: ' + userId);

  //   On affiche toutes les entreprises créer par l'utilisateur connecté.
  // on fait une jointure entre les deux tables afiin d'afficher les entreprises dant le id_user dans la table (users) = id_user dans la table (entreprise)
  const q =
    'SELECT e.* FROM entreprises e JOIN users u ON e.id_user = u.id_user WHERE u.id_user =?';

  db.query(q, [userId], (err, data) => {
    //le q represente "SELECT *FROM entreprises"

    //Cette requête peut renvoyer une erreur(err) ou une donnée(data)
    if (err) return res.status(500).send(err); //renvoie le message spécifique en cas d'erreur
    return res.status(200).json(data); //S'il ya pas d'erreur alors il renvoie la donnée demandée
  });
};

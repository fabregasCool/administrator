import { db } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { createError } from '../utils/error.js';

//Recupère tous les utilisateurs
export const getNaiities = (req, res) => {
  const q = 'SELECT * FROM naiitie';

  db.query(q, (err, data) => {
    //le q represente "SELECT naiitie_id,nom, prenom,email,profile... FROM naiitie"

    //Cette requête peut renvoyer une erreur(err) ou une donnée(data)
    if (err) return res.status(500).send(err); //renvoie le message spécifique en cas d'erreur
    return res.status(200).json(data); //S'il ya pas d'erreur alors il renvoie la donnée demandée
  });
};

//Recupérer un seul utilisateur
export const getNaiitie = (req, res) => {
  const userMatricule = req.params.matricule;

  const q = 'SELECT * FROM naiitie WHERE matricule=?';

  db.query(q, [userMatricule], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
};

//Créer un utilisateur (En fait on ne doit pas faire cela, car c'est le login qui crée un nouvel utilisateur)
//Mais on laisse afin que l'admin puisse créer d'autres utilisateurs si on est déja dans l'application
export const createNaiitie = (req, res) => {
  //CHECK EXISTING USER (On Vérifie si cet utilisateur existe déja dans BDD à partir de son email)

  const q = 'SELECT * FROM naiitie WHERE email =? ';
  db.query(q, [req.body.email], (err, data) => {
    if (err) return res.json(err); //En cas d'erreur, on renvoi le message qui convient

    //Si il n y'a pas d'erreur, c'est que cet utilisateur existe deja dans la
    //BD donc on renvoi le message ci dessous
    if (data.length) return res.status(409).json('Naiitie already exists!');

    //LE CAS OU L'UTILISATEUR N'EXISTE PAS DANS LA BASE DE DONNEE

    //Hash the password and create a user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    //Inscrire notre utilisateur dans la base de données
    const q =
      'INSERT INTO naiitie(`nom`,`prenom`,`email`,`phone`,`password`)VALUES(?)';
    const values = [
      req.body.nom,
      req.body.prenom,
      req.body.email,
      req.body.phone,
      hash,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json('Naiitie has been created!');
    });
  });
};

//Supprimer un utilisateur
export const deleteNaiitie = (req, res) => {
  const userMatricule = req.params.matricule;
  const q = 'DELETE FROM naiitie WHERE matricule=?';

  db.query(q, [userMatricule], (err, data) => {
    if (err) return res.json(err);
    return res.json('Naiitie has been deleted successfully');
  });
};

//Modifier un utilisateur
export const updateProfile = (req, res) => {
  const userMatricule = req.user.matricule;
  //console.log(userId);

  // Récupérer les informations de cet utilisateur
  const q =
    'UPDATE naiitie SET `nom`=?,`prenom`=?,`email`=?,`phone`=?,`genre`=?,`naissance`=?,`photo`=?,`profile`=?,`presentation`=?,`cv`=? WHERE matricule=? ';

  const values = [
    req.body.nom,
    req.body.prenom,
    req.body.email,
    req.body.phone,
    req.body.genre,
    req.body.naissance,
    req.body.photo,
    req.body.profile,
    req.body.presentation,
    req.body.cv,
  ];

  db.query(q, [...values, userMatricule], (err, data) => {
    if (err) return res.json(err);
    //
    const q = 'SELECT * FROM naiitie WHERE matricule=?';

    //On verifie si le mail existe dans la base de données
    db.query(q, [userMatricule], (err, data) => {
      if (err) return res.json(err);
      if (data.length === 0) return res.status(404).json('Naiitie not found '); //Si data.lenght===0, cela signifie que
      //nous n'avons aucun utilisateur avec ce id d'utilisateur en BDD

      //SI MOT DE PASSE ET EMAIL CORRECT, on va se connecter
      //Mais d'abord on crée un jeton d'accès pour crypter ses infos(ici ce sera l'id utilisateur) pour plus de sécurité
      const token = jwt.sign(
        { matricule: data[0].matricule },
        process.env.JWT_SECRET_KEY
      ); //on insère dans le jeton l'identifiant de l'utilisateur, qui nous servira à identifier notre utilisateur

      //On renvoie les informations de l'utilisateur(other) et le token
      const { password, ...other } = data[0]; //Sépare le mot de passe des autres informations utilisateurs
      res.status(201).json({ ...other, token });
    });
    //
    //return res.json('Naiitie has been updated successfully');
  });
};

//Mot de passe oublié (Grace à cette route, on envoie le mail dans la boite de l'utilisateur)
export const forgotPasswordNaiitie = async (req, res, next) => {
  try {
    // On sélectionne dans la table "naiitie" l'utilisateur ayant l'email entré par l'utilisateur
    const q = 'SELECT * FROM naiitie WHERE email=?';

    db.query(q, [req.body.email], (err, oldNaiitie) => {
      if (err) return res.json(err);
      if (oldNaiitie.length === 0) {
        return next(
          createError(400, "Cet Utilisateur avec ce mail n'existe pas ")
        ); //Si oldNaiitie.lenght===0, cela signifie que nous n'avons aucun utilisateur avec ce email d'utilisateur en BDD
      }
      // Si l'utilisateur existe alors:
      else {
        // On fait un boucle pour recupérer les infos qui sont dans "oldNaiitie" et on les transfèrent dans userInfo
        for (let index = 0; index < oldNaiitie.length; index++) {
          const userInfo = oldNaiitie[index];
          //console.log("email de l'utilisateur: " + userInfo.email);

          const secret = process.env.JWT_SECRET_KEY + userInfo.password; //on cree une variable combinant JWT_SECRET_KEY et l'ancien mot de passe

          // Ensuite on crée un token contenant le mail et le id de l'utilisateur, il s'expire après 5 min
          const token = jwt.sign(
            { email: userInfo.email, matricule: userInfo.matricule },
            secret,
            {
              expiresIn: '10m',
            }
          );
          const link = `http://localhost:2024/api/naiities/reset-password/${userInfo.matricule}/${token}`; //C'est ce lien qu'on envoi dans la boite mail

          // NodeMailer
          var transporter = nodemailer.createTransport({
            service: 'hotmail',
            auth: {
              user: 'fabregas_104@hotmail.fr', //Email Admin
              pass: '@03323466Aa', //Mot de passe de l'email Admin
            },
          });

          var mailOptions = {
            from: 'fabregas_104@hotmail.fr', //Email Admin
            to: userInfo.email, //Le mail qui reçoit le lien pour réinitialiser le mot de passe
            subject: 'Password Reset, Ce lien expira dans 10 minutes',
            text: link, //Le lien envoyé
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email send: ' + info.response);
            }
          });
          //console.log(link);
        }
        return res.json(
          'Vérifiez votre boite de messagérie, un lien de réinitialisation de mot de passe y a été envoyé'
        ); //Pas nécéssaire, juste pour vérification
      }
    });
  } catch (err) {
    //   next(err);
    res.status(501).json(err);
  }
};

//Mot de passe oublié (Celui ci est un get, il permet d'afficher l'émail de l'utilisateur et le formualire pour réinitailser)
export const resetPasswordGetNaiitie = async (req, res, next) => {
  try {
    const { matricule, token } = req.params; //On peut décomposer cette ligne qui se représente par les deux lignes du bas
    //const matricule = req.params;
    // const token = req.params;

    //console.log("l'identifiant est: " + matricule);
    //console.log('le token  est: ' + token);

    ///
    // On recherche l'utilisateur à qui appartient l'id se trouvant dans l'url
    const q = 'SELECT * FROM naiitie WHERE matricule=?';

    db.query(q, [matricule], (err, data) => {
      if (err) return res.json(err);

      if (data.length === 0) {
        return next(
          createError(400, "Cet Utilisateur avec ce mail n'existe pas ")
        ); //Si data.lenght===0, cela signifie que nous n'avons aucun utilisateur avec ce email d'utilisateur en BDD
      } else {
        // On fait une boucle sur "data" qui contient les infos utilisateur
        for (let index = 0; index < data.length; index++) {
          const userInfo = data[index];
          //console.log('Mot de passe Utilisateur: ' + userInfo.password);

          //   On crée une variable secret
          const secret = process.env.JWT_SECRET_KEY + userInfo.password;
          //console.log('Secret: ' + secret);

          // On vérifie si "secret" est valide
          try {
            const verify = jwt.verify(token, secret);
            res.render('index', { email: verify.email, status: 'verified' });
          } catch (error) {
            //console.log(error);
            res.send('Not Verified');
          }
        }
      }
    });
  } catch (err) {
    //   next(err);
    res.status(501).json(err);
  }
};

//Mot de passe oublié (Formulaire qui envoie le nouveau password)
export const resetPasswordPostNaiitie = async (req, res, next) => {
  const { matricule } = req.params;

  const { password, confirm_password } = req.body; //On recupère les champs saisi par le user

  // On exécute le code à condition que les 2 mots de passe soient identique
  if (password === confirm_password) {
    const q = 'SELECT * FROM naiitie WHERE matricule=?';

    db.query(q, [matricule], (err, data) => {
      if (err) return res.json(err);

      if (data.length === 0) {
        return next(
          createError(400, "Cet Utilisateur avec ce mail n'existe pas ")
        ); //Si data.lenght===0, cela signifie que nous n'avons aucun utilisateur avec ce email d'utilisateur en BDD
      } else {
        try {
          const hash = bcrypt.hashSync(password, 10);

          // Récupérer les informations de cet utilisateur
          const q = 'UPDATE naiitie SET `password`=? WHERE matricule =? ';

          const values = [hash];

          db.query(q, [...values, matricule], (err, data) => {
            if (err) return res.json(err);
            // return res.json(
            //   'Bravo!!! La mise à jour du mot de passe est un succès'
            // );
            // Rediriger vers une page du frontend en cas de succès
            return res.redirect('http://localhost:3000/login?success=true');
          });
        } catch (error) {
          console.log(error);
          res.send("Quelque chose s'est mal passé");
          //app.use(express.urlencoded({ extended: false })); Si il y a erreur,Ecrire cette ligne dans index.js
        }
      }
    });
  } else {
    return next(createError(400, 'Les deux mots de passes sont différents '));
    // res.send('Les deux mots de passes sont différents');
  }
};

//Modifier Mot de passe oublié étant connecté
export const updateAncienPassword = (req, res, next) => {
  const userMatricule = req.user.matricule;
  //console.log(userId);

  const plainPassword = req.body.password; //Mot de passe qu'il saisi dans le formulaire

  // Recupérer les informations de l'utilisateur qui connecté
  const q = 'SELECT * FROM naiitie WHERE matricule=?';

  db.query(q, [userMatricule], (err, userInfo) => {
    if (err) return res.json(err);

    const hashedPassword = userInfo[0].password;
    //console.log('Ancien mot de passe: ' + hashedPassword);
    // hashedPassword: c'est le mot de passe qui est stocké dans la BDD et qui appartient à l'uilisateur connecté
    //

    // On compare le mot de passe saisi dans le formulaire(plainPassword) avec le mot de passe qui se trouve dans la BDD(hashedPassword)
    bcrypt.compare(plainPassword, hashedPassword, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      if (result) {
        // Le cas où les deux mots de passes (formulaire(plainPassword) et BDD(hashedPassword)) sont identiques
        //console.log('Le mot de passe est correct');

        //Hash the new password (Crypter le nouveau mot de passe qui se trouve dans le champ "new_password")
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.new_password, salt);

        const q = 'UPDATE naiitie SET `password`=? WHERE matricule=? ';

        const values = [hash];

        db.query(q, [...values, userMatricule], (err, data) => {
          if (err) return res.json(err);
          //
          const q = 'SELECT * FROM naiitie WHERE matricule=?';

          //On verifie si le mail existe dans la base de données
          db.query(q, [userMatricule], (err, data) => {
            if (err) return res.json(err);
            if (data.length === 0)
              return res.status(404).json('Naiitie not found '); //Si data.lenght===0, cela signifie que
            //nous n'avons aucun utilisateur avec ce id d'utilisateur en BDD

            //SI MOT DE PASSE ET EMAIL CORRECT, on va se connecter
            //Mais d'abord on crée un jeton d'accès pour crypter ses infos(ici ce sera l'id utilisateur) pour plus de sécurité
            const token = jwt.sign(
              { matricule: data[0].matricule },
              process.env.JWT_SECRET_KEY
            ); //on insère dans le jeton l'identifiant de l'utilisateur, qui nous servira à identifier notre utilisateur

            //On renvoie les informations de l'utilisateur(other) et le token
            const { password, ...other } = data[0]; //Sépare le mot de passe des autres informations utilisateurs
            res.status(201).json({ ...other, token });
          });
          //
          //return res.json('Naiitie has been updated successfully');
        });
      }
      // Le cas où les deux mots de passe sont différents
      else {
        //console.log('Le mot de passe est incorrect');
        //return res.json("L'ancien mot de passe est incorrect");
        return next(createError(400, "L'ancien mot de passe est incorrect "));
      }
    });
    //
    //return res.json(userInfo[0].password);
  });
};

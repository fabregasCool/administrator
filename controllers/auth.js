import { db } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { createError } from '../utils/error.js';

// 1ere Etape de l'inscription
export const register_first_step = async (req, res, next) => {
  try {
    // Générer un code aléatoire
    const codeAleatoire = Math.floor(1000 + Math.random() * 90000); // Code à 4 chiffres

    //On vérifie si le email saisi existe déja dans la base de données
    const qe = 'SELECT * FROM naiitie WHERE email =? ';
    db.query(qe, [req.body.email], (err, data) => {
      if (err) return res.json(err);

      //si le email existe deja dans la BDD on réinitialise le code aléatoire
      if (data.length) {
        const q = 'UPDATE naiitie SET `code`=? WHERE email=? ';

        const values = [codeAleatoire];

        db.query(q, [...values, req.body.email], (err, data) => {
          if (err) return res.json(err);
          return res.json('Utilisateur à été modifié avec succès');
        });

        // NodeMailer (On envoie le code généré dans le mail)
        var transporter = nodemailer.createTransport({
          service: 'hotmail',
          auth: {
            user: 'fabregas_104@hotmail.fr', //Email Admin
            pass: '@03323466Aa', //Mot de passe de l'email Admin
          },
        });

        var mailOptions = {
          from: 'fabregas_104@hotmail.fr', //Email Admin
          to: req.body.email, //Le mail qui reçoit le lien pour réinitialiser le mot de passe
          subject:
            "Code de vérification pour l'inscription sur l'application ADMINISTRATOR",
          text: `Votre code de vérification est : ${codeAleatoire}`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            // console.log(error);
            res.status(500).send("Erreur lors de l'envoi de l'e-mail");
          } else {
            // console.log('E-mail envoyé : ' + info.response);
            res.status(200).send('E-mail envoyé avec succès');
          }
        });
      }
      // Si le email n'existe pas, donc c'est un nouvel utilisateur, on crée l'utilisateur
      else {
        //Inscrire notre utilisateur dans la base de données
        const q = 'INSERT INTO naiitie(`email`,`code`)VALUES(?)';
        const values = [req.body.email, codeAleatoire];

        db.query(q, [values], (err, data) => {
          if (err) return res.json(err);
          return res
            .status(200)
            .json(
              "Première Etape réussie, utilisé le code envoyé dans votre boite de messagérie pour terminer l'inscription !"
            );
        });

        // NodeMailer (On envoie le code généré dans le mail)
        var transporter = nodemailer.createTransport({
          service: 'hotmail',
          auth: {
            user: 'fabregas_104@hotmail.fr', //Email Admin
            pass: '@03323466Aa', //Mot de passe de l'email Admin
          },
        });

        var mailOptions = {
          from: 'fabregas_104@hotmail.fr', //Email Admin
          to: req.body.email, //Le mail qui reçoit le lien pour réinitialiser le mot de passe
          subject:
            "Code de vérification pour l'inscription sur l'application ADMINISTRATOR",
          text: `Votre code de vérification est : ${codeAleatoire}`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            // console.log(error);
            res.status(500).send("Erreur lors de l'envoi de l'e-mail");
          } else {
            // console.log('E-mail envoyé : ' + info.response);
            res.status(200).send('E-mail envoyé avec succès');
          }
        });
      }
    });
  } catch (err) {
    //   next(err);
    res.status(501).json(err);
  }
};

//S'inscrire (Register)
export const register_second_step = (req, res, next) => {
  //CHECK EXISTING USER (On Vérifie si cet utilisateur existe déja dans BDD à partir de son email)

  //console.log('code saisi par user :' + req.body.code);
  //console.log('email saisi par user :' + req.body.email);

  // On recherche l'utilisateur à qui appartient l'id se trouvant dans l'url
  const q = 'SELECT * FROM naiitie WHERE email=?';

  try {
    db.query(q, [req.body.email], (err, data) => {
      if (err) return res.json(err);

      if (data.length === 0) {
        return next(createError(400, 'Email Incorrect ')); //Si data.lenght===0, cela signifie que nous n'avons aucun utilisateur avec ce email d'utilisateur en BDD
      } else {
        for (let index = 0; index < data.length; index++) {
          const userInfo = data[index];
          //console.log("email de l'utilisateur: " + userInfo.email);
          //console.log("code de l'utilisateur: " + userInfo.code);

          if (
            req.body.code === userInfo.code &&
            req.body.email === userInfo.email
          ) {
            //return res.status(200).json(data);

            // Génération du matricule

            const date = new Date();
            const annee = date.getFullYear().toString(); // Obtenez les deux derniers chiffres de l'année
            const mois = ('0' + (date.getMonth() + 1)).slice(-2); // Ajoutez un zéro devant si le mois est inférieur à 10

            // Générez un numéro d'identification fictif
            const NI = 'NI';

            const codeAleatoire = Math.floor(1000 + Math.random() * 9000); // Code à 4 chiffres

            // Concaténez les différentes parties pour former le matricule
            const matriculeAléatoire = `${NI}${annee}${mois}${codeAleatoire}`;
            // Fin Génération du matricule

            //Hash the password and create a user
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);
            const q =
              'UPDATE naiitie SET `nom`=?,`prenom`=?,`password`=?,`phone`=?,`matricule`=? WHERE email=?';

            //On définit nos valeurs
            const values = [
              req.body.nom,
              req.body.prenom,
              hash,
              req.body.phone,
              matriculeAléatoire,
            ];

            db.query(q, [...values, userInfo.email], (err, data) => {
              if (err) return res.status(401).json(err);

              //return res.json('User has been updated');

              // SI TOUT EST BON ON SE CONNECTE AUTOMATIQUEMENT
              const q = 'SELECT * FROM naiitie WHERE email=?';

              //On verifie si le mail existe dans la base de données
              db.query(q, [req.body.email], (err, data) => {
                if (err) return res.json(err);
                if (data.length === 0)
                  return res.status(404).json('Email Incorrect '); //Si data.lenght===0, cela signifie que
                //nous n'avons aucun utilisateur avec ce email d'utilisateur en BDD

                //CHECK PASSWORD (On compare les deux mots de passe)
                const isPasswordCorrect = bcrypt.compareSync(
                  req.body.password, //mot de passe envoyé par l'utilisateur
                  data[0].password
                  //data est un tableau contenant toutes les infos utilsateur venant de la BD, de facto le mot de passe
                );

                //Si Mot de passe incorrect
                if (!isPasswordCorrect)
                  return res.status(400).json('Mot de passe incorrect');

                //SI MOT DE PASSE ET EMAIL CORRECT, on va se connecter
                //Mais d'abord on crée un jeton d'accès pour crypter ses infos(ici ce sera le matricule au lieu du id utilisateur) pour plus de sécurité
                const token = jwt.sign(
                  { matricule: data[0].matricule },
                  process.env.JWT_SECRET_KEY
                ); //on insère dans le jeton l'identifiant de l'utilisateur, qui nous servira à identifier notre utilisateur

                //On renvoie les informations de l'utilisateur(other) et le token
                const { password, ...other } = data[0]; //Sépare le mot de passe des autres informations utilisateurs
                res.status(201).json({ ...other, token });
              });
            });
          } else {
            return next(createError(404, 'Code de Verification Invalide'));
          }
        }
      }
    });
  } catch (error) {
    return next(createError(404, "L'adresse mail est incorrecte!!!"));
  }
};

//Se connecter (Login)
export const login = (req, res) => {
  //CHECK EXISTING USER
  const q = 'SELECT * FROM naiitie WHERE phone=?';

  //On verifie si le mail existe dans la base de données
  db.query(q, [req.body.phone], (err, data) => {
    if (err) return res.json(err);
    if (data.length === 0)
      return res.status(404).json('Numéro de téléphone incorrect '); //Si data.lenght===0, cela signifie que
    //nous n'avons aucun utilisateur avec ce email d'utilisateur en BDD

    //CHECK PASSWORD (On compare les deux mots de passe)
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password, //mot de passe envoyé par l'utilisateur
      data[0].password
      //data est un tableau contenant toutes les infos utilsateur venant de la BD, de facto le mot de passe
    );

    //Si Mot de passe incorrect
    if (!isPasswordCorrect)
      return res.status(400).json('Mot de passe incorrect');

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
};

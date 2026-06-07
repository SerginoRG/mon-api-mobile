require('dotenv').config(); // npm install dotenv

const express = require('express');  // npm install express
const bcrypt = require('bcrypt');     // npm install bcrypt
const { PrismaClient } = require('@prisma/client'); // npm install prisma @prisma/client 
const { Pool } = require('pg'); 
const cors = require("cors");


const app = express();

const prisma = new PrismaClient(); 

app.use(cors());
app.use(express.json());      // npm install pg


app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

//--------Test connexion PostgreSQL-------
pool.connect((err, client, release) => {
  if (err) {
    return console.error(
      'Erreur de connexion à la base de données :',
      err.message
    );
  }
  console.log('Connecté à PostgreSQL avec succès !');
  release();
});

//-------Route test-----------
app.get('/', (req, res) => {
  console.log('API marche');
  res.send('API fonctionne');
});

//-----------Créer utilisateur----------
app.post('/api/users', async (req, res) => {
  // 1. Sécurisation de la récupération du body
  const { name, email, password, image } = req.body || {};

  // Validation des champs requis
  if (!name || !email || !password) {
    return res.status(400).json({
      erreur: 'Les champs name, email, et password sont requis',
    });
  }

  try {
    // 2. Vérifier si l'email existe déjà (Évite une erreur brute de la base de données)
    const existingUser = await prisma.User.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return res.status(400).json({
        erreur: "Cet email est déjà utilisé."
      });
    }

    // Hasher le mot de passe avec bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Création de l'utilisateur avec gestion du champ image
    const user = await prisma.User.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image: image || "", // Évite une erreur Prisma si le champ 'image' n'est pas fourni
      },
    });

    // 4. Sécurité : Ne JAMAIS renvoyer le mot de passe (même hashé) dans la réponse
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json(userWithoutPassword);

  } catch (error) {
    // 5. Gestion d'erreur plus propre pour la production
    console.error("Erreur inscription:", error);
    res.status(500).json({
      erreur: "Une erreur interne est survenue lors de l'inscription.",
    });
  }
});

//-----------Connexion utilisateur (Login)----------
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body || {};

  // 1. Validation des champs requis
  if (!email || !password) {
    return res.status(400).json({
      erreur: 'Les champs email et password sont requis',
    });
  }

  try {
    // 2. Recherche de l'utilisateur par son email
    const user = await prisma.User.findFirst({
      where: {
        email: email,
      },
    });

    // 3. Si l'utilisateur n'existe pas
    if (!user) {
      return res.status(401).json({
        erreur: 'Email incorrect',
      });
    }

    // 4. Vérification du mot de passe avec bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        erreur: 'Mot de passe incorrect',
      });
    }

    // 5. Connexion réussie
    res.status(200).json({
      message: 'Connexion réussie !',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({
      erreur: error.message,
    });
  }
});


//-----------Récupérer tous les utilisateurs (SELECT *)----------
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.User.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      erreur: error.message,
    });
  }
});



// ----------- Créer visiteur ----------
app.post('/api/visiteurs', async (req, res) => {
  const { nom, nbrjours, tarifjournalier } = req.body || {};

  // Validation correcte
  if (!nom || nbrjours == null || tarifjournalier == null) {
    return res.status(400).json({
      erreur: 'Les champs nom, nbrjours et tarifjournalier sont requis',
    });
  }

  try {
    const visiteur = await prisma.visiteur.create({
      data: {
        nom,
        nbrjours: Number(nbrjours),
        tarifjournalier: Number(tarifjournalier),
      },
    });

    res.status(201).json(visiteur);
  } catch (error) {
    res.status(400).json({
      erreur: error.message,
    });
  }
});

// ----------- Modifier visiteur ----------
app.put('/api/visiteurs/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, nbrjours, tarifjournalier } = req.body || {};

  try {
    const visiteur = await prisma.visiteur.update({
      where: {
        id: Number(id),
      },
      data: {
        nom,
        nbrjours: nbrjours !== undefined ? Number(nbrjours) : undefined,
        tarifjournalier:
          tarifjournalier !== undefined ? Number(tarifjournalier) : undefined,
      },
    });

    res.status(200).json(visiteur);
  } catch (error) {
    res.status(400).json({
      erreur: error.message,
    });
  }
});


// ----------- Supprimer visiteur ----------
app.delete('/api/visiteurs/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const visiteur = await prisma.visiteur.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      message: 'Visiteur supprimé avec succès',
      data: visiteur,
    });
  } catch (error) {
    res.status(400).json({
      erreur: error.message,
    });
  }
});


// ----------- Récupérer tous les visiteurs
app.get('/api/visiteurs', async (req, res) => {
  try {
    const visiteurs = await prisma.visiteur.findMany();

    res.status(200).json(visiteurs);
  } catch (error) {
    res.status(500).json({
      erreur: error.message,
    });
  }
});


//----------Lancement serveur-----------
app.listen(3000, "0.0.0.0", () => {
  console.log("Serveur lancé sur le port 3000");
});
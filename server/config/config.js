// ============================
//  Puerto
// ============================
process.env.PORT = process.env.PORT || 3000;



// ============================
//  Entorno
// ============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';



// ============================
// Token ExpireIn
// ============================
process.env.CADUCIDAD_TOKEN = '48h';



// ============================
//  Token Secret
// ============================
process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'seed-development';



// ============================
//  Base de datos
// ============================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;



// ============================
//  Client ID google
// ============================
process.env.CLIENT_ID = process.env.CLIENT_ID || '280988252285-lck8std4nr36kjhmf2qt8ampilni6thk.apps.googleusercontent.com';


require('dotenv').config();
const express = require('express');
const dbConnect = require('./config/mongo');
const app = express();

app.use(express.json());
dbConnect();

// Rutas de autenticación

// Comenzar el server
app.listen(process.env.PORT, () => {
    console.log('Servidor escuchando en el puerto 3000');
});


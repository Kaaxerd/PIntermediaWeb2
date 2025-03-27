require('dotenv').config();
const express = require('express');
const dbConnect = require('./config/mongo');
const bodyParser = require('body-parser');

// Rutas
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes); // Rutas de autentificación

// Comenzar el server
app.listen(process.env.PORT, () => {
    console.log('Servidor escuchando en el puerto 3000');
});

dbConnect();
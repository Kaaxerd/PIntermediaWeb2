const { matchedData, body } = require("express-validator")
const { tokenSign } = require("../utils/handleJwt")
const { encrypt, compare } = require("../utils/handlePassword")
const {handleHttpError} = require("../utils/handleHttpError")
const {usersModel} = require("../models")
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const bcrypt = require("bcrypt")

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendVerificationMail = async (email, verificationCode) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verificación de correo',
        text: `Tu código de verificación es: ${verificationCode}`
    }

    try {
        await transporter.sendMail(mailOptions);
    } catch {
        console.log("Error al enviar el correo");
    }
}

/**
 * Encargado de registrar un nuevo usuario
 * @param {*} req 
 * @param {*} res 
 */
const registerCtrl = async (req, res) => {
    try {
        req = matchedData(req);
        /* const password = await encrypt(req.password);
            console.log("Hash generado: ", password); */
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Código de verificación de 6 números
        const body = {...req, verificationCode} // Con "..." duplicamos el objeto y le añadimos o sobreescribimos una propiedad
        const dataUser = await usersModel.create(body); 
        dataUser.set('password', undefined, { strict: false });

        //await sendVerificationMail(dataUser.email, verificationCode);

        const data = {
            token: await tokenSign(dataUser),
            user: dataUser,
            verificationCode: dataUser.verificationCode
        }
        
        res.send(data);
    }catch(err) {
        console.log(err);
        handleHttpError(res, "ERROR_REGISTER_USER");
    }
}

const verifyEmailCtrl = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        // Buscar al usuario por su correo electrónico
        const user = await usersModel.findOne({ email });

        if (!user) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);  // Si no existe el usuario, error 404
        }

        // Verificar si el código de verificación es correcto
        if (user.verificationCode !== verificationCode) {
            // Si el código no coincide, devolver un error 400 (Bad Request)
            return res.status(400).send({
                message: "Código de verificación incorrecto"
            });
        }

        // Si el código es correcto, actualizar el estado de verificación
        user.verified = true;
        await user.save();  // Guardar los cambios en la base de datos

        // Devolver una respuesta exitosa
        res.send({ message: "Correo electrónico verificado correctamente" });

    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_VERIFY_EMAIL");  // Si hay un error en el proceso, manejarlo
    }
};


/**
 * Encargado de hacer login del usuario
 * @param {*} req 
 * @param {*} res 
 */
const loginCtrl = async (req, res) => {
    console.log("Intento de login: ", req.body.email);

    try {
        req = matchedData(req)
            console.log("Datos del login después de matchedData: ", req);
        const user = await usersModel.findOne({ email: req.email }).select("password name role email verified")

        if(!user){ // Usuario no encontrado
            handleHttpError(res, "USER_NOT_EXISTS", 404)
            return
        }

        if(!user.verified){ // Usuario no verificado
            handleHttpError(res, "USER_NOT_VERIFIED", 403)
            return
        }
        
        console.log('Password provided:', req.password);
        console.log('Stored password hash:', user.password);

        // Comparar la contraseña proporcionada con el hash almacenado
        const isPasswordCorrect = await compare(req.password, user.password);

        console.log('Password match result:', isPasswordCorrect);  // Verifica si las contraseñas coinciden
        if (!isPasswordCorrect) {
            return handleHttpError(res, "INVALID_PASSWORD", 401);  // Si la contraseña no es correcta
        }

        user.set('password', undefined, { strict: false });  // No incluir la contraseña en la respuesta
        const data = {
            token: await tokenSign(user),  // Generar el token JWT
            user: user  // Devolver los datos del usuario
        };

        res.send(data);
    } catch(err) {
        console.log(err)
        handleHttpError(res, "ERROR_LOGIN_USER")
    }
}

const getUserCtrl = async (req, res) => {
    try {
        const { id } = matchedData(req)
        const user = await usersModel.findById(id).select("-password -__v")

        if(!user) {
            handleHttpError(res, "USER_NOT_FOUND", 404)
            return
        }

        res.send(user)
    } catch (err) {
        console.log(err)
        handleHttpError(res, "ERROR_GET_USER")
    }
}

const updateUserCtrl = async (req, res) => {
    try {
        const { id } = req.params; // Obtenemos el id desde los parámetros de la URL
        const updateData = req.body; // Filtra los datos válidos (esto incluirá el id si se pasa en el body, pero lo usaremos de params)
        
        // Actualizamos el usuario (asumiendo que el id en la base de datos es _id)
        const updatedUser = await usersModel.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!updatedUser) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);
        }
        
        res.send(updatedUser);
    } catch (err) {
        console.log(err)
        handleHttpError(res, "ERROR_UPDATE_USER")
    }
}

const getUserFromTokenCtrl = async (req, res) => {
    console.log("Decoded token payload:", req.user);

    try {
        const userId = req.user._id;
        const user = await usersModel.findById(userId).select("-password")

        if(!user) {
            handleHttpError(res, "USER_NOT_FOUND", 404)
            return
        }

        res.send(user)
    } catch (err) {
        console.log(err)
        handleHttpError(res, "ERROR_GET_USER")
    }
} 

module.exports = { registerCtrl, loginCtrl, verifyEmailCtrl, getUserCtrl, updateUserCtrl, getUserFromTokenCtrl }
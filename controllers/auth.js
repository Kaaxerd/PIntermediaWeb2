const { matchedData } = require("express-validator")
const { tokenSign } = require("../utils/handleJwt")
const { encrypt, compare } = require("../utils/handlePassword")
const {handleHttpError} = require("../utils/handleHttpError")
const {usersModel} = require("../models")
const nodemailer = require('nodemailer')
const crypto = require('crypto')

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
        const password = await encrypt(req.password);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Código de verificación de 6 números
        const body = {...req, password, verificationCode} // Con "..." duplicamos el objeto y le añadimos o sobreescribimos una propiedad
        const dataUser = await usersModel.create(body);
        //Si no queremos que se devuelva el hash con "findOne", en el modelo de users ponemos select: false en el campo password
        //Además, en este caso con "create", debemos setear la propiedad tal que:  
        dataUser.set('password', undefined, { strict: false });

        await sendVerificationMail(dataUser.email, verificationCode);

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
    try {
        req = matchedData(req)
        const user = await usersModel.findOne({ email: req.email }).select("password name role email")

        if(!user){
            handleHttpError(res, "USER_NOT_EXISTS", 404)
            return
        }
        
        const hashPassword = user.password;
        const check = await compare(req.password, hashPassword)

        if(!check){
            handleHttpError(res, "INVALID_PASSWORD", 401)
            return
        }

        //Si no quisiera devolver el hash del password
        user.set('password', undefined, {strict: false})
        const data = {
            token: await tokenSign(user),
            user
        }

        res.send(data)

    }catch(err){
        console.log(err)
        handleHttpError(res, "ERROR_LOGIN_USER")
    }
}

module.exports = { registerCtrl, loginCtrl, verifyEmailCtrl }
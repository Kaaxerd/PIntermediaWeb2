const Company = require('../models/nosql/company');
const usersModel = require('../models/nosql/users');
const { handleHttpError } = require('../utils/handleHttpError');

const createCompanyCtrl = async (req, res) => {
    try {
        const companyData = req.body;
        const newCompany = await Company.create(companyData);
        res.status(201).send(newCompany);
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_CREATE_COMPANY");
    }
};

const updateCompanyCtrl = async (req, res) => {
    try {
        // Obtenemos el id de la compañía desde los parámetros de la URL
        const { id } = req.params;
        // Obtenemos los datos a actualizar del body (ya deberían haber sido validados)
        const updateData = req.body;
        
        // Actualizamos el documento usando findByIdAndUpdate,
        // { new: true } devuelve el documento actualizado y runValidators:true valida los datos.
        const updatedCompany = await Company.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        
        if (!updatedCompany) {
            return handleHttpError(res, "COMPANY_NOT_FOUND", 404);
        }
        
        res.send(updatedCompany);
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_UPDATE_COMPANY");
    }
};

module.exports = { createCompanyCtrl, updateCompanyCtrl };
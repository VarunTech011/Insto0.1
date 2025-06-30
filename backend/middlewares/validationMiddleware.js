const Joi = require('joi');


const registerValidation = (req, res, next) => {
    const schema = Joi.object({
        firstName: Joi.string().min(2).max(50).required(),
        lastName: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(100).required(),
        confirmPassword: Joi.any().valid(Joi.ref('password')).required()
            .messages({ 'any.only': 'Passwords do not match' })
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            message: "Validation error",
            errors: error.details.map(err => err.message)
        });
    }
    next();
};

const loginValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(100).required()
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            message: "Validation error",
            errors: error.details.map(err => err.message)
        });
    }
    next();
};

module.exports = {
    registerValidation,
    loginValidation
};

import Joi from 'joi';

export const email_schema = Joi.string().email().required();
export const password_schema = Joi.string()
    .min(8)
    .pattern(new RegExp('^[a-zA-Z0-9]{6,30}$'))
    .required();

export const AuthSchema = Joi.object({
    firstName: Joi.string().min(1).max(25).required(),
    lastName: Joi.string(),
    email: email_schema,
    password: password_schema,
});

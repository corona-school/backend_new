import Joi from 'joi';

export const AuthSchema = Joi.object({
    firstName: Joi.string().min(1).max(25).required(),
    lastName: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(8).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
});

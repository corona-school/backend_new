import Joi from 'joi';

export const passwordSchema = Joi.object({
    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^[a-zA-Z0-9]{6,30}$'))
        .required(),
});

export const emailSchema = Joi.object({
    email: Joi.string().email().required(),
});

export const loginSchema = Joi.object({
    email: emailSchema,
    password: passwordSchema,
});

export const registerDataSchema = Joi.object({
    firstName: Joi.string().min(1).max(25).required(),
    lastName: Joi.string(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^[a-zA-Z0-9]{6,30}$'))
        .required(),
});

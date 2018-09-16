import * as Joi from 'joi';

export const post = {
  id: Joi.string(),
  title: Joi.string(),
  content: Joi.object(),
  tags: Joi.array(),
  dateAdded: Joi.date(),
  dateModified: Joi.date(),
  user: Joi.string(),
  public: Joi.boolean()
};

export const user = {
  username: Joi.string()
    .alphanum()
    .min(2)
    .max(30)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string().required()
};

export const ughhAuthUser = Joi.alternatives().try(
  Joi.object({
    username: Joi.string()
      .alphanum()
      .min(2)
      .max(30)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().required()
  }),
  Joi.object({
    username: Joi.string()
      .alphanum()
      .min(2)
      .max(30)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().required()
  })
);

export const authUser = {
  user: Joi.alternatives().try(
    Joi.string()
      .alphanum()
      .min(2)
      .max(30),
    Joi.string().email()
  ),
  password: Joi.string().required()
};

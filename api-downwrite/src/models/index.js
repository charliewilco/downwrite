const Joi = require('joi')

exports.post = {
  id: Joi.string(),
  title: Joi.string(),
  content: Joi.object(),
  tags: Joi.array(),
  dateAdded: Joi.date(),
  dateModified: Joi.date(),
  user: Joi.string(),
  public: Joi.boolean()
}

exports.user = {
  username: Joi.string()
    .alphanum()
    .min(2)
    .max(30)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string().required()
}

exports.ughhAuthUser = Joi.alternatives().try(
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
)

exports.authUser = {
  user: Joi.alternatives().try(
    Joi.string()
      .alphanum()
      .min(2)
      .max(30),
    Joi.string().email()
  ),
  password: Joi.string().required()
}

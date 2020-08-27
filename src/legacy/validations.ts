import * as Joi from "joi";

export const validPost = Joi.object({
  id: Joi.string(),
  title: Joi.string(),
  content: Joi.object(),
  tags: Joi.array(),
  dateAdded: Joi.date(),
  dateModified: Joi.date(),
  user: Joi.string(),
  public: Joi.boolean()
});

// 1. must contain 1 lowercase letter
// 2. must contain 1 uppercase letter
// 3. must contain 1 numeric character
// 4. must contain 1 special character
// 5. must contain 6 characters

const validPassword = Joi.string().regex(
  /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/
);

export const validUser = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(2)
    .max(30)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  password: validPassword.required()
});

export const validPasswordUpdate = Joi.object().keys({
  oldPassword: Joi.string().required(),
  newPassword: validPassword.required(),
  confirmPassword: Joi.any().valid(Joi.ref("newPassword"))
});

export const validAuthenticatedUser = {
  user: Joi.alternatives()
    .try(
      Joi.string()
        .alphanum()
        .min(2)
        .max(30),
      Joi.string().email()
    )
    .required(),
  password: Joi.alternatives()
    .try(validPassword, Joi.string())
    .required()
};

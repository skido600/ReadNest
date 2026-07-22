import Joi from "joi";

export const CreateUserSchema = Joi.object({
  user_name: Joi.string().min(4).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 4 characters",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});

export const Otp = Joi.object({
  email: Joi.string().required().messages({
    "string.empty": "email or username is required",
    "any.required": "Email is required",
  }),

  code: Joi.string().length(6).required().messages({
    "string.length": "OTP code must be 6 characters",
    "string.empty": "OTP code is required",
    "any.required": "OTP code is required",
  }),
});

export const login = Joi.object({
  email: Joi.string().min(4).required().messages({
    "string.empty": "Email or username is required",
    "string.min": "Must be at least 2 characters",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});
export const Firstemailvalidate = Joi.object({
  email: Joi.string().min(4).required().messages({
    "string.empty": "Email or username is required",
    "string.min": "Must be at least 2 characters",
  }),
});

export const Verifycode = Joi.object({
  email: Joi.string().min(4).required().messages({
    "string.empty": "Email or username is required",
    "string.min": "Must be at least 2 characters",
  }),
  code: Joi.string().required().messages({ "string.empty": "code Required" }),
});

export const ResetPassword = Joi.object({
  resetToken: Joi.string().required().messages({
    "string.empty": "resetToken is required",
  }),
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({ "string.empty": "newPassword is Required" }),
  confirmNewpassword: Joi.string()
    .required()
    .messages({ "string.empty": " confirmNewpassword is Required" }),
});

export const validateupdates = Joi.object({
  title: Joi.string().required().messages({
    "string.empty": "title is required",
  }),
  author: Joi.string().required().messages({
    "string.empty": "author is required",
  }),
  description: Joi.string().required().messages({
    "string.empty": "description is required",
  }),
  isFeatured: Joi.boolean().required().messages({
    "any.required": "isFeatured is required",
    "boolean.base": "isFeatured must be true or false",
  }),
  category: Joi.string()
    .valid(
      "Thriller",
      "Horror",
      "Psychological Drama",
      "Romance",
      "Short Stories",
      "Urban Fiction",
      "Mystery",
      "Inspirational",
    )
    .required()
    .messages({
      "any.only": "category must be one of the allowed options",
      "string.empty": "Category is required",
      "any.required": "Category is required",
    }),
});
export const depositSchema = Joi.object({
  amount: Joi.number().required().positive().max(5000).messages({
    "number.base": "Amount must be a number",
    "any.required": "Amount is required",
    "number.positive": "Amount must be greater than 0",
    "number.max": "Maximum deposit amount is 5000 points",
  }),
});

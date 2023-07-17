const Joi = require("joi");

const loginWithSocialMediaValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    socialMediaId: Joi.string().required(),
    socialMediaType: Joi.string().required(),
    role: Joi.string().required(),
    emailVerified: Joi.boolean(),
  });

  // schema options
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  };
  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);

  if (error) {
    // on fail return comma separated errors
    const errorMessage = error.details
      .map((details) => {
        return details.message;
      })
      .join(", ");

    return res.status(400).json({ message: errorMessage });
  } else {
    // on success replace req.body with validated value and trigger next middleware function
    req.body = value;
    return next();
  }
};

module.exports = {
  loginWithSocialMediaValidation,
};

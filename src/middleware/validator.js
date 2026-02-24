const Joi = require('joi');

const validateSubmitScore = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.string().required().trim().min(1).max(100),
    gameName: Joi.string().required().trim().min(1).max(100),
    score: Joi.number().required().min(0).max(1000000000)
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details[0].message
    });
  }
  
  next();
};

const validateTopCount = (req, res, next) => {
  const schema = Joi.object({
    count: Joi.number().required().integer().min(1).max(1000)
  });

  const { error } = schema.validate({ count: parseInt(req.params.count) });
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: 'Count must be a positive integer between 1 and 1000'
    });
  }
  
  next();
};

const validateUserId = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.string().required().trim().min(1).max(100)
  });

  const { error } = schema.validate({ userId: req.params.userId });
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: 'User ID must be a non-empty string'
    });
  }
  
  next();
};

module.exports = {
  validateSubmitScore,
  validateTopCount,
  validateUserId
};

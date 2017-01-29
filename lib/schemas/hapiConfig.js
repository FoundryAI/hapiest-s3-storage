'use strict';

const Joi = require('joi');

const schema = Joi.object({
    awsAccessKey: Joi.string().required(),
    awsSecretKey: Joi.string().required(),
    httpTimeoutMs: Joi.number().integer().optional(),
    baseUrl: Joi.string().optional(),
    endpoint: Joi.string().optional()
});

module.exports = schema;

'use strict';

const Joi = require('joi');

const s3ConfigSchema = Joi.object({
    type: Joi.string().valid('s3').required(),
    bucket: Joi.string().optional(),
    keyPrefix: Joi.string().optional(),
    maxRetriesOnTimeout: Joi.number().integer(),
    localConfig: Joi.any().optional(),
    s3Config: Joi.object({
        userName: Joi.string().required(),
        awsAccessKey: Joi.string().required(),
        awsSecretKey: Joi.string().required(),
        httpTimeoutMs: Joi.number().integer().optional(),
        baseUrl: Joi.string().optional()
    }).required()
});

const localstorageConfigSchema = Joi.object({
    type: Joi.string().valid('localstorage').required(),
    bucket: Joi.string().optional(),
    keyPrefix: Joi.string().optional(),
    maxRetriesOnTimeout: Joi.number().integer(),
    localConfig: Joi.object({
        path: Joi.string().required(),
        baseUrl: Joi.string().optional()
    }).required(),
    s3Config: Joi.any().optional()
});

const schema = Joi.alternatives().try(s3ConfigSchema, localstorageConfigSchema);


module.exports = schema;
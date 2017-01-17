'use strict';

const Joi = require('joi');

const awsS3ConfigSchema = require('./awsS3Config');
const hapiS3ConfigSchema = require('./hapiConfig');

const s3ConfigSchema = Joi.object({
    type: Joi.string().valid('s3').required(),
    bucket: Joi.string().optional(),
    keyPrefix: Joi.string().optional(),
    readOnly: Joi.boolean().optional(),
    maxRetriesOnTimeout: Joi.number().integer(),
    localConfig: Joi.any().optional(),
    s3Config: Joi.alternatives().try(awsS3ConfigSchema, hapiS3ConfigSchema)
});

const localstorageConfigSchema = Joi.object({
    type: Joi.string().valid('localstorage').required(),
    bucket: Joi.string().optional(),
    keyPrefix: Joi.string().optional(),
    readOnly: Joi.boolean().optional(),
    maxRetriesOnTimeout: Joi.number().integer(),
    localConfig: Joi.object({
        path: Joi.string().required(),
        baseUrl: Joi.string().optional()
    }).required(),
    s3Config: Joi.any().optional()
});

const schema = Joi.alternatives().try(s3ConfigSchema, localstorageConfigSchema);


module.exports = schema;

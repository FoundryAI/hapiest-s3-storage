'use strict';

const Joi = require('joi');

const s3ConfigSchema = Joi.object({
    userName: Joi.string().required(),
    awsAccessKey: Joi.string().required(),
    awsSecretKey: Joi.string().required()
});

const localstorageConfigSchema = Joi.object({
    path: Joi.string().required()
});

const s3StorageServiceConfigSchema = Joi.object({
    type: Joi.string().valid(['s3','localstorage']).required(),
    bucket: Joi.string().optional(),
    config: Joi.any().required().when('type', { is: 's3', then: s3ConfigSchema, otherwise: localstorageConfigSchema})
});

module.exports = s3StorageServiceConfigSchema;
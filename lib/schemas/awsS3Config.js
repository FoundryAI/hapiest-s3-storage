'use strict';

const Joi = require('joi');

// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html

const schema = Joi.object({
    params: Joi.object(),
    endpoint: Joi.string(),
    useDualstack: Joi.boolean(),
    accessKeyId: Joi.string().required(),
    secretAccessKey: Joi.string().required(),
    // sessionToken: Joi.object(),
    // credentials: Joi.object(),
    // credentialProvider: Joi.object(),
    region: Joi.string(),
    maxRetries: Joi.number(),
    maxRedirects: Joi.number(),
    sslEnabled: Joi.boolean(),
    paramValidation: Joi.alternatives().try(
        Joi.boolean(),
        Joi.object({
            min: Joi.boolean(),
            max: Joi.boolean(),
            pattern: Joi.boolean(),
            enum: Joi.boolean()
        })
    ),
    computeChecksums: Joi.boolean(),
    convertResponseTypes: Joi.boolean(),
    correctClockSkew: Joi.boolean(),
    s3ForcePathStyle: Joi.boolean(),
    s3BucketEndpoint: Joi.boolean(),
    s3DisableBodySigning: Joi.boolean(),
    retryDelayOptions: Joi.object({
        base: Joi.number(),
        customBackoff: Joi.function()
    }),
    httpOptions: Joi.object({
        proxy: Joi.string(),
        // agent: Joi.object(),
        timeout: Joi.number(),
        xhrAsync: Joi.boolean(),
        xhrWithCredentials: Joi.boolean()
    }),
    apiVersion: Joi.alternatives(Joi.string(), Joi.date()),
    // apiVersions: Joi.object(),
    logger: Joi.object({
        write: Joi.function().required(),
        log: Joi.function().required()
    }),
    systemClockOffset: Joi.number(),
    signatureVersion: Joi.string(),
    signatureCache: Joi.boolean()
});

module.exports = schema;

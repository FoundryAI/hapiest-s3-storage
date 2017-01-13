'use strict';

const Joi = require('joi');

// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
const standardS3Config = Joi.object({
  params: Joi.object(),
  endpoint: Joi.string(),
  useDualstack: Joi.boolean(),
  accessKeyId: Joi.string(),
  secretAccessKey: Joi.string(),
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

const hapiS3Config = Joi.object({
    userName: Joi.string().required(),
    awsAccessKey: Joi.string().required(),
    awsSecretKey: Joi.string().required(),
    httpTimeoutMs: Joi.number().integer().optional(),
    baseUrl: Joi.string().optional(),
    endpoint: Joi.string().optional()
});

const s3ConfigSchema = Joi.object({
    type: Joi.string().valid('s3').required(),
    bucket: Joi.string().optional(),
    keyPrefix: Joi.string().optional(),
    readOnly: Joi.boolean().optional(),
    maxRetriesOnTimeout: Joi.number().integer(),
    localConfig: Joi.any().optional(),
    s3Config: Joi.alternatives().try(standardS3Config, hapiS3Config)
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

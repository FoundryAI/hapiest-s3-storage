'use strict';

const Path = require('path');
const Joi = require('joi');
const AWS = require('aws-sdk');
const AWSMock = require('mock-aws-s3');

const schemas = require('./schemas');
const S3StorageService = require('./s3StorageService');

class S3StorageServiceFactory {

    /**
     * @param {Config} nodeConfig
     * @param {String} nodeConfigPath
     * @param {Logger} logger
     * @param {string} basePath - used for local storage
     * @returns {S3StorageService}
     */
    static createFromNodeConfig(nodeConfig, nodeConfigPath, logger, basePath) {
        const config = nodeConfig.get(nodeConfigPath);
        return S3StorageServiceFactory.create(config, logger, basePath);
    }

    /**
     * @name S3StorageServiceFactoryConfig
     * @property {'s3'|'localstorage'} type
     * @property {string} [bucket]
     * @property {string} [keyPrefix] - used this to "fix" the service into a particular directory structure
     * @property {Boolean} [readOnly=false] -  setting this to true makes this a "read-only" service; throws errors on any write function call
     * @property {int} [maxRetriesOnTimeout=5] - maximum number of times to retry when hitting RequestTimeout error on putObject
     *
     * @property {object} [localConfig] - only necessary if type is 'localstorage'
     * @property {string} localConfig.path
     * @property {string} [localConfig.baseUrl] - if not provided, will default to a file system location of Path.resolve(basePath, localConfig.path)
     *
     * @property {Object} [s3Config] - only necessary if type is s3
     * @property {string} s3Config.awsAccessKey
     * @property {string} s3Config.awsSecretKey
     * @property {int} [s3Config.httpTimeoutMs] - defaults to 120000 per AWS SDK (2 minutes)
     * @property {string} [s3Config.baseUrl] - defaults to https://s3.amazonaws.com/
     */

    /**
     * @param {S3StorageServiceFactoryConfig} config
     * @param {Logger} logger
     * @param {string} basePath
     *
     * @returns {S3StorageService}
     */
    static create(config, logger, basePath) {
        const validateResult = Joi.validate(config, schemas.factoryConfigSchema);
        if (validateResult.error) {
            throw validateResult.error;
        }

        var s3Client, baseUrl;
        if (config.type === 's3') {
            s3Client = Internals.createAwsS3Client(config);
            baseUrl = Internals.getBaseUrlForAwsS3(config);
        } else {
            s3Client = Internals.createLocalstorageS3Client(config, basePath);
            baseUrl = Internals.getBaseUrlForLocalS3(config, basePath);
        }

        /** @type {S3StorageServiceConfig} */
        const serviceConfig = {
            type: config.type,
            bucket: config.bucket,
            keyPrefix: config.keyPrefix,
            readOnly: config.readOnly || false,
            baseUrlWithoutBucket: baseUrl,
            maxRetriesOnTimeout: config.maxRetriesOnTimeout || 5
        };
        return new S3StorageService(s3Client, logger, serviceConfig);
    }

}

module.exports = S3StorageServiceFactory;

class Internals {
    /**
     * @param {S3StorageServiceFactoryConfig} config
     * @param {string} basePath
     */
    static createLocalstorageS3Client(config, basePath) {
        AWSMock.config.basePath = Path.join(basePath, config.localConfig.path).replace(/\/$/,'');

        if (config.bucket) {
            return AWSMock.S3({
                params: { Bucket: config.bucket }
            });
        } else {
            return AWSMock.S3();
        }
    }

    /**
     * @param {S3StorageServiceFactoryConfig} config
     * @param {String} basePath
     */
    static getBaseUrlForLocalS3(config, basePath) {
        return config.localConfig.baseUrl || Path.resolve(basePath, config.localConfig.path);
    }


    /**
     * @param {S3StorageServiceFactoryConfig} config
     */
    static createAwsS3Client(config) {
        if (Joi.validate(config.s3Config, schemas.awsS3ConfigSchema).error === null) {
            return new AWS.S3(config.s3Config);
        }

        const s3Config = {
            accessKeyId: config.s3Config.awsAccessKey,
            secretAccessKey: config.s3Config.awsSecretKey,
            apiVersion: '2006-03-01'
        };

        if (config.bucket) { s3Config.params = { Bucket: config.bucket } }

        if (config.s3Config.httpTimeoutMs) {
            s3Config.httpOptions = { timeout: config.s3Config.httpTimeoutMs }
        }

        if (config.s3Config.endpoint) {
          s3Config.endpoint = new AWS.Endpoint(config.s3Config.endpoint)
        }

        return new AWS.S3(s3Config);
    }

    /**
     * @param {S3StorageServiceFactoryConfig} config
     */
    static getBaseUrlForAwsS3(config) {
        return config.s3Config.baseUrl || 'https://s3.amazonaws.com';
    }
}

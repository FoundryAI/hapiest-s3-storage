'use strict';

const Path = require('path');
const Joi = require('joi');
const AWS = require('aws-sdk');
const AWSMock = require('mock-aws-s3');

const s3StorageConfigSchema = require('./s3StorageConfigSchema');
const S3StorageService = require('./S3StorageService');

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
     * @property {object} config
     *
     * @property {string} [config.path] - only necessary if type is 'localstorage'
     *
     * @property {string} [config.userName] - only necessary if type is 's3'
     * @property {string} [config.awsAccessKey] - only necessary if type is 's3'
     * @property {string} [config.awsSecretKey] - only necessary if type is 's3'
     */

    /**
     * @param {S3StorageServiceFactoryConfig} config
     * @param {Logger} logger
     * @param {string} basePath
     *
     * @returns {S3StorageService}
     */
    static create(config, logger, basePath) {
        const validateResult = Joi.validate(config, s3StorageConfigSchema);
        if (validateResult.error) {
            throw validateResult.error;
        }

        const s3Client = config.type === 's3' ? Internals.createAwsS3Client(config) : Internals.createLocalstorageS3Client(config, basePath);

        return new S3StorageService(s3Client, logger, config.type);
    }

}

module.exports = S3StorageServiceFactory;

class Internals {
    /**
     * @param {S3StorageServiceFactoryConfig} config
     * @param {string} basePath
     */
    static createLocalstorageS3Client(config, basePath) {
        AWSMock.config.basePath = Path.join(basePath, config.config.path).replace(/\/$/,'');

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
     */
    static createAwsS3Client(config) {
        const s3Config = {
            accessKeyId: config.config.awsAccessKey,
            secretAccessKey: config.config.awsSecretKey,
            apiVersion: '2006-03-01'
        };
        if (config.bucket) {
            s3Config.params = { Bucket: config.bucket };
        }
        return new AWS.S3(s3Config);
    }
}
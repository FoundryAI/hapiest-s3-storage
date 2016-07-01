'use strict';

const Promise = require('bluebird');

class S3StorageService {

    /**
     * @param {AWS.S3|AWSMock.S3} s3Client - AWS.S3 or
     * @param {Logger} logger
     * @param {('localstorage'|'s3')} type
     * @param {String} bucket
     * @param {String} keyPrefix
     * @param {String} baseUrlWithoutBucket
     */
    constructor(s3Client, logger, type, bucket, keyPrefix, baseUrlWithoutBucket) {
        this._s3 = s3Client;
        this._logger = logger;
        this._type = type;
        this._bucket = bucket;
        this._keyPrefix = keyPrefix;
        this._baseUrlWithoutBucket = baseUrlWithoutBucket;
    }

    /**
     * @param {String} [bucket] - should only be provided if not provided in constructor
     * @returns {String}
     */
    getBaseEndpointUrl(bucket) {
        var bucket = this._bucket || bucket;
        if (!bucket) {
            throw new Error('Bucket must be provided')
        }

        return `${this._baseUrlWithoutBucket}/${bucket}` + (this._keyPrefix ? `/${this._keyPrefix}` : '');
    }

    /**
     * @param {String} s3Key
     * @param [bucket] - only used if bucket is not provided in constructor
     */
    getUrl(s3Key, bucket) {
        const baseUrlWithBucket = this.getBaseEndpointUrl(bucket);
        return `${baseUrlWithBucket}/${s3Key}`;
    }

    /**
     * @returns {String}
     */
    getBucket() {
        return this._bucket;
    }

    /**
     * @returns {('localstorage'|'s3')}
     */
    getType() {
        return this._type;
    }

    getKeyPrefix() {
        return this._keyPrefix;
    }

    _getKeyWithKeyPrefix(key) {
        if (this._keyPrefix) {
            // Allow passing in full key to make client logic easier b/c the API returns full keys
            if (key.startsWith(`${this._keyPrefix}/`)) {
                return key;
            } else {
                return `${this._keyPrefix}/${key}`;
            }
        } else {
            return key;
        }
    }

    /**
     * @param {Object} params
     * @param {String} params.Key
     * @param {String} params.Bucket
     * @param {String} params.MFA
     * @param {requester} params.RequestPayer
     * @param {String} params.VersionId
     *
     * @returns {Promise.<Data,Error>}
     */
    deleteObject(params) {
        params.Key = this._getKeyWithKeyPrefix(params.Key);
        return new Promise((resolve, reject) => {
            this._s3.deleteObject(params, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    if (typeof data === 'object') {
                        data = true;
                    }
                    resolve(data);
                }
            })
        })
    }


    /**
     * @param {Object} params
     * @param {String} params.Key
     * @param {String} params.IfMatch
     * @param {Date} params.IfModifiedSince
     * @param {String} params.IfNoneMatch
     * @param {Date} params.IfUnmodifiedSince
     * @param {String} params.Range
     * @param {requester} params.RequestPayer
     * @param {String} params.ResponseCacheControl
     * @param {String} params.ResponseContentDisposition
     * @param {String} params.ResponseContentEncoding
     * @param {String} params.ResponseContentEncoding
     * @param {String} params.ResponseContentLanguage
     * @param {String} params.ResponseContentType
     * @param {Date} params.ResponseExpires
     * @param {Date} params.SSECustomerAlgorithm
     * @param {Buffer} params.SSECustomerKey
     * @param {Date} params.SSECustomerKeyMD5
     * @param {Date} params.VersionId
     *
     * @returns {Promise.<Data,Error>} - Note, the expected errors when key is not found are Error.code = ENOENT | NoSuchKey
     */
    getObject(params) {
        params.Key = this._getKeyWithKeyPrefix(params.Key);
        return new Promise((resolve, reject) => {
            this._s3.getObject(params, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    data.Key = params.Key;
                    resolve(data);
                }
            })
        })
    }

    /**
     * @param {Object} params
     * @param {String} params.Bucket
     * @param {String} params.Key
     * @param {private | public-read | public-read-write | authenticated-read | aws-exec-read | bucket-owner-read | bucket-owner-full-control} params.ACL
     * @param {Buffer} params.Body
     * @param {String} params.CacheControl
     * @param {String} params.ContentDisposition
     * @param {String} params.ContentEncoding
     * @param {String} params.ContentLanguage
     * @param {Number} params.ContentLength
     * @param {String} params.ContentMD5
     * @param {String} params.ContentType
     * @param {Date} params.Expires
     * @param {String} params.GrantFullControl
     * @param {String} params.GrantRead
     * @param {String} params.GrantReadACP
     * @param {String} params.GrantWriteACP
     * @param {Object} params.Metadata
     * @param {requester} params.RequestPayer
     * @param {String} params.SSECustomerAlgorithm
     * @param {Buffer} params.SSECustomerKey
     * @param {String} params.SSECustomerKeyMD5
     * @param {String} params.SSEKMSKeyId
     * @param {String} params.ServerSideEncryption
     * @param {STANDARD | REDUCED_REDUNDANCY | STANDARD_IA} params.StorageClass
     * @param {String} params.WebsiteRedirectLocation
     *
     * @returns {Promise.<Data,Error>}
     */
    putObject(params) {
        params.Key = this._getKeyWithKeyPrefix(params.Key);
        return new Promise((resolve, reject) => {
            this._s3.putObject(params, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        })
    }

    /**
     * @param {Object} params
     * @param {String} params.Bucket
     * @param {String} params.Key
     * @param {private | public-read | public-read-write | authenticated-read | aws-exec-read | bucket-owner-read | bucket-owner-full-control} params.ACL
     * @param {Buffer} params.Body
     * @param {String} params.CacheControl
     * @param {String} params.ContentDisposition
     * @param {String} params.ContentEncoding
     * @param {String} params.ContentLanguage
     * @param {Number} params.ContentLength
     * @param {String} params.ContentMD5
     * @param {String} params.ContentType
     * @param {Date} params.Expires
     * @param {String} params.GrantFullControl
     * @param {String} params.GrantRead
     * @param {String} params.GrantReadACP
     * @param {String} params.GrantWriteACP
     * @param {Object} params.Metadata
     * @param {requester} params.RequestPayer
     * @param {String} params.SSECustomerAlgorithm
     * @param {Buffer} params.SSECustomerKey
     * @param {String} params.SSECustomerKeyMD5
     * @param {String} params.SSEKMSKeyId
     * @param {String} params.ServerSideEncryption
     * @param {STANDARD | REDUCED_REDUNDANCY | STANDARD_IA} params.StorageClass
     * @param {String} params.WebsiteRedirectLocation
     * @param {Object} options
     * @param {Number} options.partSize
     * @param {Number} options.queueSize
     *
     * @returns {Promise.<Data,Error>}
     */
    upload(params, options) {
        params.Key = this._getKeyWithKeyPrefix(params.Key);
        return new Promise((resolve, reject) => {
            this._s3.upload(params, options, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        })
    }

}

module.exports = S3StorageService;
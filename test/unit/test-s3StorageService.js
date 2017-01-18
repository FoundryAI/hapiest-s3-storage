'use strict';

const Should = require('should');
const Promise = require('bluebird');
const Path = require('path');
const Fs = require('fs');
const rmdir = require('rmdir');
const Sinon = require('sinon');
const NodeConfig = require('config');
const S3StorageServiceFactory = require('../../lib/s3StorageServiceFactory');

const LoggerConfigFactory = require('hapiest-logger/lib/loggerConfigFactory');
const LoggerFactory = require('hapiest-logger/lib/loggerFactory');
const loggerConfig = LoggerConfigFactory.createFromJsObj({enabled: false});
const logger = LoggerFactory.createLogger(loggerConfig);

const basePath = Path.join(__dirname, '../unit-helper/s3StorageService/localstorage');

const testBucket1 = 'somebucket';
const testBucket2 = 'anotherbucket';

const s3ServiceLocalStorageWithBucket = S3StorageServiceFactory.create({
    type: 'localstorage',
    bucket: testBucket1,
    localConfig: {
        path: './'
    }
}, logger, basePath);

const s3ServiceLocalStorageWithoutBucket = S3StorageServiceFactory.create({
    type: 'localstorage',
    localConfig: {
        path: './'
    }
}, logger, basePath);

const s3ServiceLocalStorageWithBucketAndKeyPrefix = S3StorageServiceFactory.create({
    type: 'localstorage',
    bucket: testBucket1,
    keyPrefix: 'tmp/blah/hello',
    localConfig: {
        path: './'
    }
}, logger, basePath);

const s3ServiceWithBucket = S3StorageServiceFactory.create({
    type: 's3',
    bucket: 'vizualai-test',
    s3Config: {
        awsAccessKey: NodeConfig.get('aws.awsAccessKey'),
        awsSecretKey: NodeConfig.get('aws.awsSecretKey'),
        httpTimeoutMs: 15000
    }
});

const s3ServiceWithBaseUrlBucketAndVirutalHostUrlStyle = S3StorageServiceFactory.create({
    type: 's3',
    bucket: 'vizualai-test',
    urlStyle: 'virtualHost',
    keyPrefix: 'images/tmp',
    s3Config: {
        awsAccessKey: NodeConfig.get('aws.awsAccessKey'),
        awsSecretKey: NodeConfig.get('aws.awsSecretKey'),
        baseUrl: 'http://s3.docker',
        httpTimeoutMs: 15000
    }
});

const s3ServiceWithBucketAndKeyPrefix = S3StorageServiceFactory.create({
    type: 's3',
    bucket: 'vizualai-test',
    keyPrefix: 'images/tmp',
    s3Config: {
        awsAccessKey: NodeConfig.get('aws.awsAccessKey'),
        awsSecretKey: NodeConfig.get('aws.awsSecretKey')
    }
});

const s3ServiceForceTimeout = S3StorageServiceFactory.create({
    type: 's3',
    bucket: 'vizualai-test',
    keyPrefix: 'images/tmp',
    s3Config: {
        awsAccessKey: NodeConfig.get('aws.awsAccessKey'),
        awsSecretKey: NodeConfig.get('aws.awsSecretKey'),
        httpTimeoutMs: 1
    }
});

const s3ServiceReadonly = S3StorageServiceFactory.create({
    type: 's3',
    bucket: 'vizualai-test',
    keyPrefix: 'images/tmp',
    readOnly: true,
    s3Config: {
        awsAccessKey: NodeConfig.get('aws.awsAccessKey'),
        awsSecretKey: NodeConfig.get('aws.awsSecretKey')
    }
});

const testFilePath = Path.join(__dirname,'../unit-helper/s3StorageService/testSources/sample.txt');
const testFileBody = Fs.readFileSync(testFilePath);

describe('S3StorageService', function() {

    describe('localstorage', function() {

        beforeEach(function(done) {
            rmdir(basePath, () => done());
        });
        after(function(done) {
            rmdir(basePath, () => done());
        });

        it('Should put an object and then get the object with the same key', function () {
            const testKey = 'some/key/up/there.txt';
            return s3ServiceLocalStorageWithBucket.putObject({
                Key: testKey,
                Body: testFileBody
            })
            .then((results) => {
                (Fs.existsSync(Path.join(basePath, testBucket1, testKey))).should.be.True();
                return s3ServiceLocalStorageWithBucket.getObject({
                    Key: testKey
                });
            })
            .then(result => {
                (result.Key).should.eql(testKey);
                (result.Body).should.eql(testFileBody);
            });
        });

        it('Should put an object and then get the object with the same key by providing the bucket in individual functions', function () {
            const testKey = 'blah.txt';
            return s3ServiceLocalStorageWithoutBucket.putObject({
                Bucket: testBucket2,
                Key: testKey,
                Body: testFileBody
            })
            .then((results) => {
                (Fs.existsSync(Path.join(basePath, testBucket2, testKey))).should.be.True();
                return s3ServiceLocalStorageWithoutBucket.getObject({
                    Bucket: testBucket2,
                    Key: testKey
                });
            })
            .then(result => {
                (result.Key).should.eql(testKey);
                (result.Body).should.eql(testFileBody);
            });
        });

        it('Should delete an object', function () {
            const testKey = 'some/key/up/there.txt';
            return s3ServiceLocalStorageWithBucket.putObject({
                Key: testKey,
                Body: testFileBody
            })
            .then((results) => {
                (Fs.existsSync(Path.join(basePath, testBucket1, testKey))).should.be.True();
            })
            .then(() => s3ServiceLocalStorageWithBucket.deleteObject({Key: testKey}))
            .then(() => s3ServiceLocalStorageWithBucket.getObject({Key: testKey}))
            .then(() => {
                throw new Error('Should fail with no such file error (err.code === ENOENT)')
            }, err => {
                Should.exist(err);
                err.code.should.eql('ENOENT')
            });
        });

        it('Should upload an object and then get the object with the same key', function () {
            var testKey = 'myUploadKey';
            return s3ServiceLocalStorageWithBucket.upload({
                Key: testKey,
                Bucket: testBucket1,
                Body: testFileBody
            }, {})
            .then(function (result) {
                (Fs.existsSync(Path.join(basePath, testBucket1, testKey))).should.be.equal(true);
                return s3ServiceLocalStorageWithBucket.getObject({
                    Key: testKey,
                    Bucket: testBucket1
                })
            })
            .then(function (result) {
                (result.Key).should.eql(testKey);
                (result.Body).should.eql(testFileBody);
            });
        });

        it('Should put an object with "short" key and get the object with both the "short" and full key', function() {
            var testKey = 'myPutKey';
            return s3ServiceLocalStorageWithBucketAndKeyPrefix.putObject({
                    Key: testKey,
                    Body: testFileBody
                })
                .then(results => {
                    return Promise.all([
                        s3ServiceLocalStorageWithBucketAndKeyPrefix.getObject({Key: testKey}),
                        s3ServiceLocalStorageWithBucketAndKeyPrefix.getObject({Key: `tmp/blah/hello/${testKey}`})
                    ]);
                })
                .spread((resultShortKey, resultLongKey) => {
                    resultShortKey.Key.should.eql(`tmp/blah/hello/${testKey}`);
                    resultShortKey.Body.should.eql(testFileBody);

                    resultLongKey.Key.should.eql(`tmp/blah/hello/${testKey}`);
                    resultLongKey.Body.should.eql(testFileBody);
                })
                ;
        });


    });

    describe('s3', function() {

        this.timeout(10000);

        it('Should put an object and then get the object with the same key', function () {
            const testKey = 'some/key/up/there.txt';
            return s3ServiceWithBucket.putObject({
                Key: testKey,
                Body: testFileBody
            })
            .then((results) => {
                return s3ServiceWithBucket.getObject({
                    Key: testKey
                });
            })
            .then(result => {
                (result.Key).should.eql(testKey);
                (result.Body).should.eql(testFileBody);
            });
        });

        it('Should delete an object', function () {
            const testKey = 'some/key/up/there.txt';
            return s3ServiceWithBucket.putObject({
                Key: testKey,
                Body: testFileBody
            })
            .then(() => s3ServiceWithBucket.getObject({Key: testKey}))
            .then(result => {
                (result.Key).should.eql(testKey);
                (result.Body).should.eql(testFileBody);
            })
            .then(() => s3ServiceWithBucket.deleteObject({Key: testKey}))
            .then(() => s3ServiceWithBucket.getObject({Key: testKey}))
            .then(() => {
                throw new Error('Should fail with no such file error (err.code === NoSuchKey)')
            }, err => {
                Should.exist(err);
                err.code.should.eql('NoSuchKey');
            });
        });

        it('Should upload an object and then get the object with the same key', function () {
            var testKey = 'myUploadKey';
            return s3ServiceWithBucket.upload({
                Key: testKey,
                Body: testFileBody
            })
            .then(result =>{
                return s3ServiceWithBucket.getObject({
                    Key: testKey
                })
            })
            .then(result => {
                (result.Key).should.eql(testKey);
                (result.Body).should.eql(testFileBody);
            })
        });

        it('Should put an object with "short" key and get the object with both the "short" and full key', function() {
            var testKey = 'myPutKey';
            return s3ServiceWithBucketAndKeyPrefix.putObject({
                    Key: testKey,
                    Body: testFileBody
                })
                .then(results => {
                    return Promise.all([
                        s3ServiceWithBucketAndKeyPrefix.getObject({Key: testKey}),
                        s3ServiceWithBucketAndKeyPrefix.getObject({Key: `images/tmp/${testKey}`})
                    ]);
                })
                .spread((resultShortKey, resultLongKey) => {
                    resultShortKey.Key.should.eql(`images/tmp/${testKey}`);
                    resultShortKey.Body.should.eql(testFileBody);

                    resultLongKey.Key.should.eql(`images/tmp/${testKey}`);
                    resultLongKey.Body.should.eql(testFileBody);
                })
                ;
        });

        it('Should retry putObject when maxRetriesOnTimeout > 0', function() {
            const testKey = 'myPutKey';

            let timesCalled = 0;
            const requestTimeoutErr = new Error('RequestTimeout');
            requestTimeoutErr.code = 'RequestTimeout';
            const _putObjectSimpleStub = Sinon.stub(s3ServiceWithBucketAndKeyPrefix, '_putObjectSimple', function(params) {
                timesCalled += 1;
                if (timesCalled === 1 || timesCalled === 2) {
                    return Promise.reject(requestTimeoutErr);
                } else {
                    _putObjectSimpleStub.restore();
                    return s3ServiceWithBucketAndKeyPrefix._putObjectSimple(params);
                }
            });

            const _putObjectRecursiveSpy = Sinon.spy(s3ServiceWithBucketAndKeyPrefix, '_putObjectRecursive');

            return Promise.resolve()
                .then(() => s3ServiceWithBucketAndKeyPrefix.deleteObject({Key: testKey}))
                .then(() => s3ServiceWithBucketAndKeyPrefix.putObject({
                    Key: testKey,
                    Body: testFileBody
                }))
                .then(results => s3ServiceWithBucketAndKeyPrefix.getObject({Key: testKey}))
                .then(result => {
                    result.Key.should.eql(`images/tmp/${testKey}`);
                    result.Body.should.eql(testFileBody);
                    _putObjectRecursiveSpy.calledThrice.should.be.True();
                })
                .finally(() => {
                    _putObjectSimpleStub.restore();
                    _putObjectRecursiveSpy.restore();
                })
            ;
        });

        it('Should throw an error if it hits too many RequestTimeout errors', function() {
            const testKey = 'myPutKey';

            let timesCalled = 0;
            const requestTimeoutErr = new Error('RequestTimeout');
            requestTimeoutErr.code = 'RequestTimeout';
            const _putObjectSimpleStub = Sinon.stub(s3ServiceWithBucketAndKeyPrefix, '_putObjectSimple', function(params) {
                timesCalled += 1;
                if (timesCalled <= 6) {
                    return Promise.reject(requestTimeoutErr);
                } else {
                    _putObjectSimpleStub.restore();
                    return s3ServiceWithBucketAndKeyPrefix._putObjectSimple(params);
                }
            });

            const _putObjectRecursiveSpy = Sinon.spy(s3ServiceWithBucketAndKeyPrefix, '_putObjectRecursive');

            let expectedError;
            return Promise.resolve()
                .then(() => s3ServiceWithBucketAndKeyPrefix.deleteObject({Key: testKey}))
                .then(() => s3ServiceWithBucketAndKeyPrefix.putObject({
                    Key: testKey,
                    Body: testFileBody
                }))
                .catch(err => expectedError = err)
                .then(() => {
                    Should.exist(expectedError);
                    expectedError.code.should.eql('MaxRetriesReached');
                    expectedError.message.should.eql('S3StorageService: max retries (5) on timeout reached.  Search for AWS SDK S3 RequestTimeout errors and how to resolve them.');

                    _putObjectRecursiveSpy.callCount.should.eql(6);
                })
                .finally(() => {
                    _putObjectSimpleStub.restore();
                    _putObjectRecursiveSpy.restore();
                })
                ;
        });

        it('Should timeout when uploading', function () {
            const testKey = 'myUploadKey';
            var expectedError;
            return s3ServiceForceTimeout.upload({
                    Key: testKey,
                    Bucket: testBucket1,
                    Body: testFileBody
                })
                .catch(err => expectedError = err)
                .then(() => {
                    Should.exist(expectedError);
                    expectedError.code.should.eql('NetworkingError');
                    expectedError.name.should.eql('TimeoutError');
                })
        });

        it('Should throw an error on upload() when readOnly:true', function() {
            const testKey = 'myUploadKey';
            var expectedError;
            return s3ServiceReadonly.upload({
                    Key: testKey,
                    Bucket: testBucket1,
                    Body: testFileBody
                })
                .catch(err => expectedError = err)
                .then(() => {
                    Should.exist(expectedError);
                    expectedError.message.should.eql('Readonly service - no CUD operations allowed');
                })
        });

        it('Should throw an error on putObject() when readOnly:true', function() {
            const testKey = 'myUploadKey';
            var expectedError;
            return s3ServiceReadonly.putObject({
                    Key: testKey,
                    Bucket: testBucket1,
                    Body: testFileBody
                })
                .catch(err => expectedError = err)
                .then(() => {
                    Should.exist(expectedError);
                    expectedError.message.should.eql('Readonly service - no CUD operations allowed');
                })
        });

        it('Should throw an error on deleteObject() when readOnly:true', function() {
            const testKey = 'myUploadKey';
            var expectedError;
            return s3ServiceReadonly.deleteObject({
                    Key: testKey,
                    Bucket: testBucket1
                })
                .catch(err => expectedError = err)
                .then(() => {
                    Should.exist(expectedError);
                    expectedError.message.should.eql('Readonly service - no CUD operations allowed');
                })
        });

    });

    describe('misc functions', function() {

        describe('getBaseEndpointUrl', () => {

            it('should return a base url with a path style', () => {
               const url = s3ServiceReadonly.getBaseEndpointUrl();
                url.should.eql('https://s3.amazonaws.com/vizualai-test/images/tmp')
            });

            it('should return a base url with a virtual host style', () => {
                const baseEndpointUrl = s3ServiceWithBaseUrlBucketAndVirutalHostUrlStyle.getBaseEndpointUrl();
                baseEndpointUrl.should.eql('http://vizualai-test.s3.docker/images/tmp');
            })
        });

        describe('stripKeyPrefix', function() {

            it('Should strip the key prefix', function () {
                const keyToTest = 'tmp/blah/hello/more/key/stuff/file.zip';
                const keyWithPrefixStripped = s3ServiceLocalStorageWithBucketAndKeyPrefix.stripKeyPrefix(keyToTest);
                keyWithPrefixStripped.should.eql('more/key/stuff/file.zip');
            });

            it('Should return original key when it does not match the key prefix', function () {
                const keyToTest = 'tmp/blah/does/not/match/file.zip';
                const keyWithPrefixStripped = s3ServiceLocalStorageWithBucketAndKeyPrefix.stripKeyPrefix(keyToTest);
                keyWithPrefixStripped.should.eql(keyToTest);
            });

        });

        describe('getKeyWithKeyPrefix', function() {

            it('Should prepend the key prefix if the key does not already have it', function () {
                const keyToTest = 'some/key/file.zip';
                const keyWithPrefix = s3ServiceLocalStorageWithBucketAndKeyPrefix.getKeyWithKeyPrefix(keyToTest);
                keyWithPrefix.should.eql('tmp/blah/hello/some/key/file.zip');
            });

            it('Should return original key if key already has key prefix', function () {
                const keyToTest = 'tmp/blah/hello/more/key/stuff/file.zip';
                const keyWithPrefix = s3ServiceLocalStorageWithBucketAndKeyPrefix.getKeyWithKeyPrefix(keyToTest);
                keyWithPrefix.should.eql(keyToTest);
            });

        })

    })

});

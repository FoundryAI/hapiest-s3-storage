'use strict';

const Should = require('should');
const Path = require('path');
const Fs = require('fs');
const rmdir = require('rmdir');
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

const s3ServiceWithBucket = S3StorageServiceFactory.create({
    type: 's3',
    bucket: 'vizualai-test',
    s3Config: {
        userName: NodeConfig.get('aws.userName'),
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
                })
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
                })
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
                })
        });

        it('Should upload an object and then get the object with the same key', function () {
            var testKey = 'myUploadKey';
            s3ServiceLocalStorageWithBucket.upload({
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
                })
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
                })
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
                })
        });

        it('Should upload an object and then get the object with the same key', function () {
            var testKey = 'myUploadKey';
            s3ServiceWithBucket.upload({
                    Key: testKey,
                    Bucket: testBucket1,
                    Body: testFileBody
                })
                .then(function (result) {
                    (Fs.existsSync(Path.join(basePath, testBucket1, testKey))).should.be.equal(true);
                    return s3ServiceWithBucket.getObject({
                        Key: testKey,
                        Bucket: testBucket1
                    })
                })
                .then(function (result) {
                    (result.Key).should.eql(testKey);
                    (result.Body).should.eql(testFileBody);
                })
        });
        
    })
    
});
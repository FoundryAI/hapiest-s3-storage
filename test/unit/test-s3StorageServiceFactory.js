'use strict';

const Should = require('should');
const Path = require('path');
const NodeConfig = require('config-uncached');
const S3StorageServiceFactory = require('../../lib/s3StorageServiceFactory');

const LoggerConfigFactory = require('hapiest-logger/lib/loggerConfigFactory');
const LoggerFactory = require('hapiest-logger/lib/loggerFactory');
const loggerConfig = LoggerConfigFactory.createFromJsObj({enabled: false});
const logger = LoggerFactory.createLogger(loggerConfig);

const basePath = Path.join(__dirname, '../unit-helper/s3StorageServiceFactory/localstorage');

describe('S3StorageServiceFactory', function() {

   describe('create', function() {

       it('Should create a localstorage s3Service', function() {
           const s3Service = S3StorageServiceFactory.create({
               type: 'localstorage',
               bucket: 'mybucket',
               config: {
                   path: './'
               }
           }, logger, basePath);

           Should.exist(s3Service);
           s3Service.getType().should.eql('localstorage');
       });

       it('Should permit bucket to be optional for localstorage', function() {

           const s3Service = S3StorageServiceFactory.create({
               type: 'localstorage',
               config: {
                   path: Path.join(__dirname,'../unit-helper/s3StorageServiceFactory')
               }
           }, logger, basePath);

           Should.exist(s3Service);
           s3Service.getType().should.eql('localstorage');
       });

       it('Should create an s3 s3Service', function() {
           const s3Service = S3StorageServiceFactory.create({
               type: 's3',
               bucket: 'mybucket',
               config: {
                   userName: 'user',
                   awsAccessKey: 'awsAccessKey',
                   awsSecretKey: 'awsSecretKey'
               }
           }, logger, basePath);

           Should.exist(s3Service);
           s3Service.getType().should.eql('s3');
       });

       it('Should permit bucket to be optional for s3 storage', function() {
           const s3Service = S3StorageServiceFactory.create({
               type: 's3',
               config: {
                   userName: 'user',
                   awsAccessKey: 'awsAccessKey',
                   awsSecretKey: 'awsSecretKey'
               }
           }, logger, basePath);

           Should.exist(s3Service);
           s3Service.getType().should.eql('s3');
       });

       it('Should throw an error if the type is invalid', function() {
           let err = null;
           try {
               const s3Service = S3StorageServiceFactory.create({
                   type: 'invalid',
                   bucket: 'mybucket',
                   config: {
                       path: Path.join(__dirname, '../unit-helper/s3StorageServiceFactory')
                   }
               }, logger, basePath);
           } catch (e) {
                err = e;
           }

           Should.exist(err);
           err.isJoi.should.be.True();
       });

       it('Should throw an error if config.path is not provided for localstorage', function() {
           let err = null;
           try {
               const s3Service = S3StorageServiceFactory.create({
                   type: 'invalid',
                   bucket: 'mybucket',
                   config: {}
               }, logger, basePath);
           } catch (e) {
               err = e;
           }

           Should.exist(err);
           err.isJoi.should.be.True();
       });

       it('Should throw an error if config is not provided for localstorage', function() {
           let err = null;
           try {
               const s3Service = S3StorageServiceFactory.create({
                   type: 'invalid',
                   bucket: 'mybucket'
               }, logger, basePath);
           } catch (e) {
               err = e;
           }

           Should.exist(err);
           err.isJoi.should.be.True();
       });

       it('Should throw an error if config.userName is not provided for s3', function() {
           let err = null;
           try {
               const s3Service = S3StorageServiceFactory.create({
                   type: 's3',
                   config: {
                       awsAccessKey: 'awsAccessKey',
                       awsSecretKey: 'awsSecretKey'
                   }
               }, logger, basePath);
           } catch (e) {
               err = e;
           }

           Should.exist(err);
           err.isJoi.should.be.True();
       });

       it('Should throw an error if config.awsAccessKey is not provided for s3', function() {
           let err = null;
           try {
               const s3Service = S3StorageServiceFactory.create({
                   type: 's3',
                   config: {
                       userName: 'userName',
                       awsSecretKey: 'awsSecretKey'
                   }
               }, logger, basePath);
           } catch (e) {
               err = e;
           }

           Should.exist(err);
           err.isJoi.should.be.True();
       });

       it('Should throw an error if config.awsSecretKey is not provided for s3', function() {
           let err = null;
           try {
               const s3Service = S3StorageServiceFactory.create({
                   type: 's3',
                   bucket: 'bucket',
                   config: {
                       userName: 'userName',
                       awsAccessKey: 'awsAccessKey'
                   }
               }, logger, basePath);
           } catch (e) {
               err = e;
           }

           Should.exist(err);
           err.isJoi.should.be.True();
       });

       it('Should throw an error if config is not provided for s3', function() {
           let err = null;
           try {
               const s3Service = S3StorageServiceFactory.create({
                   type: 's3'
               }, logger, basePath);
           } catch (e) {
               err = e;
           }

           Should.exist(err);
           err.isJoi.should.be.True();
       });
       
   });
    
    describe('createFromNodeConfig', function() {
        
       it('Should create localstorage from config-1', function() {
           const nodeConfig = getNodeConfig('config-1');
           const s3Service = S3StorageServiceFactory.createFromNodeConfig(nodeConfig, 'storage', logger, basePath);
           Should.exist(s3Service);
           s3Service.getType().should.eql('localstorage');
       });

        it('Should create s3 from config-2', function() {
            const nodeConfig = getNodeConfig('config-2');
            const s3Service = S3StorageServiceFactory.createFromNodeConfig(nodeConfig, 'storage', logger, basePath);
            Should.exist(s3Service);
            s3Service.getType().should.eql('s3');
        });
        
    });

});

function getNodeConfig(configFolder) {
    const configDir = Path.join(__dirname, '../unit-helper/s3StorageServiceFactory', configFolder);
    process.env.NODE_CONFIG_DIR = configDir;
    return NodeConfig(true);
}
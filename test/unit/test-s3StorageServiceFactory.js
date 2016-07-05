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
               localConfig: {
                   path: './'
               }
           }, logger, basePath);

           Should.exist(s3Service);
           s3Service.getType().should.eql('localstorage');
           s3Service.getBaseEndpointUrl().should.eql(Path.resolve(basePath, 'mybucket'));
           s3Service.getUrl('mykey').should.eql(Path.resolve(basePath, 'mybucket', 'mykey'));
       });

       it('Should permit bucket to be optional for localstorage', function() {

           const s3Service = S3StorageServiceFactory.create({
               type: 'localstorage',
               localConfig: {
                   path: Path.join(__dirname,'../unit-helper/s3StorageServiceFactory'),
                   baseUrl: 'http://localhost:3000/localstorage'
               }
           }, logger, basePath);

           Should.exist(s3Service);
           s3Service.getType().should.eql('localstorage');
           s3Service.getBaseEndpointUrl('mybucket').should.eql('http://localhost:3000/localstorage/mybucket');
           s3Service.getUrl('mynewkey', 'anotherbucket').should.eql('http://localhost:3000/localstorage/anotherbucket/mynewkey');
       });

       it('Should create an s3 s3Service', function() {
           const s3Service = S3StorageServiceFactory.create({
               type: 's3',
               bucket: 'mybucket',
               maxRetriesOnTimeout: 10,
               s3Config: {
                   userName: 'user',
                   awsAccessKey: 'awsAccessKey',
                   awsSecretKey: 'awsSecretKey'
               }
           }, logger, basePath);

           Should.exist(s3Service);
           s3Service.getType().should.eql('s3');
           s3Service.getBaseEndpointUrl().should.eql('https://s3.amazonaws.com/mybucket');
           s3Service.getUrl('mykey').should.eql('https://s3.amazonaws.com/mybucket/mykey');
       });

       it('Should permit bucket to be optional for s3 storage', function() {
           const s3Service = S3StorageServiceFactory.create({
               type: 's3',
               s3Config: {
                   userName: 'user',
                   awsAccessKey: 'awsAccessKey',
                   awsSecretKey: 'awsSecretKey'
               }
           }, logger, basePath);

           Should.exist(s3Service);
           s3Service.getType().should.eql('s3');
           s3Service.getBaseEndpointUrl('somebucket').should.eql('https://s3.amazonaws.com/somebucket');
           s3Service.getUrl('anotherkey', 'somebucket').should.eql('https://s3.amazonaws.com/somebucket/anotherkey');
       });

       it('Should allow httpTimeoutMs parameter for s3 storage', function() {
           const s3Service = S3StorageServiceFactory.create({
               type: 's3',
               s3Config: {
                   userName: 'user',
                   awsAccessKey: 'awsAccessKey',
                   awsSecretKey: 'awsSecretKey',
                   httpTimeoutMs: 15000
               }
           }, logger, basePath);

           Should.exist(s3Service);
           s3Service.getType().should.eql('s3');
           s3Service.getBaseEndpointUrl('somebucket').should.eql('https://s3.amazonaws.com/somebucket');
           s3Service.getUrl('anotherkey', 'somebucket').should.eql('https://s3.amazonaws.com/somebucket/anotherkey');
       });

       it('Should permit both s3Config and localConfig to be present for s3 type', function() {
           const s3Service = S3StorageServiceFactory.create({
               type: 's3',
               bucket: 'myUbcket',
               localConfig: {
                   path: './'
               },
               s3Config: {
                   userName: 'user',
                   awsAccessKey: 'awsAccessKey',
                   awsSecretKey: 'awsSecretKey'
               }
           }, logger, basePath);

           Should.exist(s3Service);
           s3Service.getType().should.eql('s3');
       });

       it('Should permit both s3Config and localConfig to be present for localstorage type', function() {
           const s3Service = S3StorageServiceFactory.create({
               type: 'localstorage',
               bucket: 'myUbcket',
               maxRetriesOnTimeout: 2,
               localConfig: {
                   path: './'
               },
               s3Config: {
                   userName: 'user',
                   awsAccessKey: 'awsAccessKey',
                   awsSecretKey: 'awsSecretKey'
               }
           }, logger, basePath);

           Should.exist(s3Service);
           s3Service.getType().should.eql('localstorage');
       });

       it('Should throw an error if the type is invalid', function() {
           let err = null;
           try {
               const s3Service = S3StorageServiceFactory.create({
                   type: 'invalid',
                   bucket: 'mybucket',
                   localConfig: {
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
                   localConfig: {}
               }, logger, basePath);
           } catch (e) {
               err = e;
           }

           Should.exist(err);
           err.isJoi.should.be.True();
       });

       it('Should throw an error if localConfig is not provided for localstorage', function() {
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

       it('Should throw an error if s3Config.userName is not provided for s3', function() {
           let err = null;
           try {
               const s3Service = S3StorageServiceFactory.create({
                   type: 's3',
                   s3Config: {
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

       it('Should throw an error if s3Config.awsAccessKey is not provided for s3', function() {
           let err = null;
           try {
               const s3Service = S3StorageServiceFactory.create({
                   type: 's3',
                   s3Config: {
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

       it('Should throw an error if s3Config.awsSecretKey is not provided for s3', function() {
           let err = null;
           try {
               const s3Service = S3StorageServiceFactory.create({
                   type: 's3',
                   bucket: 'bucket',
                   s3Config: {
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

       it('Should throw an error if s3Config is not provided for s3', function() {
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
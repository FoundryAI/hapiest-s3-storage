'use strict';

const awsS3Config = require('./awsS3Config');
const hapiS3Config = require('./hapiConfig');
const factoryConfig = require('./factoryConfig');

module.exports = {
  awsS3ConfigSchema: awsS3Config,
  factoryConfigSchema: factoryConfig,
  hapiS3ConfigSchema: hapiS3Config
};

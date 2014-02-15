var config = require('./config/site');
if (config === null) throw new Error('Site requires config.');

var keystone = require('keystone');
keystone.init({
  
  'name': 'Mottram Evangelical Church',
  
  'favicon': 'public/favicon.ico',
  'less': 'public',
  'static': 'public',
  
  'views': 'templates/views',
  'view engine': 'jade',
  
  'auto update': true,
  // 'mongo': 'mongodb://localhost/mottramec',
  'mongo': 'mongodb://'+ (config.mottramConfigMongoCon || 'localhost')+'/mottramec',
  
  'session': true,
  'auth': true,
  'user model': 'User',
  'cookie secret': config.mottramConfigCookieSecret,

  's3 config': {
    'key'    : config.mottramConfigS3Key,
    'secret' : config.mottramConfigS3Secret,
    'bucket' : 'mottramec'
  },
  'cloudinary config': {
    'cloud_name' : 'jamlen',
    'api_key'    : config.mottramConfigCloudinaryKey,
    'api_secret' : config.mottramConfigCloudinarySecret
  }
  
});
 
require('./models');
 
keystone.set('routes', require('./routes'));
keystone.set('nav', {
  'users': 'users',
  'sermons': 'sermons',
  'others': ['user-groups', 'series', 'verses']
});
 
keystone.start();
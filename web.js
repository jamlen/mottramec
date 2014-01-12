var keystone = require('keystone');
keystone.init({
  
  'name': 'Mottram Evangelical Church',
  
  'favicon': 'public/favicon.ico',
  'less': 'public',
  'static': 'public',
  
  'views': 'templates/views',
  'view engine': 'jade',
  
  'auto update': true,
  'mongo': 'mongodb://localhost/mottramec',
  
  'session': true,
  'auth': true,
  'user model': 'User',
  'cookie secret': process.env.MOTTRAM_CONFIG_COOKIE_SECRET,

  's3 config': {
    'key'    : process.env.MOTTRAM_CONFIG_S3_KEY,
    'secret' : process.env.MOTTRAM_CONFIG_S3_SECRET,
    'bucket' : 'mottramec'
  },
  'cloudinary config': {
    'cloud_name' : 'jamlen',
    'api_key'    : process.env.MOTTRAM_CONFIG_CLOUDINARY_KEY,
    'api_secret' : process.env.MOTTRAM_CONFIG_CLOUDINARY_SECRET
  }
  
});
 
require('./models');
 
keystone.set('routes', require('./routes'));
 
keystone.start();
var keystone = require('keystone'),
    User = keystone.list('User');
 
exports = module.exports = function(done) {
    
    new User.model({
        name: { first: 'James', last: 'Allen' },
        email: 'james@mottramec.co.uk',
        password: 'admin',
        canAccessKeystone: true
    }).save(done);
    
};
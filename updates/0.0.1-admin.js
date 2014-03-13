var keystone = require('keystone'),
    User = keystone.list('User');
 
exports = module.exports = function(done) {
    

    User.model.findOne({ email: 'james@mottramec.co.uk' }).exec(function(err, user) {
        if (user) {
            console.log('Admin exists', user.email);
            done();
            return;
        }
        new User.model({
            name: { first: 'James', last: 'Allen' },
            email: 'james@mottramec.co.uk',
            password: 'admin',
            canAccessKeystone: true
        }).save(done);
    });
    
};
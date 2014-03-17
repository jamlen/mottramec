var keystone = require('keystone'),
    Types = keystone.Field.Types;
 
var UserGroup = new keystone.List('UserGroup', {
    autokey: { path: 'key', from: 'name' }
});
 
UserGroup.add({
    name: { type: String, required: true, index: true },
});

UserGroup.relationship({ path: 'users', ref: 'User', refPath: 'groups' });
 
UserGroup.register();

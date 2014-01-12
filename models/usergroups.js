var keystone = require('keystone'),
    Types = keystone.Field.Types;
 
var UserGroup = new keystone.List('UserGroup', {
    autokey: { path: 'key', from: 'name' }
});
 
UserGroup.add({
    name: { type: String, required: true, index: true }
});

UserGroup.relationship({ ref: 'User', path: 'groups' });
 
UserGroup.register();

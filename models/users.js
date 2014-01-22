var keystone = require('keystone'),
    Types = keystone.Field.Types;
 
var User = new keystone.List('User', {
    autokey: { path: 'slug', from: 'name', unique: true },
});
 
User.add({
    name: { type: Types.Name, required: true, index: true },
    email: { type: Types.Email, initial: true, required: true, index: true },
    password: { type: Types.Password, initial: true },
    canAccessKeystone: { type: Boolean, initial: true },
    groups: { type: Types.Relationship, ref: 'UserGroup', many: true }
});
 
User.register();

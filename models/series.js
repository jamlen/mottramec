var keystone = require('keystone'),
    Types = keystone.Field.Types;
 
var Series = new keystone.List('Series', {
    autokey: { path: 'slug', from: 'name', unique: true }
});
 
Series.add({
    name: { type: String, required: true, index: true }
});
 
Series.register();

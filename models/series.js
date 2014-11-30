var keystone = require('keystone'),
    Types = keystone.Field.Types;

var Series = new keystone.List('Series', {
    autokey: { path: 'slug', from: 'name', unique: true }
});

Series.add({
    name: { type: String, required: true, index: true, width: 'long' },
    image: { type: Types.CloudinaryImage, collapse: true },
    synopsis: { type: Types.Html, wysiwyg: true, collapse: true, height: 400 }
});

Series.register();

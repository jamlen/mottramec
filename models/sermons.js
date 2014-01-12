var keystone = require('keystone'),
    Types = keystone.Field.Types;
var Sermon = new keystone.List('Sermon', {
    autokey: { path: 'slug', from: 'title', unique: true },
    map: { name: 'title' },
    defaultSort: '-date'
});
Sermon.add({
    title: { type: String, required: true },
    state: { type: Types.Select, options: 'draft, published, archived', default: 'draft' },
    speaker: { type: Types.Relationship, ref: 'User'}, //, filters: {groups: true} },
    series: { type: Types.Relationship, ref: 'Series' },
    date: { type: Types.Date, default: Date.now },
    audio: { type: Types.S3File, collapse: true, allowedTypes:['audio/mp4', 'audio/mp3'] },
    presentation: { type: Types.CloudinaryImage, collapse: true },
    studyNotes: { type: Types.S3File, collapse: true, allowedTypes:['application/pdf'] },
    transcript: { type: Types.Html, wysiwyg: true, collapse: true, height: 400 }
});
Sermon.defaultColumns = 'date|10%, title, speaker|15%, series, state|10%'
Sermon.register();
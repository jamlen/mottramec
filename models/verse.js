var keystone = require('keystone'),
    Types = keystone.Field.Types;
 
var Verse = new keystone.List('Verse', {
	autoKey: { path: 'slug', from: 'osis', unique: true },
	map: { name: 'osis' },
    defaultSort: 'bookOrder chapter verse',
    noedit: true,
    nocreate: true,
    nodelete: true
});
 
Verse.add({
    osis: { type: String, required: true, index: true },
    book: { type: String, required: true, index: true },
    chapter: { type: Number, required: true },
    verse: { type: Number, required: true },
    bookOrder: { type: Number, required: true }
});

Verse.relationship({ path: 'sermons', ref: 'Sermon', refPath: 'bibleRefs'});

Verse.schema.virtual('format').get(function() {
    return this.book +' '+ this.chapter + ':'+ this.verse;
});

Verse.register();

var keystone = require('keystone'),
    _ = require('lodash'),
    util = require('util'),
    async = require('async'),
    Types = keystone.Field.Types;

var Sermon = new keystone.List('Sermon', {
    autokey: { path: 'slug', from: 'title', unique: true },
    map: { name: 'title' },
    defaultSort: '-date',
    drilldown: 'speaker series'
});

Sermon.add({
    title: { type: String, required: true },
    state: { type: Types.Select, options: 'draft, published, archived', default: 'draft' },
    speaker: { type: Types.Relationship, ref: 'User', filters: {groups:'52b4d2a907eb16176a000001'} },
    series: { type: Types.Relationship, ref: 'Series', width: 'long' },
    bibleRefs: { type: Types.Relationship, ref: 'Verse', many: true, label: 'Primary Verses' },
    date: { type: Types.Date, default: Date.now, initial: true, format: 'YYYY-MM-DD' },
    audio: { type: Types.S3File, collapse: true, allowedTypes:['audio/mp4', 'audio/mp3'] },
    presentation: { type: Types.CloudinaryImage, collapse: true, allowedTypes:['application/pdf'] },
    studyNotes: { type: Types.S3File, collapse: true, allowedTypes:['application/pdf'] },
    transcript: { type: Types.Html, wysiwyg: true, collapse: true, height: 400 },
    oldId: { type: Number, label: 'ID from old site', hidden: true },
});


Sermon.fields.audio.pre('upload', function(item, file, next) {
    var exec = require('child_process').exec;
    var fmt = 'id3v2 --artist "Mottram Evangelical Church" --TCOM "%s" --album "MEC - %s" -y %d -t "%s" -g 101 --TCOP "Copyright 2013 Mottram Evangelical Church" %s';

    async.parallel({
        speaker: function(callback){
            keystone.list('User').model.findById(item.speaker, function(err, speaker) {
                callback(err, speaker);
            });
        },
        series: function(callback){
            keystone.list('Series').model.findById(item.series, function(err, series) {
                callback(err, series);
            });
        }
    }, function(err, results){
        var cmd = util.format(fmt, results.speaker.name.full, results.series.name, item._.date.format('YYYY'), item.title, file.path);
        console.log('Updating ID3 tags.', cmd);
        exec(cmd, function(err, stdout, stderr){
            console.log(stdout, stderr);
            if (err !== null) {
              console.log('Failed to set ID3 tags', err);
            }
            next(err);
        });
    });
});

Sermon.schema.virtual('bibleRef').get(function() {
    if (_.any(this.bibleRefs)) {
        if (this.bibleRefs.length === 1) {
            return _.first(this.bibleRefs).format;
        }
        return _.first(this.bibleRefs).format + ' - ' + _.last(this.bibleRefs).format;
    }
});



Sermon.defaultColumns = 'date|11%, title, speaker|15%, series, state|8%';
Sermon.register();

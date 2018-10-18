var keystone = require('keystone'),
    debug = require('debug')('mottramec:sermon'),
    _ = require('lodash'),
    util = require('util'),
    async = require('async'),
    Types = keystone.Field.Types;

var config = require('../config/site');

var storage = new keystone.Storage({
    adapter: require('keystone-storage-adapter-s3'),
    s3: {
        key: config.mottramConfigS3Key, // required; defaults to process.env.S3_KEY
        secret: config.mottramConfigS3Secret, // required; defaults to process.env.S3_SECRET
        bucket: 'mottramec', // required; defaults to process.env.S3_BUCKET
        //region: 'ap-southeast-2', // optional; defaults to process.env.S3_REGION, or if that's not specified, us-east-1
    }
});

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
    audio: { type: Types.File, storage: storage, collapse: true, allowedTypes:['audio/mp4', 'audio/mp3', 'audio/mpeg'] },
    partialRecording: { type: Boolean, label: 'Partial Recording' },
    presentation: { type: Types.CloudinaryImage, collapse: true, allowedTypes:['application/pdf'], autoCleanup : true },
    studyNotes: { type: Types.File, storage: storage, collapse: true, allowedTypes:['application/pdf'] },
    transcript: { type: Types.Html, wysiwyg: true, collapse: true, height: 400 },
    oldId: { type: Number, label: 'ID from old site', hidden: true },
});


Sermon.fields.audio.pre('upload', function(item, file, next) {
    debug('pre:upload', item, file);
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
        var cmd = util.format(fmt, results.speaker.name.full, results.series.name ? results.series.name : 'Guest Speakers', item._.date.format('YYYY'), item.title, file.path);
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
    if (_.some(this.bibleRefs)) {
        if (this.bibleRefs.length === 1) {
            return _.first(this.bibleRefs).format;
        }
        return _.first(this.bibleRefs).format + ' - ' + _.last(this.bibleRefs).format;
    }
});

Sermon.schema.virtual('thumbnail').get(function() {
    if (!this._.presentation.src()) {
        return {
            img: null,
            isPdf: false
        };
    }
    return {
        img: this._.presentation.src({ transformation: 'mottram-thumb'}),
        isPdf: this.presentation.format.toLowerCase() === 'pdf'
    };
});

Sermon.defaultColumns = 'date|11%, title, speaker|15%, series, state|8%';
Sermon.register();

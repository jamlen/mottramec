var keystone = require('keystone'),
    async = require('async'),
    _ = require('lodash');

exports = module.exports = function(req, res) {
    var debug = require('debug')('mottramec:index');

    var view = new keystone.View(req, res),
        locals = res.locals,
        Sermon = keystone.list('Sermon');
    locals.section = 'sermon';
    locals.filters = {
        speaker: req.params.speaker,
        series: req.params.series,
        book: req.params.book,
        active: req.params.speaker || req.params.book || req.params.series || null
    };
    locals.data = {
        books: {
            Gen: "Genesis",
            Exod: "Exodus",
            Lev: "Leviticus",
            Num: "Numbers",
            Deut: "Deuteronomy",
            Josh: "Joshua",
            Judg: "Judges",
            Ruth: "Ruth",
            '1Sam': "1 Samuel",
            '2Sam': "2 Samuel",
            '1Kgs': "1 Kings",
            '2Kgs': "2 Kings",
            '1Chr': "1 Chronicles",
            '2Chr': "2 Chronicles",
            Ezra: "Ezra",
            Neh: "Nehemiah",
            Esth: "Esther",
            Job: "Job",
            Ps: "Psalms",
            Prov: "Proverbs",
            Eccl: "Ecclesiastes",
            Song: "Song of Songs",
            Isa: "Isaiah",
            Jer: "Jeremiah",
            Lam: "Lamentations",
            Ezek: "Ezekiel",
            Dan: "Daniel",
            Hos: "Hosea",
            Joel: "Joel",
            Amos: "Amos",
            Obad: "Obadiah",
            Jonah: "Jonah",
            Mic: "Micah",
            Nah: "Nahum",
            Hab: "Habakkuk",
            Zeph: "Zephaniah",
            Hag: "Haggai",
            Zech: "Zechariah",
            Mal: "Malachi",
            Matt: "Matthew",
            Mark: "Mark",
            Luke: "Luke",
            John: "John",
            Acts: "Acts",
            Rom: "Romans",
            '1Cor': "1 Corinthians",
            '2Cor': "2 Corinthians",
            Gal: "Galatians",
            Eph: "Ephesians",
            Phil: "Philippians",
            Col: "Colossians",
            '1Thess': "1 Thessalonians",
            '2Thess': "2 Thessalonians",
            '1Tim': "1 Timothy",
            '2Tim': "2 Timothy",
            Titus: "Titus",
            Phlm: "Philemon",
            Heb: "Hebrews",
            Jas: "James",
            '1Pet': "1 Peter",
            '2Pet': "2 Peter",
            '1John': "1 John",
            '2John': "2 John",
            '3John': "3 John",
            Jude: "Jude",
            Rev: "Revelation"
        }
    };

    view.query('serieses', keystone.list('Series').model.find());
    view.query('speakers', keystone.list('User').model.find({groups: '52b4d2a907eb16176a000001'}));

    //find the object to filter from
    view.on('init', function(next) {
        if (req.params.speaker) {
            debug('populating speaker');
            keystone.list('User').model.findOne({
                key: locals.filters.speaker
            }).exec(function(err, result) {
                if (err || !result) return next(err);
                debug('found the speaker', result);
                locals.data.speaker = result;
                next();
            });
        } else if (req.params.series) {
            keystone.list('Series').model.findOne({
                slug: locals.filters.series
            }).exec(function(err, result) {
                if (err || !result) return next(err);
                locals.data.series = result;
                next();
            });
        } else {
            next();
        }
    });


    view.on('init', function(next) {
        var q = keystone.list('Sermon').model.find({})
            .where('state', 'published');
        let query;
        if (locals.data.speaker) {
            debug('looking for speaker', locals.filters.speaker);
            q.where('speaker').equals(locals.data.speaker);
        } else if (locals.data.series) {
            debug('looking for series', locals.filters.series);
            q.where('series').equals(locals.data.series);
        }
        q.sort('-date')
            .populate('series speaker bibleRefs')
            .exec(function(err, results) {
                if (locals.filters.book) {
                    debug('book fitler', locals.filters.book);
                    async.filter(results, function (sermon, callback) {
                        var books = _.map(sermon.bibleRefs, 'book');
                        var included = _.includes(books, locals.filters.book);
                        debug(`sermon ${sermon.title} ${included ? 'includes' : 'does not include'} book ${locals.filters.book}`, books);
                        callback(null, included);
                    }, function (err, sermons) {
                        debug(`found ${_.size(sermons)} results`, err);
                        locals.data.sermons = sermons;
                        locals.sermons = sermons;
                        next(err);
                    });
                } else {
                    debug(`found ${_.size(results)} results`, err);
                    locals.data.sermons = results;
                    locals.sermons = results;
                    next(err);
                }
            });
    });
    view.render('index');

}

var keystone = require('keystone');
var _ = require('lodash');

var Sermon = keystone.list('Sermon');

exports = module.exports = function(req, res) {
    var locals = res.locals;

    locals.section = 'sermon';
    locals.filters = {
        sermon: req.params.sermon,
        latest: (req.params.sermon === 'latest'),
        limit: req.params.limit || 10,
        old: !_.isNaN(_.parseInt(req.params.sermon))
    };

    var projectSermon = function(sermon, host, callback){
        var apiSermon = {
            title: sermon.title,
            date: sermon.date,
            series: _.isEmpty(sermon.series) ? null : sermon.series.name,
            speaker: sermon.speaker.name.full,
            thumbnail: sermon.thumbnail.img,
            bibleRefs: sermon.bibleRefs,
            audio: sermon.audio.url,
            url: 'http://' + host + '/sermon/'+sermon.slug
        };
        callback(apiSermon);
    };

    var q = Sermon.model.findOne()
        .where('state', 'published')
        .populate('series speaker bibleRefs');

    if (locals.filters.latest) {
        q = q.sort({date:-1}).limit(1);
    } else if (locals.filters.old) {
        q = q.where('oldId', locals.filters.sermon);
    } else {
        q = q.where('slug', locals.filters.sermon);
    }
    q.exec(function(err, sermon) {
        if (err) return res.apiError(null, err);
        if (!sermon) return res.apiResponse(404);
        projectSermon(sermon, req.headers.host, res.apiResponse);
    });
}

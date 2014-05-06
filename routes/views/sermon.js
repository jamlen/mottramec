var keystone = require('keystone');

var Sermon = keystone.list('Sermon');

exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res),
        locals = res.locals;

    locals.section = 'sermon';
    locals.filters = {
        sermon: req.params.sermon,
        latest: (req.params.sermon === 'latest')
    };

    view.on('init', function(next) {
        if (locals.filters.latest) {
            Sermon.model.findOne()
                .where('state', 'published')
                .sort({date:-1})
                .limit(1)
                .populate('series speaker bibleRefs')
                .exec(function(err, sermon) {
                    console.log('sermon', sermon);
                        if (err) return res.err(err);
                        if (!sermon) return res.notfound('Sermon not found');
                        locals.sermon = sermon;
                        next();
                });
        } else {
            Sermon.model.findOne()
                .where('state', 'published')
                .where('slug', locals.filters.sermon)
                .populate('series speaker bibleRefs')
                .exec(function(err, sermon) {
                        if (err) return res.err(err);
                        if (!sermon) return res.notfound('Sermon not found');
                        locals.sermon = sermon;
                        next();
                });
        }
    });
    view.render('sermon');
}

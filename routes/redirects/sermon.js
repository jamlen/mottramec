var keystone = require('keystone'),
    Sermon = keystone.list('Sermon');

module.exports = function(req, res) {
    Sermon.model.findOne().where('oldId', req.query.id).exec(function(err, sermon) {
        if (err) return res.status(500).render('errors/500'); // or however you handle errors
        if (!sermon) return res.status(404).render('errors/404'); // or your 404 template path
        res.status(301).redirect('/sermon/' +sermon.slug);
    });
}

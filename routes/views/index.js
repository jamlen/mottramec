var keystone = require('keystone');

exports = module.exports = function(req, res) {
        
    var view = new keystone.View(req, res),
        locals = res.locals;
    
    locals.section = 'sermon';
    
    view.query('sermons', keystone.list('Sermon').model.find()
        .populate('series speaker')
    	.where('state', 'published')
    	.sort('sortOrder'));
    
    view.render('index');
        
}
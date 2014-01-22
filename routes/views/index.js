var keystone = require('keystone'),
	async = require('async');

exports = module.exports = function(req, res) {
		
	var view = new keystone.View(req, res),
		locals = res.locals;
	console.log('req.params', req.params);
	locals.section = 'sermon';
	locals.filters = {
		speaker: req.params.speaker
	};
	locals.data = {
		sermons: [],
		books: [],
		speakers: [],
		series: []
	};
	
	view.on('init', function(next){
		var q = keystone.list('Sermon').model.find()
			.populate('series speaker bibleRefs')
			.where('state', 'published')
			.sort('-date');

		// 	q.where('speaker').in([locals.filters.speaker.id]);

		q.exec(function(err, results){
			if (locals.filters.speaker) {
				async.filter(results, function(sermon, callback){
					console.log(sermon.speaker.key, locals.filters.speaker);
					callback(sermon.speaker.key === locals.filters.speaker);
				}, function(results){
					console.log(results);
					locals.data.sermons = results;
					locals.sermons = results;
					next(err);
				});
			} else {
				locals.data.sermons = results;
				locals.sermons = results;
				next(err);
			}
		});
	});

	// Load all speakers
	view.on('init', function(next){
		//need to find correct way of finding users in a particular group
		keystone.list('User').model.find({groups: '52b4d2a907eb16176a000001'}).exec(function(err, results){
			if (err || !results.length){
				return next(err);
			}
			locals.data.speakers = results;
			async.each(locals.data.speakers, function(speaker, next){
				keystone.list('Sermon').model.count().where('speaker').in([speaker.id]).exec(function(err, count){
					speaker.sermonCount = count;
					console.log('speaker', speaker);
					next(err);
				});
			}, function(err){
				next(err);
			})
		});
	});
	
	view.on('init', function(next){
		if (req.params.speaker){
			keystone.list('User').model.findOne({slug: locals.filters.speaker}).exec(function(err, result){
				locals.data.speaker = result
				next(err);
			});
		} else if (req.params.book){

		} else {
			next();
		}
	});

	view.render('index');
		
}
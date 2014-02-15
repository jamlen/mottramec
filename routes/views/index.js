var keystone = require('keystone'),
	async = require('async'),
	_ = require('lodash');

exports = module.exports = function(req, res) {
		
	var view = new keystone.View(req, res),
		locals = res.locals;
	locals.section = 'sermon';
	locals.filters = {
		speaker: req.params.speaker,
		series: req.params.series,
		book: req.params.book,
		active: req.params.speaker || req.params.book || req.params.series || null
	};
	locals.data = {};
	
	view.on('init', function(next){
		var q = keystone.list('Sermon').model.find()
			.populate('series speaker bibleRefs')
			.where('state', 'published')
			.sort('-date');

		// q.where('speaker').in([locals.filters.speaker.id]);

		q.exec(function(err, results){
			if (locals.filters.speaker) {
				async.filter(results, function(sermon, callback){
					callback(sermon.speaker.key === locals.filters.speaker);
				}, function(results){
					locals.data.sermons = results;
					locals.sermons = results;
					next(err);
				});
			} else if (locals.filters.series) {
				async.filter(results, function(sermon, callback){
					callback(sermon.series && sermon.series.slug === locals.filters.series);
				}, function(results){
					locals.data.sermons = results;
					locals.sermons = results;	
					next(err);
				});
			} else if (locals.filters.book) {
				async.filter(results, function(sermon, callback){
					callback(_.contains(sermon.bibleRefs, locals.filters.book));
				}, function(results){
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
					next(err);
				});
			}, function(err){
				next(err);
			})
		});
	});
	
	// Load all series
	view.on('init', function(next){
		keystone.list('Series').model.find().exec(function(err, results){
			if (err || !results.length){
				return next(err);
			}
			locals.data.series = results;
			async.each(locals.data.series, function(series, next){
				keystone.list('Sermon').model.count().where('series').in([series.id]).exec(function(err, count){
					series.sermonCount = count;
					next(err);
				});
			}, function(err){
				next(err);
			})
		});
	});

	// Load all books
	view.on('init', function(next){
		keystone.list('Sermon').model.find()
			.populate('bibleRefs')
			.exec(function(err, results){
			if (err || !results.length){
				return next(err);
			}

			var books = _.chain(results)
				.map(function(sermon){ return sermon.bibleRefs })
				.flatten()
				.map(function(ref){ return ref.book })
				.uniq()
				// .map(function(ref){ return bibleBooks[osisID] })
				.value();
			locals.data.books = books;
			next(err);
			// async.each(results, function(sermon, next){

			// 	locals.data.books = results;
			// 	keystone.list('Sermon').model.count().where('series').in([series.id]).exec(function(err, count){
			// 		series.sermonCount = count;
			// 		next(err);
			// 	});
			// }, function(err){
			// 	next(err);
			// })
		});
	});
	
	view.on('init', function(next){
		if (req.params.speaker){
			keystone.list('User').model.findOne({slug: locals.filters.speaker}).exec(function(err, result){
				locals.data.speaker = result
				next(err);
			});
		} else if (req.params.book){
			next();
		} else {
			next();
		}
	});

	view.render('index');
		
}
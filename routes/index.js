var keystone = require('keystone'),
    middleware = require('./middleware'),
    importRoutes = keystone.importer(__dirname),
    redirect = require('express-redirect');

// Common Middleware
keystone.pre('routes', middleware.initErrorHandlers);
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Handle 404 errors
keystone.set('404', function(req, res, next) {
    res.notfound();
});

// Handle other errors
keystone.set('500', function(err, req, res, next) {
    var title, message;
    if (err instanceof Error) {
        message = err.message;
        err = err.stack;
    }
    console.log(err);
    res.err(err, title, message);
});

// Load Routes
var routes = {
	api: importRoutes('./api'),
    views: importRoutes('./views'),
    redirects: importRoutes('./redirects'),
};

// Bind Routes
exports = module.exports = function(app) {

    redirect(app);
    app.redirect('/index.php', '/', 301);
    app.redirect('/sermons.php', '/', 301);
    app.all('/sermon.php', routes.redirects.sermon);

    app.get('/', routes.views.index);
    app.get('/sermon/:sermon', routes.views.sermon);
    app.get('/speakers/:speaker', routes.views.index);
    app.get('/series/:series', routes.views.index);
    app.get('/books/:book', routes.views.index);

	// API
	app.all('/api*', keystone.initAPI);
	app.all('/api/sermon/:sermon', routes.api.sermon);

}

var keystone = require('keystone'),
	async = require('async'),
	Verse = keystone.list('Verse'),
	bcv_parser = require('../lib/en_bcv_parser.min.js').bcv_parser,
	bcv = new bcv_parser();

var trans = 'default',
	book_order = [];

var get_book_order, get_intermediate_books, get_intermediate_verses, get_last_chapter_in_book, get_last_verse_in_chapter,
  __hasProp = {}.hasOwnProperty;

get_intermediate_verses = function(start, end) {
  var b, books, c, eb, ec, end_chapter, end_verse, ev, sb, sc, start_verse, sv, v, verses, _i, _j, _len, _ref, _ref1;
  _ref = start.split("."), sb = _ref[0], sc = _ref[1], sv = _ref[2];
  _ref1 = end.split("."), eb = _ref1[0], ec = _ref1[1], ev = _ref1[2];
  sc = parseInt(sc, 10);
  sv = parseInt(sv, 10);
  ec = parseInt(ec, 10);
  ev = parseInt(ev, 10);
  verses = [];
  if (sb === eb) {
    if (ec < sc) {
      return [];
    }
    if (sc === ec) {
      if (ev < sv) {
        return [];
      }
      for (v = _i = sv; sv <= ev ? _i <= ev : _i >= ev; v = sv <= ev ? ++_i : --_i) {
        verses.push("" + sb + "." + sc + "." + v);
      }
    } else {
      verses = get_intermediate_verses(start, "" + sb + "." + sc + "." + (get_last_verse_in_chapter(sb, sc)));
      c = sc + 1;
      while (c < ec) {
        verses = verses.concat(get_intermediate_verses("" + sb + "." + c + ".1", "" + sb + "." + c + "." + (get_last_verse_in_chapter(sb, c))));
        c++;
      }
      verses = verses.concat(get_intermediate_verses("" + eb + "." + ec + ".1", end));
    }
  } else {
    books = get_intermediate_books(sb, eb);
    for (_j = 0, _len = books.length; _j < _len; _j++) {
      b = books[_j];
      start_verse = b === sb ? start : "" + b + ".1.1";
      end_verse = "";
      if (b === eb) {
        end_verse = end;
      } else {
        end_chapter = get_last_chapter_in_book(b);
        end_verse = "" + b + "." + end_chapter + "." + (get_last_verse_in_chapter(b, end_chapter));
      }
      verses = verses.concat(get_intermediate_verses(start_verse, end_verse));
    }
  }
  return verses;
};

get_intermediate_books = function(sb, eb) {
  var books, end_i, start_i;
  start_i = bcv.translations[trans].order[sb];
  end_i = bcv.translations[trans].order[eb];
  if (end_i < start_i) {
    return [];
  }
  if (end_i === start_i + 1) {
    return [sb, eb];
  }
  get_book_order();
  return books = book_order.slice(start_i, end_i + 1);
};

get_last_verse_in_chapter = function(b, c) {
  return bcv.translations[trans].chapters[b][c - 1];
};

get_last_chapter_in_book = function(b) {
  return bcv.translations[trans].chapters[b].length;
};

get_book_order = function() {
  var book, sort_order, _ref, _results;
  if (book_order.length > 0) {
    return;
  }
  _ref = bcv.translations[trans].order;
  _results = [];
  for (book in _ref) {
    if (!__hasProp.call(_ref, book)) continue;
    sort_order = _ref[book];
    _results.push(book_order[sort_order] = book);
  }
  return _results;
};

var verses = get_intermediate_verses("Gen.1.1", "Rev.22.22");


function createVerse(verseRef, done) {
	Verse.model.findOne({ osis: verseRef }).exec(function(err, v) {
    if (v) {
      console.log('verse exists', v.osis);
      done();
      return;
    }
		var newV = new Verse.model();
		newV.osis = verseRef;
		var vs = verseRef.split('.');
		newV.book = vs[0];
		newV.chapter = vs[1];
		newV.verse = vs[2];
    newV.bookOrder = book_order.indexOf(newV.book);
		newV.save(function(err, obj) {
			if (err) {
				console.error("Error adding verse " + verseRef + " to the database:");
				console.error(err);
			} else {
				console.log("Added verse " + obj.osis + " to the database.");
			}
			done();
		});
	});
}

exports = module.exports = function(done) {
	async.forEach(verses, createVerse, done);
};
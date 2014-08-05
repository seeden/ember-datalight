Ember DataLight
===============

A lightweight data persistence library for Ember with full support of JSON structure


## Motivation

In couple of my first projects I used a standard ember-data library. It was sufficient for these simple projects.
But my latest projects was build with mongodb and structured JSON documents. When I had a look on source code of ember-data 
I was really surprised from its implementation. 
In my opinion it has no a good base and it will have a big problem in the long run.
Please, if you will use this library and you will find a bug send me a feedback about this issue. Thank you.
At the end: I'm still working on the source code and tests. Next step is better documentation.


## Features

 * Structured JSON
 * Used standard javascript types for model definition
 * Cached (if you want)
 * CRUD
 * Better and smaller


## Models

Each model you create should extend DataLight.Model or DataLight.CachedModel:

	var DL = require('ember-datalight'),
		Model = DL.Model,
		attr = Model.attribute;

	App.User = Model.extend({
		id: attr(String, { readOnly: true }),

		username: attr(String),
		email: attr(String),
		name: attr(String),

		address: attr({
			primary: attr(Boolean, { defaultValue: false }),
			street: attr(String),
			city: attr(String),
			zip: attr(String),
			created: attr(Date, { readOnly: true })
		})
	});

Supported attribute types are String, Boolean, Number, [], {}, and Date. Defining a type is optional.


## Relationships

For one-to-one and one-to-many relationships use Model as attribute parameter.

	var DL = require('ember-datalight'),
		Model = DL.Model,
		attr = Model.attribute;

	App.User = Model.extend({
		id: attr(String, { readOnly: true }),
		name: attr(String)
	});

	App.Tag = Model.extend({
		name: attr(String),
		count: attr(Number)
	});

	App.Article = Model.extend({
		content: attr(String),
		user: attr(App.User, { readOnly: true }), //one-to-one relationship
		tags: attr([App.Tag])  //one-to-many relationship
	});

When you call article.get('user') you will get a proxy object linked with user

# Finding records

To find a Post with an id of '456789':

	App.Post.find('456789').then(function(post) {

	});

To find a first 100 posts:

	App.Post.find({ limit: 100 }).then(function(posts) {

	});


# Creating records

Create records like you would a normal Ember Object:

	var post = App.Post.create({
		title: 'Best Post'
	});

# Saving records

For saving you need to call method named save. This method returns a promise.

	var post = App.Post.create({ 
		title: 'Best Post' 
	});

	post.save().then(function() {
		console.log('SUCCESS');
	}, function() {
		console.log('ERROR');
	});

# Updating records

Simply call save again.

	var post = App.Post.create({ 
		title: 'Best Post' 
	});

	post.save().then(function() {
		post.set('title', 'Changed title');
		post.save();
	};


## Credits

[Zlatko Fedor](http://github.com/seeden)


## License

The MIT License (MIT)

Copyright (c) 2014 Zlatko Fedor zlatkofedor@cherrysro.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
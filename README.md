Ember DataLight
===============

A lightweight data persistence library for Ember with full support of JSON structure


## Features

 * Structured JSON
 * Used standard javascript types for model definition
 * Cached
 * CRUD
 * Better and smaller

I am trying to use API similar to ember-data but their API is sometimes uselessly very complicated.

## Models

Each model you create should extend DataLight.Model or DataLight.CachedModel:

	var DL = require('ember-datalight'),
		Model = DL.Model,
		attr = Model.attribute;

	App.User = Model.extend({
		id: attr(String, { put: false }),

		username: attr(String),
		email: attr(String),
		name: attr(String),

		address: attr({
			primary: attr(Boolean, { defaultValue: false }),
			street: attr(String),
			city: attr(String),
			zip: attr(String),
			created: attr(Date, { put: false, readOnly: true })
		})
	});

Supported attribute types are String, Boolean, Number, [], {}, and Date. Defining a type is optional.


## Relationships

For one-to-one and one-to-many relationships use the belongsTo attribute helper.

	var DL = require('ember-datalight'),
		Model = DL.Model,
		attr = Model.attribute;

	App.User = Model.extend({
		id: attr(String, { put: false }),
		name: attr(String)
	});

	App.Tag = Model.extend({
		name: attr(String),
		count: attr(Number)
	});

	App.Article = Model.extend({
		content: attr(String),
		user: attr(String, { belongsTo: App.User }), //one-to-one relationship
		tags: attr([], { belongsTo: App.Tag })  //one-to-many relationship
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

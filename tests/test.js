/**
 * @author Dmitry Ilin @ MyLove Company, LLC <dmitry@mylovecompany.com>
 */

var vows        = require('vows'),
	assert      = require('assert'),
	events      = require('events'),
	mongoose    = require('../node_modules/mongoose'),
	pureautoinc = require('../index'),
	Schema      = mongoose.Schema,
	db          = mongoose.createConnection('127.0.0.1', 'pureautoinc_test');

pureautoinc.init(db);


var suite = vows.describe('Testing Schema creation and auto incrementing');

suite.addBatch({

	'After schema creation and plugin application': {

		topic: function () {

			var schema = new Schema({
				email: String,
				text:  String
			});

			var pluginParameters = {
				model: 'Subscriber',
				field: 'sequenceNumber'
			};

			schema.plugin(pureautoinc.plugin, pluginParameters);

			var Subscriber = db.model('Subscriber', schema);

			var Test = {
				model: db.model('Subscriber'),
				pluginParameters: pluginParameters
			};

			return Test;
		},
		
		'schema gained auto increment field': function (topic) {
			
			assert.ok(topic.model.schema.paths[topic.pluginParameters.field]);
		},

		'and model created': {

			topic: function (Model) {

				var promise = new (events.EventEmitter);

				var subscriber;
				var count = 5;

				function save (counter) {

					subscriber = new Model.model({
						email: 'useremail@emailserver.com',
						text:  'some text'
					});

					subscriber.save(function (err, res) {

						if (err)
							promise.emit('error', err, Model);
						else if (counter < count)
							save(++counter);
						else
							promise.emit('success', res, Model);
					});
				}
				save(1);

				return promise;
			},

			'data saved successfully': function (err, res, Model) {

				assert.ok(res);
			},

			'and if we look at indexes': {

				topic: function (promise, Model) {

					var promise = new (events.EventEmitter);

					Model.model.collection.getIndexes(function (err, res) {
						if (err)
							promise.emit('error', err, Model);
						else
							promise.emit('success', res, Model);
					});

					return promise;
				},

				'index created successfully': function (err, res, Model) {

					assert.ok(res[Model.pluginParameters.field + '_1']);
				},

				'and after documents created': {

					topic: function (promise, Model) {

						var promise = new (events.EventEmitter);

						Model.model.find({}, function (err, res) {

							Model.model.collection.drop(function (err) { });
							
							var counter = Model.pluginParameters.start;
							for (var i = 0; i < res.length; i++) {
								if (res[i][Model.pluginParameters.field] != counter)
									promise.emit('error', err, Model);
								counter++;
							}
							promise.emit('success', res, Model);
						});

						return promise;
					},

					'data contains right sequence numbers': function (err, res, Model) {

						assert.ok(res);
					}
				}
			}
		}
	},
	
	'When disabling increment field updates': {
		topic: function () {

			var schema = new Schema({
				author: String,
				text:  String
			});

			var pluginParameters = {
				model: 'Publication',
				field: 'sequenceNumber',
				update: false
			};

			schema.plugin(pureautoinc.plugin, pluginParameters);

			var Publication = db.model('Publication', schema);

			var Test = {
				model: db.model('Publication'),
				pluginParameters: pluginParameters
			};

			var promise = new (events.EventEmitter);

			var publication = new Test.model({
				author: 'some author',
				text:  'some text'
			});

			publication.save(function (err, pub) {
				var initialAutoIncVal;
				if (err) {
					promise.emit('error', err);
				}
				else {
					initialAutoIncVal = pub.sequenceNumber;
					// Re-save the document to test if the auto inc value is incremented
					pub.save(function (err, pub) {
						if (err)
							promise.emit('error', err);
						else
							promise.emit('success', pub, initialAutoIncVal);
					});
				}
			});

			return promise;
		},
		
		'auto increment field isn\'t incremented on update': function (err, publication, initialAutoIncVal) {
			assert.equal(publication.sequenceNumber, initialAutoIncVal);
		}

	}
}).export(module);
/**
 * @author Dmitry Ilin @ MyLove Company, LLC <dmitry@mylovecompany.com>
 */

module.exports = new (function () {

	var	db,
		Counter,
		mongoose,
		counterName;

	this.plugin = function(schema, options) {

		if (!options.model)
			throw new Error('Missing required parameter: model');

		options.model = options.model.toLowerCase();
		options.field = options.field || 'sequenceNumber';
		options.start = (!isNaN(options.start)) ? options.start : 0;
		
		var fields = {},
			ready  = false;
		
		// Adding new field into schema
		fields[options.field] = {
			type:    Number,
			unique:  true,
			require: true
		};
		schema.add(fields);

		// Initializing of plugin
		Counter.findOne({
			model: options.model,
			field: options.field
		}, function (err, res) {
			if (!res)
				(new Counter({
					model: options.model,
					field: options.field,
					c:     options.start
				})).save(function () {
					ready = true;
				});
			else
				ready = true;
		});

		schema.pre('save', function (next) {

			var doc = this;

			// Delay before plugin will be sucessfully initialized
			function save () {

				if (ready)
					Counter.collection.findAndModify({
						model: options.model,
						field: options.field
					}, [], {
						$inc: {
							c: 1
						}
					}, {
						'new':  true,
						upsert: true
					}, function (err, res) {

						if (!err && !(options.field in doc))
							doc[options.field] = res.c - 1;
						next(err);
					});
				else
					setTimeout(save, 5);
			}
			save();
		});
	};

	this.init = function (database, counter) {

		db          = database;
		mongoose    = require('mongoose');
		counterName = counter || 'counter';

		var schema = new mongoose.Schema({
			model: {
				type:    String,
				require: true
			},
			field: {
				type:    String,
				require: true
			},
			c: {
				type:      Number,
				'default': 0
			}
		});
		schema.index({ field: 1, model: 1 }, { unique: true, required: true, index: -1 });

		Counter = db.model(counterName, schema);
	};

})();

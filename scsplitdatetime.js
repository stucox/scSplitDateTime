// scSplitDateTime
// Version: 0.2.0
// Currently only supports yyyy-mm-dd and HH:MM formats
// Variable names ending in _ are DOM elements
// TODO: add custom formatting
// TODO: manage associated datalists - need to split datetime values for each
//  option
// TODO: support for datetime-local
// TODO: Add validation to final datetime value, because no validation provided
//  by time field
// TODO: Consider dynamic validation for time value, based on selected date?
var scSplitDateTime = (function() {

	var baseOptions = {
		dateType: 'date',
		timeType: 'time',
		dateClassName: 'scsplitdatetime-date',
		timeClassName: 'scsplitdatetime-time',
		parser: function(dateString) {
			return new Date(Date.parse(dateString));
		}
	};

	// Quick 2-digit number padding function (e.g. 1 -> 01)
	function pad(n) {
		return parseInt(n, 10) < 10 ? '0' + n : n.toString();
	}

	// Function to take a datetime string and return separate date and time
	// strings as a [date, time] array
	function splitDateString(dateString, parser) {
		// Datejs doesn't patch Date constructor, so use Date.parse (which *is*
		// patched) first - a few extra chars to save Datejs users some pain
		var dt = parser(dateString);
		// If we can't parse the datetime, leave blank
		if(dt == 'Invalid Date') {
			return ['', ''];
		}
		var date = pad(dt.getFullYear()) + '-' + pad(dt.getMonth() + 1) + '-' +
				pad(dt.getDate()),
			time = pad(dt.getHours()) + ':' + pad(dt.getMinutes());
		return [date, time];
	}

	// Wrap an element with a new node with the given tag name
	function wrap(el_, nodeName) {
		var wrapper_ = document.createElement(nodeName);
		el_.parentNode.insertBefore(wrapper_, el_);
		wrapper_.appendChild(el_);
		return wrapper_;
	}

	// Updates the value of a datetime field from date and time fields
	function update(datetime_, date_, time_) {
		var date = new Date(date_.value),
			// Date constructor cannot handle a time alone, so give it an
			//  arbitrary date
			time = new Date('1970-01-01T' + time_.value);
		if(date == 'Invalid Date' || time == 'Invalid Date') {
			datetime_.value = "";
		}
		else {
			datetime_.value = pad(date.getFullYear()) + '-' +
					pad(date.getMonth()+1) + '-' + pad(date.getDate()) +
					' ' + pad(time.getHours()) + ':' + pad(time.getMinutes());
		}
		// Update attribute
		datetime_.setAttribute('value', datetime_.value);
	}

	// IE-friendly method for changing input type
	function changeInputType(oldObject, oType) {
		// Old IE won't let us assign HTML5 input types, so we need to create &
		// replace, but using innerHTML() so it doesn't notice that we're using
		// HTML5 types. Sneaky.
		var parent = document.createElement('span');
		parent.innerHTML = '<input type="' + oType + '">';
		var newObject = parent.childNodes[0];
		// Unfortunately this means we have to copy properties across the hard
		// way
		for(var prop in oldObject) {
			if(oldObject[prop] && prop != 'type') {
				try {
					newObject[prop] = oldObject[prop];
				} catch(e) {}
			}
		}
		if(oldObject.parentNode) {
			oldObject.parentNode.replaceChild(newObject, oldObject);
		}
		return newObject;
	}

	// Resolve options from base & user provided (simple enough case for
	// shallow merge)
	function resolveOptions(options) {
		var mergedOptions = {},
			attrname = null;
		for(attrname in baseOptions) {
			mergedOptions[attrname] = baseOptions[attrname];
		}
		for(attrname in options) {
			mergedOptions[attrname] = options[attrname];
		}
		return mergedOptions;
	}

	// Main function to split a datetime field
	// Params:
	// - `datetime_`: DOM element to split
	// - `options`: a hash of options to override baseOptions
	function init(datetime_, options) {
		// Apply options
		options = resolveOptions(options);

		// Process:
		// - Wrap with a <span> to keep it all together
		// - Add a new date and time fields to replace the datetime field
		// - Hide the datetime, so that it still submits correctly
		var container_ = wrap(datetime_, 'span'),
			date_ = datetime_.cloneNode(false),
			time_ = datetime_.cloneNode(false);

		container_.className = 'scsplitdatetime';
		date_ = changeInputType(date_, options.dateType);
		time_ = changeInputType(time_, options.timeType);

		// Avoid duplicate IDs
		date_.id = null;
		time_.id = null;

		date_.className = options.dateClassName;
		time_.className = options.timeClassName;

		// Hiding the datetime field with type=hidden instead of CSS because it
		// makes semantic sense: this shouldn't be edited by the user
		datetime_ = changeInputType(datetime_, 'hidden');

		// `value`, `min` and `max` attributes are datetime strings which need
		// careful handling for date and time:
		// - new date element should copy the date portion of each of these
		// - new time element should copy the time portion for its value
		// - time element shouldn't validate min/max as these depend on the date
		var valueDateAndTime = splitDateString(datetime_.value, options.parser);
		var minDateAndTime = splitDateString(datetime_.min, options.parser);
		var maxDateAndTime = splitDateString(datetime_.max, options.parser);
		date_.value = valueDateAndTime[0];
		date_.min = minDateAndTime[0];
		date_.max = maxDateAndTime[0];
		time_.value = valueDateAndTime[1];
		time_.min = "";
		time_.max = "";

		// Remove `name` properties so that the new fields aren't submitted;
		// we'll keep the hidden datetime field in sync
		date_.name = "";
		time_.name = "";

		// Event handlers to keep the hidden datetime field in sync
		var events = ['change', 'blur'],
			updateHandler = function() {
				update(datetime_, date_, time_);
			};
		for(var i in events) {
			if(document.addEventListener) {
				date_.addEventListener(events[i], updateHandler, false);
				time_.addEventListener(events[i], updateHandler, false);
			}
			else {
				date_.attachEvent(events[i], updateHandler);
				time_.attachEvent(events[i], updateHandler);
			}
		}
		container_.appendChild(date_);
		container_.appendChild(time_);
	}

	// Public object; also acts as a constructor
	var scSplitDateTime = function(element, options) {
		init(element, options);
	};

	// Function to allow the default date parser to be replaced
	scSplitDateTime.setDefaultParser = function(parseFn) {
		baseOptions.parser = parseFn;
	};

	return scSplitDateTime;

})();

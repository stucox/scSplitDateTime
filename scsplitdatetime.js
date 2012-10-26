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

	// Quick 2-digit number padding function (e.g. 1 -> 01)
	function pad(n) {
		return parseInt(n, 10) < 10 ? '0' + n : n.toString();
	}

	// Function to take a datetime string and return separate date and time
	// strings as a [date, time] array
	function splitDateString(dateString) {
		var dt = new Date(dateString);
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
	}

	// Main function to split a datetime field
	function init(datetime_) {
		// Process:
		// - Wrap with a <span> to keep it all together
		// - Add a new date and time fields to replace the datetime field
		// - Hide the datetime, so that it still submits correctly
		var container_ = wrap(datetime_, 'span'),
			date_ = datetime_.cloneNode(true),
			time_ = datetime_.cloneNode(true);

		container_.className = 'scsplitdatetime';
		date_.type = 'date';
		time_.type ='time';

		// Avoid duplicate IDs
		date_.id = '';
		time_.id = '';

		// Hiding the datetime field with type=hidden instead of CSS because it
		// makes semantic sense: this shouldn't be edited by the user
		datetime_.type = 'hidden';

		// `value`, `min` and `max` attributes are datetime strings which need
		// careful handling for date and time:
		// - new date element should copy the date portion of each of these
		// - new time element should copy the time portion for its value
		// - time element shouldn't validate min/max as these depend on the date
		var valueDateAndTime = splitDateString(datetime_.value);
		var minDateAndTime = splitDateString(datetime_.min);
		var maxDateAndTime = splitDateString(datetime_.max);
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

	return init;

})();

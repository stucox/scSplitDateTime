// scSplitDateTime
// Version: 0.1.0
// Currently only supports yyyy-mm-dd and HH:MM formats
// TODO: add custom formatting
// TODO: manage associated datalists - need to split datetime values for each option
// TODO: support for datetime-local
// TODO: Add validation to final datetime value, because no validation provided by time field
// TODO: Consider dynamic validation for time value, based on selected date?
(function($) {

	// Quick 2-digit number padding function (e.g. 1 -> 01)
	function pad(n) {
		return parseInt(n, 10) < 10 ? '0' + n : n.toString();
	}

	// Function to take a datetime string and return separate date and time strings as a [date, time] array
	function splitDateString(dateString) {
		var dt = new Date(dateString);
		// If we can't parse the datetime, leave blank
		if(dt == 'Invalid Date') {
			return ['', ''];
			//var today = new Date();
			//dt = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		}
		var date = pad(dt.getFullYear()) + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()),
			time = pad(dt.getHours()) + ':' + pad(dt.getMinutes());
		return [date, time];
	}

	$.fn.scSplitDateTime = function() {

		var $datetimes = this;

		$datetimes.each(function() {
			// Process:
			// - Wrap with a <span> to keep it all together
			// - Add a new date and time fields to replace the datetime field
			// - Hide the datetime, so that it still submits correctly
			var $datetime = $(this).wrap('<span class="scdatetime">'),
				$container = $datetime.parent(),
				// Create date & time inputs with the same attrs as the original datetime element
				$date = $datetime.clone().attr('type', 'date'),
				$time = $datetime.clone().attr('type', 'time');
			// Hiding the datetime field with type=hidden instead of CSS because it makes semantic sense: this
			// shouldn't be edited by the user
			$datetime.prop('type', 'hidden');
			// `value`, `min` and `max` attributes are datetime strings which need careful handling for date and time:
			// - new date element should copy the date portion of each of these
			// - new time element should copy the time portion for its value
			// - time element shouldn't validate min/max as these depend on the date
			var valueDateAndTime = splitDateString($datetime.attr('value'));
			var minDateAndTime = splitDateString($datetime.attr('min'));
			var maxDateAndTime = splitDateString($datetime.attr('max'));
			$date.attr('value', valueDateAndTime[0]);
			$date.attr('min', minDateAndTime[0]);
			$date.attr('max', maxDateAndTime[0]);
			$time.attr('value', valueDateAndTime[1]);
			$time.removeAttr('min');
			$time.removeAttr('max');
			// Remove `name` properties so that the new fields aren't submitted; we'll keep the hidden datetime field
			// in sync
			$date.removeAttr('name');
			$time.removeAttr('name');
			// Handler to keep the hidden datetime field in sync
			$container.on('change blur', 'input[type=date], input[type=time]', function(e) {
				var $container = $(e.currentTarget).parent(),
					$date = $container.children('input[type=date]'),
					$time = $container.children('input[type=time]'),
					$datetime = $container.children('input[type=hidden]'),
					newDate = new Date($date.val()),
					// Date constructor cannot handle a time alone, so give it an arbitrary date
					newTime = new Date('1970-01-01T' + $time.val());
				if(newDate == 'Invalid Date' || newTime == 'Invalid Date') {
					$datetime.removeAttr('value');
				}
				else {
					$datetime.val(
						pad(newDate.getFullYear()) + '-' + pad(newDate.getMonth()+1) + '-' + pad(newDate.getDate()) +
							' ' + pad(newTime.getHours()) + ':' + pad(newTime.getMinutes())
					);
				}
			});
			$datetime.parent().appendPolyfill($date).appendPolyfill($time);
		});

	};

})(jQuery);

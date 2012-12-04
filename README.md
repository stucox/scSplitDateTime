# scSplitDateTime

A handy little tool to split an `<input>` element representing a datetime value into separate HTML5-compliant date and time input elements. The form still submits a single field with a combined datetime value.

## Why?

At time of writing, Opera is the only browser which has implemented the HTML5 datetime input type. Google Chrome has implemented the date and time input types separately, while Safari, Firefox and IE have implemented none of these. Also, many JavaScript libraries provide date input widgets and time input widgets, but there are few combined datetime widgets (and those that do exist are a bit rubbish).

So, splitting a datetime input allows you to:

* Use Google Chrome's native date and time widgets
* Use your favourite date and time widget plugins together as one
* Use HTML5 standards, even when support is partial
* Separate your server-side logic from browser limitations (as far as the server's concerned, it's just a datetime field)

## Usage

### Basic example

```html
<!-- Define your form -->
<form action="submit/">
    <input type="datetime" name="event_start" id="event_start">
    <input type="submit" value="Go!">
</form>

<!-- Include the plugin -->
<script src="scsplitdatetime.min.js"></script>
<script>
    // Apply the plugin to one or more input elements
    var datetimeElement = document.getElementById('event_start');
    scSplitDateTime(datetimeElement);
</script>
```

### Polyfilling

A common use is to use this with *all* datetime inputs, if the browser hasn't implemented a UI. We can use [Modernizr](http://modernizr.com) and [livequery](http://docs.jquery.com/Plugins/livequery) to help with this:

```html
<!-- Includes omitted -->
<script>
// Only polyfill if the browser hasn't implemented the datetime input type
if(!Modernizr.input.datetime) {

    // Apply plugin to all elements with type="datetime", using livequery
    // so that elements added dynamically in the future are patched too
    $('input[type=datetime]').livequery(function(){
        scSplitDateTime(this);
    });
}
</script>
```

This works really well with Alexander Farkas' [webshims](http://afarkas.github.com/webshim/demos/) library, which automatically applies date and time input widgets, while also correctly polyfilling the rest of the HTML5 input APIs (validation etc), but only if the browser needs it (it uses Modernizr too). So this is a fairly 'complete' solution:

```html
<!-- Includes omitted -->
<script>
// Enable HTML5 form webshims
$.webshims.polyfill('forms forms-ext');

// Only polyfill if the browser hasn't implemented the datetime input type
if(!Modernizr.input.datetime) {

    // Apply plugin to all elements with type="datetime", using livequery
    // so that elements added dynamically in the future are patched too
    $('input[type=datetime]').livequery(function(){
        scSplitDateTime(this);
    });
}
</script>
```

### Alternative input types

You may wish to use `type` attributes other than "date" and "time" for the separated `<input>` elements. This can be done by passing in the type you'd like to use for the date and time elements respectively, e.g.:

```javascript
scSplitDateTime(element, 'text', 'text');
```

replaces `element` with two `<input type="text">` elements. The source input element is still expected to contain a datetime value and will still be split into separate date and time values and recombined on form submit.

### Additional notes

* It isn't restricted to input elements with `type="datetime"` - it'll still work with `type="text"`, or in fact any other `<input>` element... but probably wouldn't make much sense with most
* The plugin also handles `min` and `max` attributes on the datetime input 'intelligently' (could probably be more intelligent):
    - The date part of the `min` and `max` datetime values are copied to the date input
    - The time part of the `min` and `max` datetime values are copied to the time input, *if and only if* the min and max dates are the same
* Date parsing is performed using the JavaScript [Date](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date) object and, as such, only supports the date formats which it supports
* Datetime values are submitted in the format `yyyy-mm-dd HH:MM`

## Browser support

This plugin works purely with HTML5 standards and as such browser support is limited to the browser's support for those standards. Browsers which don't support the date and time input types will simply render normal text fields, but will still be submitted as one.

The webshims library mentioned above can be used to give older browsers full support for HTML5 form APIs.

## How it works

Pretty simple really...

* Wraps the input in a `<span>` element
* Adds two input elements to this wrapper, one with `type="date"` and one with `type="time"`
* Changes the original element to `type="hidden"`
* Parses the value of the original input element and tries to extract a date and time
* Populates the date element with the date value and the time element with the time value
* Watches these elements for any changes and updates the hidden element if so
* If the form is submitted, the value of the hidden element is submitted
* The date and time elements aren't given "name" attributes, so aren't submitted

## TODO

* Add custom formatting
* Manage associated `<datalist>`s (linked via the `list` attribute) - need to split datetime values for each `<option>`
* Support for `type="datetime-local"`
* Add validation to final datetime value, because no validation provided by time field
* Consider dynamic validation for time value, based on selected date?

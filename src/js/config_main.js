'use strict';
var moment = require('moment');

module.exports = ['$mdDateLocaleProvider', '$mdIconProvider', '$mdThemingProvider', function($mdDateLocaleProvider, $mdIconProvider, $mdThemingProvider) {
	// configuration for angular material date controls
	$mdDateLocaleProvider.months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
	$mdDateLocaleProvider.shortMonths = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
	$mdDateLocaleProvider.days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
	$mdDateLocaleProvider.shortDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
	$mdDateLocaleProvider.firstDayOfWeek = 1;
	$mdDateLocaleProvider.monthHeaderFormatter = function(date) {
		return $mdDateLocaleProvider.shortMonths[date.getMonth()] + ' ' + date.getFullYear();
	};
	$mdDateLocaleProvider.weekNumberFormatter = function(weekNumber) {
		return 'Woche ' + weekNumber;
	};
	$mdDateLocaleProvider.msgCalendar = 'Kalender';
	$mdDateLocaleProvider.msgOpenCalendar = 'Kalender öffnen';


	// configuration for date parsing by $mdDateLocale
	$mdDateLocaleProvider.parseDate = function(dateString) {
		var m = moment(dateString, 'DD.MM.YYYY', true);
		return m.isValid() ? m.toDate() : null;
	};
	$mdDateLocaleProvider.formatDate = function(date) {
		return moment(date).format('DD.MM.YYYY');
	};

	$mdIconProvider.iconSet('material', '/img/iconset.svg');

	// theme settings
	$mdThemingProvider.theme('default')
		.primaryPalette('red')
		.accentPalette('orange');
}];
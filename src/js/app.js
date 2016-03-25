var angular = require('angular');
(function(angular) {
	var moment = require('moment')
	angular.module('app', [require('angular-material'), require('./angular-ui-calendar.js')])
		.config(function($mdDateLocaleProvider) {
			// Example of a French localization.
			$mdDateLocaleProvider.months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
			$mdDateLocaleProvider.shortMonths = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
			$mdDateLocaleProvider.days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
			$mdDateLocaleProvider.shortDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
			$mdDateLocaleProvider.firstDayOfWeek = 1;
			// Example uses moment.js to parse and format dates.
			//			$mdDateLocaleProvider.parseDate = function(dateString) {
			//				var m = moment(dateString, 'L', true);
			//				return m.isValid() ? m.toDate() : new Date(NaN);
			//			};
			//			$mdDateLocaleProvider.formatDate = function(date) {
			//				return moment(date).format('L');
			//			};
			$mdDateLocaleProvider.monthHeaderFormatter = function(date) {
				return $mdDateLocaleProvider.shortMonths[date.getMonth()] + ' ' + date.getFullYear();
			};

			$mdDateLocaleProvider.weekNumberFormatter = function(weekNumber) {
				return 'Woche ' + weekNumber;
			};
			$mdDateLocaleProvider.msgCalendar = 'Kalender';
			$mdDateLocaleProvider.msgOpenCalendar = 'Kalender öffnen';
		})

	.controller('AppCtrl', function($scope, $timeout) {
		$scope.myDate = new Date();
		$scope.eventSources = [];

		// In this example, we set up our model using a class.
		// Using a plain object works too. All that matters
		// is that we implement getItemAtIndex and getLength.
		var DynamicItems = function() {
			/**
			 * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
			 */
			this.loadedPages = {};

			/** @type {number} Total number of items. */
			this.numItems = 0;

			/** @const {number} Number of items to fetch per request. */
			this.PAGE_SIZE = 50;

			this.fetchNumItems_();
		};

		// Required.
		DynamicItems.prototype.getItemAtIndex = function(index) {
			var pageNumber = Math.floor(index / this.PAGE_SIZE);
			var page = this.loadedPages[pageNumber];

			if (page) {
				return page[index % this.PAGE_SIZE];
			} else if (page !== null) {
				this.fetchPage_(pageNumber);
			}
		};

		// Required.
		DynamicItems.prototype.getLength = function() {
			return this.numItems;
		};

		DynamicItems.prototype.fetchPage_ = function(pageNumber) {
			// Set the page to null so we know it is already being fetched.
			this.loadedPages[pageNumber] = null;

			// For demo purposes, we simulate loading more items with a timed
			// promise. In real code, this function would likely contain an
			// $http request.
			$timeout(angular.noop, 300).then(angular.bind(this, function() {
				this.loadedPages[pageNumber] = [];
				var pageOffset = pageNumber * this.PAGE_SIZE;
				for (var i = pageOffset; i < pageOffset + this.PAGE_SIZE; i++) {
					this.loadedPages[pageNumber].push(i);
				}
			}));
		};

		DynamicItems.prototype.fetchNumItems_ = function() {
			// For demo purposes, we simulate loading the item count with a timed
			// promise. In real code, this function would likely contain an
			// $http request.
			$timeout(angular.noop, 300).then(angular.bind(this, function() {
				this.numItems = 50000;
			}));
		};

		this.dynamicItems = new DynamicItems();
	});
})(angular);
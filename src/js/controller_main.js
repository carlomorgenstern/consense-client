'use strict';
var angular = require('angular');
var moment = require('moment');
require('../../vendor/js/fullcalendar/de.js');
module.exports = ['$http', '$timeout', '$q', '$window', 'uiCalendarConfig', function($http, $timeout, $q, $window, uiCalendarConfig) {
	var ctrl = this;
	// variables
	ctrl.selectedTab = 0;
	ctrl.selectedDate = new Date();
	ctrl.calendarTitle = "";
	ctrl.eventSources = [];

	// handlers for courses, speakers, rooms
	ctrl.courses = createItemHandler('course', 'http://localhost:8080/api/courses');
	ctrl.speakers = createItemHandler('speaker', 'http://localhost:8080/api/speakers');
	ctrl.rooms = createItemHandler('room', 'http://localhost:8080/api/rooms', "http://localhost:8080/api/room/");

	// calendar configuration
	ctrl.calendarConfig = {
		lang: 'de',
		header: false,
		defaultView: 'agendaWeek',
		views: {
			agenda: {
				slotLabelFormat: 'H(:mm) [Uhr]',
				scrollTime: '08:00:00',
				minTime: '06:00:00',
				maxTime: '22:00:00'
			},
			agendaWeek: {
				columnFormat: 'dd DD.MM.'
			},
			agendaDay: {
				columnFormat: 'DD.MM.YYYY'
			}
		}
	};

	// resizing the calendar on window resize
	$window.addEventListener('resize', function() {
		var calendarContainer = angular.element(document.querySelector('#calendarContainer'));
		ctrl.calendarConfig.aspectRatio = calendarContainer.prop('offsetWidth') / calendarContainer.prop('offsetHeight');
	});

	// methods for controlling the calendar
	ctrl.changeCalendarView = function(view) {
		uiCalendarConfig.calendars.eventCalendar.fullCalendar('changeView', view);
		changeCalendarTitle();
	};

	ctrl.previousCalendarView = function() {
		uiCalendarConfig.calendars.eventCalendar.fullCalendar('prev');
		changeCalendarTitle();
	};

	ctrl.nextCalendarView = function() {
		uiCalendarConfig.calendars.eventCalendar.fullCalendar('next');
		changeCalendarTitle();
	};

	ctrl.setToday = function() {
		ctrl.selectedDate = new Date();
		ctrl.selectedDateChange(ctrl.selectedDate);
	};

	ctrl.selectedDateChange = function(newDate) {
		uiCalendarConfig.calendars.eventCalendar.fullCalendar('gotoDate', newDate);
		changeCalendarTitle();
	};

	function changeCalendarTitle() {
		var viewedDate = uiCalendarConfig.calendars.eventCalendar.fullCalendar('getDate');
		if (uiCalendarConfig.calendars.eventCalendar.fullCalendar('getView').name === 'agendaDay') {
			ctrl.calendarTitle = moment(viewedDate).format('dddd, [der] D. MMMM YYYY');
		} else if (uiCalendarConfig.calendars.eventCalendar.fullCalendar('getView').name === 'agendaWeek') {
			ctrl.calendarTitle = moment(viewedDate).format('[KW] W: ') + moment(viewedDate).startOf('isoWeek').format('D. MMMM') + ' - ' +
				moment(viewedDate).endOf('isoWeek').format('D. MMMM');
		}
	}

	// setup calendar size and title on app startup
	$timeout(function() {
		var calendarContainer = angular.element(document.querySelector('#calendarContainer'));
		ctrl.calendarConfig.aspectRatio = calendarContainer.prop('offsetWidth') / calendarContainer.prop('offsetHeight');
		ctrl.selectedDateChange(ctrl.selectedDate);
	});

	function createItemHandler(type, apiCall, apiEventCall) {
		var allItems = [];
		var eventsForItem = [];
		var updateItemsDeferred;

		var updateItems = function() {
			if (updateItemsDeferred) {
				return updateItemsDeferred.promise;
			}

			updateItemsDeferred = $q.defer();
			$http.get(apiCall, {
					responseType: "json"
				})
				.then(function(response) {
					allItems = response.data.map(function(item) {
						return {
							value: item.toLowerCase(),
							display: item
						};
					});
					$q.resolve();
					updateItemsDeferred = null;
				}, function(error) {
					$q.reject(error);
					updateItemsDeferred = null;
				});
			return updateItemsDeferred.promise;
		};

		var querySearch = function(searchText) {
			if (searchText === "") {
				return $q.resolve(allItems);
			} else {
				var searchTextLower = searchText.toLowerCase();
				if (allItems.length === 0) {
					return updateItems().then(function() {
						return $q.resolve(allItems.filter(function(item) {
							return (item.value.indexOf(searchTextLower) !== -1);
						}));
					});
				} else {
					return $q.resolve(allItems.filter(function(item) {
						return (item.value.indexOf(searchTextLower) !== -1);
					}));
				}
			}
		};

		var selectedChange = function(newItem) {
			if (newItem === undefined || newItem.display === "") {
				eventsForItem.splice(0, eventsForItem.length);
				return $q.resolve();
			} else {
				var deferred = $q.defer();
				var url = apiEventCall + btoa(newItem);
				$http.get(url, {
						responseType: "json"
					})
					.then(function(response) {
						eventsForItem.splice(0, eventsForItem.length);
						response.data.forEach(function(entry) {
							eventsForItem.push({
								title: entry.EventName,
								start: entry.StartDate,
								end: entry.EndDate,
								description: "Dozent: " + entry.Speaker + " Raum: " + entry.Location
							});
						});
						deferred.resolve();
						console.log(eventsForItem);
					}, function(error) {
						deferred.reject(error);
					});
				return deferred.promise;
			}
		};

		updateItems();

		return {
			selected: null,
			searchText: '',
			updateItems: updateItems,
			querySearch: querySearch,
			selectedChange: selectedChange
		};
	}
}];
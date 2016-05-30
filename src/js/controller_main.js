'use strict';
var angular = require('angular');
var moment = require('moment');
require('../../vendor/js/fullcalendar/de.js');
module.exports = ['$http', '$mdDialog', '$mdMedia', '$rootScope', '$scope', '$timeout', '$q', '$window', 'uiCalendarConfig', function($http, $mdDialog, $mdMedia, $rootScope, $scope, $timeout, $q, $window, uiCalendarConfig) {
	var ctrl = this;
	var calendarContainer = angular.element(document.querySelector('#calendarContainer'));

	// scope variables
	ctrl.selectedTab = 0;
	ctrl.selectedDate = new Date();
	ctrl.calendarTitle = "";
	ctrl.eventSources = [];

	// handlers for courses, speakers, rooms
	ctrl.courses = createItemHandler('course', 'http://localhost:3500/api/courses', 'http://localhost:3500/api/events/course/');
	ctrl.speakers = createItemHandler('speaker', 'http://localhost:3500/api/speakers', 'http://localhost:3500/api/events/speaker/');
	ctrl.rooms = createItemHandler('room', 'http://localhost:3500/api/rooms', 'http://localhost:3500/api/events/room/');

	// calendar configuration
	ctrl.calendarConfig = {
		height: calendarContainer.prop('offsetHeight'),
		lang: 'de',
		timezone: 'local',
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
			agendaWeekDay: {
				columnFormat: 'dd DD.MM.',
				type: 'agendaWeek',
				hiddenDays: [0, 6]
			},
			agendaDay: {
				columnFormat: 'DD.MM.YYYY'
			}
		},
		eventClick: showEventDialog
	};

	ctrl.changeTab = function(newTab) {
		ctrl.selectedTab = newTab;
		uiCalendarConfig.calendars.eventCalendar.fullCalendar('removeEvents');
		if (newTab === 0) {
			uiCalendarConfig.calendars.eventCalendar.fullCalendar('addEventSource', ctrl.courses.events);
		} else if (newTab === 1) {
			uiCalendarConfig.calendars.eventCalendar.fullCalendar('addEventSource', ctrl.speakers.events);
		} else if (newTab === 2) {
			uiCalendarConfig.calendars.eventCalendar.fullCalendar('addEventSource', ctrl.rooms.events);
		}
	};

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
			if ($mdMedia('xs')) {
				ctrl.calendarTitle = moment(viewedDate).format('dddd');
			} else {
				ctrl.calendarTitle = moment(viewedDate).format('dddd, [der] D. MMMM YYYY');
			}
		} else if (uiCalendarConfig.calendars.eventCalendar.fullCalendar('getView').name === 'agendaWeek') {
			ctrl.calendarTitle = moment(viewedDate).format('[KW] W: ') + moment(viewedDate).startOf('isoWeek').format('D. MMMM') + ' - ' +
				moment(viewedDate).endOf('isoWeek').format('D. MMMM');
		} else if (uiCalendarConfig.calendars.eventCalendar.fullCalendar('getView').name === 'agendaWeekDay') {
			ctrl.calendarTitle = moment(viewedDate).format('[KW] W: ') + moment(viewedDate).startOf('isoWeek').format('D. MMMM') + ' - ' +
				moment(viewedDate).isoWeekday(5).format('D. MMMM');
		}
	}

	// setup calendar size and title on app startup
	$timeout(function() {
		uiCalendarConfig.calendars.eventCalendar.fullCalendar('option', 'height', calendarContainer.prop('offsetHeight'));
		ctrl.selectedDateChange(ctrl.selectedDate);

		(function() {
			var oldView;
			$rootScope.$watch(function() {
				return $mdMedia('xs');
			}, function(xs) {
				if (xs) {
					oldView = uiCalendarConfig.calendars.eventCalendar.fullCalendar('getView').name;
					ctrl.changeCalendarView('agendaDay');
					changeCalendarTitle();
				} else {
					if (oldView === 'agendaWeek' || oldView === 'agendaDay') {
						ctrl.changeCalendarView(oldView);
					}
					changeCalendarTitle();
					oldView = '';
				}
			});
		})();
	});

	// resize calendar on window resize
	$window.addEventListener('resize', function() {
		uiCalendarConfig.calendars.eventCalendar.fullCalendar('option', 'height', calendarContainer.prop('offsetHeight'));
	});

	// event dialog
	function showEventDialog(event) {
		var DialogController = function($mdDialog) {
			var ctrl = this;
			ctrl.closeDialog = function() {
				$mdDialog.hide();
			};
			console.log(ctrl.event);
		};
		DialogController.$inject = ['$mdDialog'];

		$mdDialog.show({
			//template: 'html',
			templateUrl: 'dialog.html',
			parent: angular.element(document.querySelector('#calendarContainer')),
			clickOutsideToClose: true,
			locals: {
				event: event
			},
			bindToController: true,
			//scope: maybe,
			controller: DialogController,
			controllerAs: 'dialogControl'
		});
	}

	// item handlers
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
					response.data.forEach(function(entry) {
						allItems.push({
							id: entry.id,
							name: entry.name
						});
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
							return (item.name.toLowerCase().indexOf(searchTextLower) !== -1);
						}));
					});
				} else {
					return $q.resolve(allItems.filter(function(item) {
						return (item.name.toLowerCase().indexOf(searchTextLower) !== -1);
					}));
				}
			}
		};

		var selectedChange = function(newItem) {
			if (newItem === undefined) {
				eventsForItem.splice(0, eventsForItem.length);
				return $q.resolve();
			} else {
				var deferred = $q.defer();
				var url = apiEventCall + newItem.id;
				$http.get(url, {
						responseType: "json"
					})
					.then(function(response) {
						eventsForItem.splice(0, eventsForItem.length);
						response.data.forEach(function(entry) {
							eventsForItem.push({
								id: entry.id,
								title: entry.title,
								start: entry.start,
								end: entry.end,
								customEventType: entry.customEventType,
								customEventGroup: entry.customEventGroup,
								customComment: entry.customComment,
								courseUIDs: entry.courseUIDs,
								courseNames: entry.courseNames,
								speakerUIDs: entry.speakerUIDs,
								speakerNames: entry.speakerNames,
								roomUIDs: entry.roomUIDs,
								roomNames: entry.roomNames
							});
						});
						console.log(eventsForItem);
						uiCalendarConfig.calendars.eventCalendar.fullCalendar('removeEvents');
						uiCalendarConfig.calendars.eventCalendar.fullCalendar('addEventSource', eventsForItem);
						deferred.resolve();
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
			events: eventsForItem,
			updateItems: updateItems,
			querySearch: querySearch,
			selectedChange: selectedChange
		};
	}
}];
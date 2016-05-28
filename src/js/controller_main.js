'use strict';

module.exports = ['$http', '$q', function($http, $q) {
	var ctrl = this;

	// variables
	ctrl.selectedDate = new Date();
	ctrl.selectedTab = 0;

	function createItemObject(type, apiCall) {
		var items = [];

		var updateItems = function() {
			$http.get(apiCall, {
					responseType: "json"
				})
				.then(function(response) {
					items = response.data.map(function(item) {
						return {
							value: item.toLowerCase(),
							display: item
						};
					});
				}, function(error) {
					console.log(error);
				});
		};

		updateItems();

		var querySearch = function(searchText) {
			if (searchText === "") {
				return $q.resolve(items);
			} else {
				var searchTextLower = searchText.toLowerCase();
				return $q.resolve(items.filter(function(item) {
					return (item.value.indexOf(searchTextLower) !== -1);
				}));
			}
		};

		var selectedChange = function(newItem) {
			console.log('newItem', newItem);
		};

		return {
			items: items,
			updateItems: updateItems,
			selected: null,
			searchText: '',
			querySearch: querySearch,
			selectedChange: selectedChange
		};

	}

	ctrl.course = createItemObject('course', 'http://localhost:8080/api/courses');
	ctrl.speaker = createItemObject('speaker', 'http://localhost:8080/api/speakers');
	ctrl.room = createItemObject('room', 'http://localhost:8080/api/rooms');


	// tab change handler
	ctrl.selectedTab = 0;


	// scope variables
	ctrl.selectedDate = new Date();
	ctrl.searchTextRoom = "";
	ctrl.eventSources = [];
	ctrl.rooms = [];

	ctrl.calendarConfig = {
		lang: 'de'
	};

	ctrl.selectedRoomChange = function(room) {
		if (room === undefined || room.display === "") {
			ctrl.eventSources.splice(0, ctrl.eventSources.length);
		} else {
			var url = "http://localhost:8080/api/room/" + btoa(room.display);
			$http.get(url, {
					responseType: "json"
				})
				.then(function(response) {
					ctrl.eventSources.splice(0, ctrl.eventSources.length);
					var events = [];
					response.data.forEach(function(entry) {
						events.push({
							title: entry.EventName,
							start: entry.StartDate,
							end: entry.EndDate,
							description: "Dozent: " + entry.Speaker + " Raum: " + entry.Location
						});
					});
					ctrl.eventSources.push({
						events: events,
						editable: false
					});
				}, function(error) {
					console.log(error);
				});
		}
	};
}];
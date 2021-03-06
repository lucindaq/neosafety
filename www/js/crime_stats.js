(function () {

    initializeCrimeStats = {

        init: function (geocompleteLatitude, geocompleteLongitude) {
			if (!geocompleteLatitude) {
				setTimeout(function() {
					app.locationService.getCurrentPosition(crimeResult, showError, {
						enableHighAccuracy: true,
						timeout: 3000
					});
				},10);
			}
			else
			{
				var searched_position = {
					coords: {
						longitude: geocompleteLongitude,
						latitude: geocompleteLatitude
					}
				};
				crimeResult(searched_position, "searched");
			}
		}

	};

	function crimeResult (position, searched) {
				var murder = ["'09A'", "'09B'", "'09C'", "'MURDER %26 NON-NEGL. MANSLAUGHTE'"];
				var theft = ["'120'", "'220'", "'23D'", "'23F'", "'23G'", "'23H'", "'240'", "'280'", "'BURGLARY'", "'LARCENY/THEFT'", "'ROBBERY'", "'STOLEN PROPERTY'", "'VEHICLE THEFT'", "'GRAND LARCENY'", "'GRAND LARCENY OF MOTOR VEHICLE'"];
				var subAbuse = ["'35A'", "'35B'", "'90D'", "'90E'", "'90G'", "'DRIVING UNDER THE INFLUENCE'", "'DRUG/NARCOTIC'", "'DRUNKENNESS'", "'LIQUOR LAWS'"];
				var assault = ["'13A'", "'13B'", "'13C'",  "'ASSAULT'", "'FELONY ASSAULT'"];
				var sexual = ["'11A'", "'11B'", "'11C'", "'11D'", "'90H'", "'SEX OFFENSES, FORCIBLE'", "'SEX OFFENSES, NON FORCIBLE'", "'RAPE'"];
				var other = ["'100'", "'290'", "'40A'", "'40B'", "'90B'", "'90C'", "'90J'", "'520'", "'DISORDERLY CONDUCT'", "'KIDNAPPING'", "'LOITERING'", "'OTHER OFFENSES'", "'PROSTITUTION'", "'SUSPICIOUS OCC'", "'TRESPASSING'", "'VANDALISM'", "'WEAPON LAWS'"];
				var crimeCodesQuery = murder + "," + theft + "," + subAbuse + "," + assault + "," + sexual + "," + other;

				var murderCount = 0;
				var theftCount = 0;
				var subAbuseCount = 0;
				var assaultCount = 0;
				var sexualCount = 0;
				var otherCount = 0;


				var radius = Number(localStorage.getItem('radius'))* 1600;
				var timespan = localStorage.getItem('timespan');
				var date = new Date();
				date.setMonth(date.getMonth() - Number(timespan));
				// .418Z
				var iso = date.toISOString();
				var asOf = iso.substring(0, iso.length - 5);


				var latitude = position.coords.latitude;
				var longitude = position.coords.longitude;


				var latlng = {lat: latitude, lng: longitude};
				var geocoder = new google.maps.Geocoder;
				var county;

				var alamedaCounty = 'Alameda County';
				var sanFranCounty = 'San Francisco County';
        		var newYorkCity = 'New York';

				geocoder.geocode({'location': latlng}, function(results, status) {
					if (results[1]) {

						county = findCounty(results[1].address_components);

						if (county === alamedaCounty || county === sanFranCounty || county === newYorkCity) {

							var url = "";

							if (county == sanFranCounty)
							{
								url = 'https://data.sfgov.org/resource/cuks-n6tp.json';
								var data = '$where=within_circle(location, '  +
									latitude +
									',' +
									longitude +
									','+
									radius+
									') AND category IN (' +
									crimeCodesQuery +
									") AND date > '" +
									asOf +
									"'&$group=category&$select=category,count(*)";
							}
							else if (county == alamedaCounty)
							{
								url = 'https://data.acgov.org/resource/js8f-yfqf.json';
								var data ='$where=within_circle(location_1, ' +
									latitude +
									',' +
									longitude +
									"," +
									radius +
									") AND crimecode IN (" +
									crimeCodesQuery +
									") AND datetime > '" +
									asOf +
									"'&$group=crimecode&$select=crimecode,count(*)";
							}
							  else if (county == newYorkCity)
							  {
								url = 'https://data.cityofnewyork.us/resource/e4qk-cpnv.json';

								var data = '$where=within_circle(location_1, ' +
								  latitude +
								  ',' +
								  longitude +
								  "," +
								  radius +
								  ") AND offense IN (" +
								  crimeCodesQuery +
								  ") AND occurrence_date > '" +
								  asOf +
								  "'&$group=offense&$select=offense,count(*)";
							  }

							$.ajax({
								type: 'GET',
								// NOTE: to test in ripple comment this and uncomment the following line
								url: url+"?"+data,
								// url: url,
								headers: {"X-App-Token": "5ck6SisMgkNJtZjAY7pXTz4Ek"},
								contentType: "application/json",
								xhrFields: {
									withCredentials: true
								},
								// NOTE: to test in ripple uncomment the following lines
								// processData: false,
								// data: encodeURIComponent(data),

								dataType: 'json',
								success: function (json) {

									if (json) {

										$.each(json, function(i, crimes){

											var crimeCode;
											if(county == alamedaCounty) {
												crimeCode = crimes.crimecode;
											}
											else if(county == sanFranCounty)
											{
												crimeCode = crimes.category;
											}
											  else if(county == newYorkCity)
											  {
												crimeCode = crimes.offense;
											  }
											crimeCode = "'" + crimeCode + "'";
											var crimeCount = parseInt(crimes.count);
											if ($.inArray(crimeCode.replace("&", "%26"), murder) > -1)
											{
												murderCount += crimeCount;
											}
											if ($.inArray(crimeCode, theft) > -1)
											{
												theftCount += crimeCount;
											}
											if ($.inArray(crimeCode, subAbuse) > -1)
											{
												subAbuseCount += crimeCount;
											}
											if ($.inArray(crimeCode, assault) > -1)
											{
												assaultCount += crimeCount;
											}
											if ($.inArray(crimeCode, sexual) > -1)
											{
												sexualCount += crimeCount;
											}
											if ($.inArray(crimeCode, other) > -1)
											{
												otherCount += crimeCount;
											}
										});

										var crimeStatsData;
										if(county != sanFranCounty && county == alamedaCounty) {
											crimeStatsData = [[murderCount + ' Murders', murderCount],
												[theftCount+ ' Thefts',theftCount],
												[subAbuseCount+ ' Drug/Alcohol Cases',subAbuseCount],
												[assaultCount+ ' Assaults',assaultCount],
												[sexualCount+ ' Sexual Assaults',sexualCount],
												[otherCount+ ' Uncategorized Crimes',otherCount]];
										}
										else if(county != sanFranCounty && county == newYorkCity) {
										  crimeStatsData = [[murderCount + ' Murders', murderCount],
											[theftCount+ ' Thefts',theftCount],
											[assaultCount+ ' Assaults',assaultCount],
											[sexualCount+ ' Sexual Assaults',sexualCount]];
										}
										else {
											crimeStatsData =
												[[theftCount + ' Thefts', theftCount],
													[subAbuseCount + ' Drug/Alcohol Cases', subAbuseCount],
													[assaultCount + ' Assaults', assaultCount],
													[sexualCount + ' Sexual Assaults', sexualCount],
													[otherCount + ' Uncategorized Crimes', otherCount]];
										}
										if (searched == undefined) {

											if (murderCount || theftCount || subAbuseCount || assaultCount || sexualCount || otherCount) {
												wrongLocationClearError(".stats-current-error-message");
												plotCrimeStats(crimeStatsData, "current-location-crime-chart", 'current');
											} else {
												setActiveTab();
												wrongLocationClearError(".stats-current-error-message");
												$("#current-location-crime-chart").hide();
												$('#zero-crimes-message-current').html('No crimes near you within a ' + getRadiusText('current') + ' radius and within ' + getTimespanText('current') + '.');
											}

										} else {
											if (murderCount || theftCount || subAbuseCount || assaultCount || sexualCount || otherCount) {
												wrongLocationClearError(".stats-searched-error-message");
												plotCrimeStats(crimeStatsData, "search-location-crime-chart", 'searched');
											} else {
												setActiveTab();
												wrongLocationClearError(".stats-searched-error-message");
												$("#search-location-crime-chart").hide();
												$('#zero-crimes-message-searched').html('No crimes near <span style="font-weight: bold; font-style: italic">' + $('#geocomplete-crimestats').val() + '</span> within a ' + getRadiusText('searched') + ' radius and within ' + getTimespanText('searched') + '.');
											}

										}
									}
								}
							});

						} else {
							if ($(".search-option").hasClass('ui-btn-active')){
								statsWrongLocationError(".stats-searched-error-message");
								setActiveTab();
							} else if ($(".current-option").hasClass('ui-btn-active')) {
								statsWrongLocationError(".stats-current-error-message");
								setActiveTab();
							}
							// sorry no results for your county
						}

					} else {
						if ($(".search-option").hasClass('ui-btn-active')) {
							statsWrongLocationError(".stats-searched-error-message");
						} else if ($(".current-option").hasClass('ui-btn-active')) {
							statsWrongLocationError(".stats-current-error-message");
						}
						// sorry no results for your location
					}


				})
			}
	
	
	function setActiveTab() {
		if ($('#current-location-crimestats-tab').is(":visible")) {
			$('.current-tab-stats').addClass('ui-btn-active');
		} else {
			$('.search-tab-stats').addClass('ui-btn-active');
		}
	}

	function getRadiusText(tabType) {
		if (tabType == 'current') {
			return $("#select-native-11 option:selected").text().toLowerCase();
		} else {
			return $("#select-native-11-search option:selected").text().toLowerCase();
		}
	}
	
	function getTimespanText(tabType) {
		if (tabType == 'current') {
			return $("#select-native-12 option:selected").text().toLowerCase();
		} else {
			return $("#select-native-12-search option:selected").text().toLowerCase();
		}
	}
	
    function plotCrimeStats(data, elementId, tabType) {
		statsHideLoader();
		setActiveTab();
		homeClearError();

		$('#zero-crimes-message-current').empty();
		$('#zero-crimes-message-searched').empty();

		if (tabType == 'current') {
			var currentChart = $("#current-location-crime-chart");
			currentChart.empty();
			currentChart.show();

		} else {
			var searchedChart = $("#search-location-crime-chart");
			searchedChart.empty();
			searchedChart.show();

		}

		$.jqplot.config.enablePlugins = true;

			var plot1 = $.jqplot(elementId, [data], {
		        gridPadding: {
		        	top: 0,
		        	bottom: 0,
		        	left: 0,
		        	right: 0
		        },
				
		        seriesDefaults: {
		        	marginTop: 0,
		            renderer:$.jqplot.PieRenderer,
		            rendererOptions: { padding: 30, showDataLabels: true, diameter: 200 },
		            seriesColors: [ "grey", "lightgrey", "#285727", "black", "#FED631", "#58B659", "white"]
		        },

		        legend: {
		            show:true, 
		            rendererOptions: { numberRows: 6 },
		            location:'s',
		            marginTop: 0
		        },

		        grid: {
                 	background: 'transparent',
                 	borderColor: 'transparent', shadow: false, drawBorder: true
             	}
		    });
			hideLoader();


    }


	var radius = localStorage.getItem("radius");
	var timespan = localStorage.getItem("timespan");

	var currentRadiusDropdown = $('#select-native-11');
	var searchRadiusDropdown = $('#select-native-11-search');
	var currentTimespanDropdown = $('#select-native-12');
	var searchTimespanDropdown = $('#select-native-12-search');


	function dropdownAction(foo, bar) {
		if (radius === null) {
			localStorage.setItem('radius', '2');

			foo.val('2');
			foo.selectmenu('refresh');

		} else {
			foo.val(radius);
			foo.selectmenu('refresh');

		}

		if (timespan === null) {
			localStorage.setItem('timespan', '6');

			bar.val('6');
			bar.selectmenu('refresh');

		} else {
			bar.val(timespan);
			bar.selectmenu('refresh');

		}
	}

	$(".current-tab-stats").on("click", function () {
		$('#current-location-crime-chart').show();
		dropdownAction(currentRadiusDropdown, currentTimespanDropdown);
	});
	$(".search-tab-stats").on("click", function () {
		// $('#stats-dropdowns').show();
		dropdownAction(searchRadiusDropdown, searchTimespanDropdown);
		$('#search-location-crime-chart').show();
	});


	$(document).on('pageshow', '#crimeStats', function (e, data) {

		homeClearError();
		statsShowLoader();
		statsSetErrorClass();
		dropdownAction(currentRadiusDropdown, currentTimespanDropdown);
		
		setTimeout(function () {
			
			var latitude, longitude;

			$("#geocomplete-crimestats").geocomplete()
				.bind("geocode:result", function(event, result){
					latitude = result.geometry.location.lat();
					longitude = result.geometry.location.lng();
					initializeCrimeStats.init(latitude, longitude);
				})
				.bind("geocode:error", function(event, status){
					alert("ERROR: " + status);
				});


        	toggleInvertClass($("#crimeStats-footer"));

            initializeCrimeStats.init();

			currentRadiusDropdown.on('change', function () {
				statsShowLoader();
				localStorage.setItem('radius', $(this).val());
				initializeCrimeStats.init();
			});

			currentTimespanDropdown.on('change', function () {
				statsShowLoader();
				localStorage.setItem('timespan', $(this).val());
				initializeCrimeStats.init();
			});

			searchRadiusDropdown.on('change', function () {
				statsShowLoader();
				localStorage.setItem('radius', $(this).val());
				initializeCrimeStats.init(latitude, longitude);
			});

			searchTimespanDropdown.on('change', function () {
				statsShowLoader();
				localStorage.setItem('timespan', $(this).val());
				initializeCrimeStats.init(latitude, longitude);
			});

        }, 100);


    });

})($);

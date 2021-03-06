(function () {

    initializeRating = {

        init: function (geocompleteLatitude, geocompleteLongitude) {
            if (geocompleteLatitude == undefined) {

                app.locationService.getCurrentPosition(crimeResult, showError, {
                    enableHighAccuracy: true,
                    timeout: 3000
                });
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

    $(document).on('pageshow', '#rating', function (e, data) {
        toggleInvertClass($("#rating-footer"));
        ratingShowLoader();
        homeClearError();
        $("#geocomplete").geocomplete()
                .bind("geocode:result", function(event, result){
                    var latitude = result.geometry.location.lat();
                    var longitude = result.geometry.location.lng();
                    ratingShowLoader();
                    initializeRating.init(latitude, longitude);
                })
                .bind("geocode:error", function(event, status){
                    alert("ERROR: " + status);
                });

        setTimeout(function () {
            initializeRating.init();
        }, 1000);

    });


})();

function setActiveTabRating() {
    if ($('#current-rating-tab').is(":visible")) {
        $('.rating-current-option').addClass('ui-btn-active');
    } else if ($('#search-rating-tab').is(":visible")) {
        $('.rating-searched-option').addClass('ui-btn-active');
    }
}

function refreshRating() {
    ratingShowLoader();
    initializeRating.init();
}

    function crimeResult (position, searched) {
                var murder = ["'09A'", "'09B'", "'09C'", "'MURDER %26 NON-NEGL. MANSLAUGHTE'"];
                var theft = ["'120'", "'220'", "'23D'", "'23F'", "'23G'", "'23H'", "'240'", "'280'", "'BURGLARY'", "'LARCENY/THEFT'", "'ROBBERY'", "'STOLEN PROPERTY'", "'VEHICLE THEFT'", "'GRAND LARCENY'", "'GRAND LARCENY OF MOTOR VEHICLE'"];
                var subAbuse = ["'35A'", "'35B'", "'90D'", "'90E'", "'90G'", "'DRIVING UNDER THE INFLUENCE'", "'DRUG/NARCOTIC'", "'DRUNKENNESS'", "'LIQUOR LAWS'"];
                var assault = ["'13A'", "'13B'", "'13C'",  "'ASSAULT'", "'FELONY ASSAULT'"];
                var sexual = ["'11A'", "'11B'", "'11C'", "'11D'", "'90H'", "'SEX OFFENSES, FORCIBLE'", "'SEX OFFENSES, NON FORCIBLE'", "'RAPE'"];
                var other = ["'100'", "'290'", "'40A'", "'40B'", "'90B'", "'90C'", "'90J'", "'520'", "'DISORDERLY CONDUCT'", "'KIDNAPPING'", "'LOITERING'", "'OTHER OFFENSES'", "'PROSTITUTION'", "'SUSPICIOUS OCC'", "'TRESPASSING'", "'VANDALISM'", "'WEAPON LAWS'"];
                var crimeCodesQuery = murder + "," + theft + "," + subAbuse + "," + assault + "," + sexual + "," + other;

                var weighSenior = ["'13C'", "'220'", "'90D'", "'90E'", "'90J'", "'BURGLARY'", "'DRUNKENNESS'", "'DRIVING UNDER THE INFLUENCE'", "'TRESPASSING'"];
                var weighTeen = ["'100'", "'11A'", "'11B'", "'11C'", "'13C'", "'35A'", "'35B'", "'90G'", "'90H'", "'90D'", "'DRIVING UNDER THE INFLUENCE'", "'DRUG/NARCOTIC'", "'KIDNAPPING'",  "'LIQUOR LAWS'", "'SEX OFFENSES, FORCIBLE'", "'SEX OFFENSES, NON FORCIBLE'", "'RAPE'"];
                var weighKids = ["'90H'", "'11D'", "'100'", "'KIDNAPPING'"];
                var weighWomen = ["'11A'", "'11B'", "'11C'", "'100'", "'220'", "'KIDNAPPING'", "'SEX OFFENSES, FORCIBLE'", "'SEX OFFENSES, NON FORCIBLE'", "'RAPE'"];
                var weighAdult = ["'23D'", "'23F'", "'23G'", "'23F'", "'BURGLARY'", "'LARCENY/THEFT'", "'ROBBERY'", "'STOLEN PROPERTY'", "'VEICHLE THEFT'", "'GRAND LARCENY OF MOTOR VEHICLE'", "'GRAND LARCENY'"];

                var murderCount = 0;
                var theftCount = 0;
                var subAbuseCount = 0;
                var assaultCount = 0;
                var sexualCount = 0;
                var otherCount = 0;


                var date = new Date();
                date.setMonth(date.getMonth() - 12);
                // .418Z
                var iso = date.toISOString();
                var asOf = iso.substring(0, iso.length - 5);

               var latitude = position.coords.latitude;
               var longitude = position.coords.longitude;
                 // var latitude = 37.8100639;
                 // var longitude = -122.2901161;
                //yelp office
//                var latitude = 37.7866669;
//                var longitude = -122.4021821;
                //tenderloin
               // var latitude = 37.783717;
               // var longitude = -122.411593;

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

                            if (county == sanFranCounty) {
                                url = 'https://data.sfgov.org/resource/cuks-n6tp.json';
                                var data = '$where=within_circle(location, ' +
                                    latitude +
                                    ',' +
                                    longitude +
                                    ',' +
                                    '3200' +
                                    ') AND category IN (' +
                                    crimeCodesQuery +
                                    ") AND date > '" +
                                    asOf +
                                    "'&$group=category&$select=category,count(*)";
                            }
                            else if (county == alamedaCounty) {
                                url = 'https://data.acgov.org/resource/js8f-yfqf.json';
                                var data = '$where=within_circle(location_1, ' +
                                    latitude +
                                    ',' +
                                    longitude +
                                    "," +
                                    '3200' +
                                    ") AND crimecode IN (" +
                                    crimeCodesQuery +
                                    ") AND datetime > '" +
                                    asOf +
                                    "'&$group=crimecode&$select=crimecode,count(*)";
                            }
                            else if (county == newYorkCity) {
                              url = 'https://data.cityofnewyork.us/resource/e4qk-cpnv.json'
                              var data = '$where=within_circle(location_1, ' +
                                latitude +
                                ',' +
                                longitude +
                                "," +
                                '3200' +
                                ") AND offense IN (" +
                                crimeCodesQuery +
                                ") AND occurrence_date > '" +
                                asOf +
                                "'&$group=offense&$select=offense,count(*)";
                            }

                            $.ajax({
                                type: 'GET',
                                // NOTE: to test in ripple comment the following line and uncomment the line after that one
                                url: url+"?"+data,
                                // url: url,

                                headers: {"X-App-Token": "5ck6SisMgkNJtZjAY7pXTz4Ek"},
                                contentType: "application/json",
                                xhrFields: {
                                    withCredentials: true
                                },
                                
                                // NOTE: to test in ripple uncomment the following 2 lines
                                // processData: false,
                                // data: encodeURIComponent(data),

                                dataType: 'json',
                                success:     function (json) {

                                    if (json) {

                                        $.each(json, function (i, crimes) {
                                            var crimeCode;
                                            if (county == alamedaCounty) {
                                                crimeCode = crimes.crimecode;
                                            }
                                            else if (county == sanFranCounty) {
                                                crimeCode = crimes.category;
                                            }
                                            else if(county == newYorkCity)
                                            {
                                              crimeCode = crimes.offense;
                                            }
                                            crimeCode      = "'" + crimeCode + "'";
                                            var crimeCount = parseInt(crimes.count);

                                            if (localStorage.getItem("gender") == "Female" && $.inArray(crimeCode, weighWomen) > -1) {
                                                crimeCount *= 2;
                                            }

                                            if (localStorage.getItem("age") == "Senior Citizen" && $.inArray(crimeCode, weighSenior) > -1) {
                                                crimeCount *= 2;
                                            }

                                            if (localStorage.getItem("age") == "Teenager" && $.inArray(crimeCode, weighTeen) > -1) {
                                                crimeCount *= 2;
                                            }

                                            if (localStorage.getItem("age") == "Adult" && $.inArray(crimeCode, weighAdult) > -1) {
                                                crimeCount *= 2;
                                            }

                                            if (localStorage.getItem("age") == "Adult with kids" && $.inArray(crimeCode, weighKids) > -1) {
                                                crimeCount *= 2;
                                            }

                                            if ($.inArray(crimeCode.replace("&", "%26"), murder) > -1) {
                                                murderCount += crimeCount;
                                            }
                                            if ($.inArray(crimeCode, theft) > -1) {
                                                theftCount += crimeCount;
                                            }
                                            if ($.inArray(crimeCode, subAbuse) > -1) {
                                                subAbuseCount += crimeCount;
                                            }
                                            if ($.inArray(crimeCode, assault) > -1) {
                                                assaultCount += crimeCount;
                                            }
                                            if ($.inArray(crimeCode, sexual) > -1) {
                                                sexualCount += crimeCount;
                                            }
                                            if ($.inArray(crimeCode, other) > -1) {
                                                otherCount += crimeCount;
                                            }
                                        });

                                        var rating;

                                        if (county == alamedaCounty) {
                                            var ratings = [];
                                            //added 2 to each log
                                            ratings.push(
                                                { type: "murder", rating: Math.log(murderCount + 1)/Math.log(3.25)},
                                                { type: "theft", rating: Math.log(theftCount + 1)/Math.log(3.9)},
                                                { type: "subAbuse", rating: Math.log(subAbuseCount + 1)/Math.log(5)},
                                                { type: "assault", rating: Math.log(assaultCount + 1)/Math.log(3.9)},
                                                { type: "sexual", rating: Math.log(sexualCount + 1)/Math.log(3.9)},
                                                { type: "other", rating: Math.log(otherCount + 1)/Math.log(3.9)}
                                            );

                                            $.each(ratings, function(i, object) {
                                                if(object.rating > 5)
                                                {
                                                    object.rating = 5;
                                                }
                                                else if(object.rating < 0)
                                                {
                                                    object.rating = 0;
                                                }
                                            });

                                            rating = ratings[0].rating * 0.25 + ratings[1].rating * 0.15 +ratings[2].rating * 0.1 + ratings[3].rating * 0.2 +ratings[4].rating * 0.2 +ratings[5].rating * 0.1;

                                        }
                                        else if (county == sanFranCounty)
                                        {
                                            var ratings = [];

                                            ratings.push(
                                                { type: "theft", rating: Math.log(theftCount + 1)/Math.log(8)},
                                                { type: "subAbuse", rating: Math.log(subAbuseCount + 1)/Math.log(5.25)},
                                                { type: "assault", rating: Math.log(assaultCount + 1)/Math.log(6)},
                                                { type: "sexual", rating: Math.log(sexualCount + 1)/Math.log(3.6)},
                                                { type: "other", rating: Math.log(otherCount + 1)/Math.log(7.3)}
                                            );

                                            $.each(ratings, function(i, object) {
                                                if(object.rating > 5)
                                                {
                                                    object.rating = 5;
                                                }
                                                else if(object.rating < 0)
                                                {
                                                    object.rating = 0;
                                                }
                                            });

                                            rating = ratings[0].rating * 0.2 + ratings[1].rating * 0.1 +ratings[2].rating * 0.25 +ratings[3].rating * 0.35 +ratings[4].rating * 0.1;

                                        }
                                        else if (county == newYorkCity)
                                        {
                                            var ratings = [];

                                            ratings.push(
                                                { type: "murder", rating: Math.log(murderCount + 1)/Math.log(3.25)},
                                                { type: "theft", rating: Math.log(theftCount + 1)/Math.log(8)},
                                                { type: "assault", rating: Math.log(assaultCount + 1)/Math.log(6)},
                                                { type: "sexual", rating: Math.log(sexualCount + 1)/Math.log(3.6)}
                                            );

                                            $.each(ratings, function(i, object) {
                                                if(object.rating > 5)
                                                {
                                                    object.rating = 5;
                                                }
                                                else if(object.rating < 0)
                                                {
                                                    object.rating = 0;
                                                }
                                            });

                                            rating = ratings[0].rating * 0.4 + ratings[1].rating * 0.1 +ratings[2].rating * 0.3 +ratings[3].rating * 0.2;

                                        }

                                        if (searched == undefined) {
                                            plotRating(rating, "current-location-safety-gauge");
                                        }
                                        else {
                                            plotRating(rating, "custom-location-safety-gauge");
                                            // $("#search-safety-gauge").show();

                                        }
                                    }
                                }
                            });
                        }
                        else {
                            if ($(".search-option").hasClass('ui-btn-active')){
                                ratingWrongLocationError(".rating-searched-error-message");
                                setActiveTabRating();
                            } else if ($(".current-option").hasClass('ui-btn-active')) {
                                ratingWrongLocationError(".rating-current-error-message");
                                setActiveTabRating();
                            }
                            // wrongLocationError();
                            // sorry no results for your county
                        }

                    } else {
                        if ($(".search-option").hasClass('ui-btn-active')){
                            ratingWrongLocationError(".rating-searched-error-message");
                        } else if ($(".current-option").hasClass('ui-btn-active')) {
                            ratingWrongLocationError(".rating-current-error-message");
                        }
                        // sorry no results for your location
                    }
                });
            }

function plotRating(rating, elementId) {
    ratingHideLoader();
    // $(".error-message").hide();
    homeClearError();
    if ($(".rating-current-option").hasClass('ui-btn-active')){
        wrongLocationClearError(".rating-current-error-message");
    } else if ($(".rating-searched-option").hasClass('ui-btn-active')){
        wrongLocationClearError(".rating-searched-error-message");
    }

    setActiveTabRating();


    $.jqplot(elementId,[[rating]],{

        seriesDefaults: {
            renderer: $.jqplot.MeterGaugeRenderer,
            rendererOptions: {
                label: 'Safety Rating',
                labelPosition: 'bottom',
                labelHeightAdjust: 10,
                intervalOuterRadius: 65,
                ticks: [0, 1, 2, 3, 4, 5],
                intervals:[1.5, 3.5, 5],
                intervalColors:['#66cc66', '#E7E658', '#cc6666']
            },
            label: 'Safety'
        },

        grid: {
            background: 'transparent'
        }
    });

}
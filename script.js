$(document).ready(function () {

    var searchBtn = $(".search");
    var storedHistory =JSON.parse(localStorage.getItem("searchHistory"));
    var searchHistory = [];
    var date = new Date();
    var fiveDayForecast = "http://api.openweathermap.org/data/2.5/forecast?q=";
    var currentWeather = "http://api.openweathermap.org/data/2.5/weather?q=";
    var uvIndexUrl = "http://api.openweathermap.org/data/2.5/uvi?appid=e6d0338475e8a331b1efa53226cf4edb&";

    if(storedHistory !== null) {
        for(var i = 0; i < storedHistory.length; i++) {
            searchHistory.push(storedHistory[i]);
        }
        populateHistory(storedHistory);
    }

    $("#clear-history").on("click", function(){
        localStorage.clear();
        $("#history").empty();
        storedHistory = null;
        searchHistory = null;
        console.log(storedHistory);
        console.log(searchHistory);
        });

    searchBtn.on("click", function () {
        var cityName = $("#input-city").val();
        makeAPICall(fiveDayForecast, currentWeather, uvIndexUrl, cityName);
        $('#input-city').val('');
    });

    $(document).on("click", ".hist-btn", function () {
        makeAPICall(fiveDayForecast, currentWeather, uvIndexUrl, this.value);
    });

    function populateForcast(urlResponse) {
        $("#five-day-forcast").empty();
        $("#five-day-forcast").append($("<h2>5 Day Forecast</h2><br><br>"));
        for (var i = 0; i < 5; i++) {
            
            var month = date.getMonth() + 1;
            var day = date.getDate() + i + 1;
            var midDayStats = (3) + (i * 8);
            var humidityStats = urlResponse.list[midDayStats].main.humidity;
            var tempStats = urlResponse.list[midDayStats].main.temp;
            var currentDate = "(" + month + "/" + day + "/" + date.getFullYear() + ")";
            var forecastDivs = $("<div id='forecast-" + i + "' class='forecast-div'></div>");
            var forecastDate = $("<p class=forecast-date><strong>" + currentDate + "</strong></p>");
            var forecastTemp = $("<p class='forcast-temp'>Temperature: " + tempStats + " &#8457;</p>");
            var forecastHumidityStats = $("<p class=humidity-stats>Humidity: " + humidityStats + "%</p>");
            console.log(tempStats);
            console.log(forecastTemp);
            $("#five-day-forcast").append(forecastDivs);
            $("#forecast-" + i).append(forecastDate);
            $("#forecast-" + i).append(forecastTemp);
            $("#forecast-" + i).append(forecastHumidityStats);
            
        }
    }

    function populateHistory(histArr) {
        $("#history").empty();
        if (histArr != null){
            for (var i = 0; i < histArr.length; i++) {
                var histBtn = $("<button class='hist-btn' value='" + histArr[i] + "'>" + histArr[i] + "</button><br>");
                $("#history").append(histBtn);

        }
        };
        console.log("searchHistory " + searchHistory);
    };

    function makeAPICall(urlForcast, urlWeather, urlUV, inVal) {
        $.ajax({
            url: urlForcast + inVal + "&units=imperial&appid=e6d0338475e8a331b1efa53226cf4edb",
            method: "GET",
            type: "json",
            success: function (response) {
                inVal = response.city.name;
                
                searchHistory.push(inVal);

                // if (searchHistory != null && searchHistory.length < 1) {
                //     searchHistory[0] = inVal;
                // } else {
                //     searchHistory.push(inVal);
                // };
                localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

                populateHistory(searchHistory);
                populateForcast(response);

                $.ajax({
                    url: urlWeather + inVal + "&units=imperial&appid=e6d0338475e8a331b1efa53226cf4edb",
                    method: "GET",
                    type: "json",
                    success: function (response) {
                        $("#city-info").empty();
                        var coordinates = ("lat=" + response.coord.lat + "&lon=" + response.coord.lon);
                        var month = date.getMonth() + 1;
                        var currentDate = "(" + month + "/" + date.getDate() + "/" + date.getFullYear() + ")";
                        var cityInfo = [
                            ($("<h1>" + response.name + " " + currentDate + "</h1><br>")),
                            ($("<p>Temperature: " + response.main.temp + " \u00B0F</p><br>")),
                            ($("<p>Humidity: " + response.main.humidity + "%</p><br>")),
                            ($("<p>Wind Speed: " + response.wind.speed + " MPH</p><br>")),
                        ];
                        $.ajax({
                            url: urlUV + coordinates,
                            method: "GET",
                            type: "json"
                        }).then(function (response) {
                            if (response.value <= 4) {
                                cityInfo[cityInfo.length] = ($("<p style='display: inline'>UV Index: </p><span id='favorable'>" + response.value + "</span>"))
                            } else if (response.value > 4 && response.value <= 8) {
                                cityInfo[cityInfo.length] = ($("<p style='display: inline'>UV Index: </p><span id='moderate'>" + response.value + "</span>"))
                            } else if (response.value > 8) {
                                cityInfo[cityInfo.length] = ($("<p style='display: inline'>UV Index: </p><span id='severe'>" + response.value + "</span>"))
                            };
                            for (var i = 0; i < cityInfo.length; i++) {
                                $("#city-info").append(cityInfo[i]);
                            }
                        });
                    },
                });
            },
            error: function () {
                alert("Please enter a valid city name.");
            }
        });
    };
});







//importing Chart from chart.js
const Chart = window.Chart;

//function to create and return a new chart
function createChart(canvasId, rowLabels, data, units) {
    let chart = new Chart(canvasId,
        {
            type: 'line',
            data: {
                labels: rowLabels,
                datasets: [{
                    data: data,
                    borderWidth: 2,
                    backgroundColor: 'rgba(255, 0, 0, 0.299)',
                    borderColor: 'red',
                    fill: true,
                    tension: 0.6
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                },

                maintainAspectRatio: false,
                responsive: true,

                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value, index, ticks) {
                                return value + " " + units;
                            }
                        }
                    }
                }
            }
        }
    );

     return chart;
}

const speedFutureCanvas = document.getElementById('wind-speed-next-04-days');
const futureFourDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const futureSpeeds = [26, 28, 29, 26, 50];
const speedUnit = "km/h";

const speedFutureChart = createChart(speedFutureCanvas, futureFourDays, futureSpeeds, speedUnit );


const tempPastCanvas = document.getElementById('temp-last-07-days');
const pastSevenDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const pastTemps = [26, 28, 23, 26, 24, 28, 22, 50];
const tempUnit = "º";

const tempPastChart = createChart(tempPastCanvas, pastSevenDays, pastTemps, tempUnit);

const speedPastCanvas = document.getElementById('speed-last-07-days');
const pastSpeeds = [22, 43, 19, 56, 32, 44, 31];

const speedPastChart = createChart(speedPastCanvas, pastSevenDays, pastSpeeds, speedUnit)


//updating the values of the meters
function updateMeter(meterId, valueId, unit, startValue, endValue){
    const progress = setInterval(() => {
        startValue++;

        valueId.textContent = `${startValue + " " + unit}`;
        meterId.style.background = `conic-gradient(rgb(38, 255, 0) ${startValue*3.6}deg, #ededed 0deg)`

        if(startValue == endValue){
            clearInterval(progress);
        }
    }, 30);
}


let windSpeedMeter = document.getElementById('wind-speed-meter');
let windMeterValue = document.getElementById('wind-meter-value');

updateMeter(windSpeedMeter, windMeterValue, "km/h", 0, 50);

let humidityMeter = document.getElementById('humidity-meter');
let humidityMeterValue = document.getElementById('humidity-meter-value');

updateMeter(humidityMeter, humidityMeterValue, "%", 0, 75);

let rainChanceMeter = document.getElementById('rain-chance-meter');
let rainChanceMeterValue = document.getElementById('rain-chance-meter-value');

updateMeter(rainChanceMeter, rainChanceMeterValue, "%", 0, 25);

//updating the values of text meter values
function updateTextMeters(valueId, unit, startValue, endValue, speed){
    const progress = setInterval(() => {
        startValue++;

        valueId.textContent = `${startValue + " " + unit}`;    

        if(startValue == endValue){
            clearInterval(progress);
        }
    }, speed);
}

let uvMeter = document.getElementById('uv-meter');

updateTextMeters(uvMeter, "", 0, 5, 100);

let pressureMeter = document.getElementById('pressure-meter');

updateTextMeters(pressureMeter, "pa", 0, 500, 0.01);

let dustMeter = document.getElementById('dust-meter');

updateTextMeters(dustMeter, "g", 0, 10, 100);
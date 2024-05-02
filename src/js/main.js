// $(document).ready(function () {
//     $('#myModal').modal('show')
//     $('#mailbutton').click(function (event) {
//         window.location = "mailto:h.marzouk@uni-muenster.de";
//     });
// });

// Add data to map ///////
var option = {
    tooltip: {
        // trigger: 'item',
        backgroundColor: 'rgba(255,255,255,0.9)',
        textStyle: {
            color: '#333'
        },
        position: 'top',
        formatter: function (params) {
            return (
                '<b>X:</b> ' +
                params.data[0].toFixed(2) +
                '<br><b>Y:</b> ' +
                params.data[1].toFixed(2) +
                '<br><b>Zb:</b> ' +
                params.data[2].toFixed(2)
            );
        }
    },
    toolbox: {
        feature: {
            restore: { show: true },
            saveAsImage: { show: true }
        },
    },

    lmap: {
        // Initial options of Leaflet
        // See https://leafletjs.com/reference.html#map-option for details
        // NOTE: note that this order is reversed from Leaflet's [lat, lng]!
        center: [27, 18], // [lng, lat]
        zoom: 5,
        // Whether the map and echarts automatically handles browser window resize to update itself.
        resizeEnable: true,
        // Whether echarts layer should be rendered when the map is moving. Default is true.
        // if false, it will only be re-rendered after the map `moveend`.
        // It's better to set this option to false if data is large.
        renderOnMoving: true,
        // echarts layer is interactive. Default: true
        echartsLayerInteractive: true,
        // enable large mode. Default: false
        largeMode: false,
        // Note: Please DO NOT use the initial option `layers` to add Satellite/RoadNet/Other layers now.
        // Do it after you have retrieved the leaflet instance.



    },
    visualMap: {
        show: true,
        type: 'continuous',
        left: 50,
        min: 15,
        max: 60,
        inverse: false,
        seriesIndex: 0,
        calculable: true,
        orient: 'horizontal',
        right: 30,
        top: 50,

        align: 'bottom',
        text: [null, 'CDP:   '],
        textStyle: {
            color: '#313695',
            fontWeight: "bold"
        },
        formatter: '{value} km',
        // label: {
        //     show: true
        // },
        // emphasis: {
        //     itemStyle: {
        //         shadowBlur: 4,
        //         shadowColor: 'rgba(0, 0, 0, 0.5)'
        //     }
        // },
        inRange: {
            color: [
                '#a50026',
                '#d73027',
                '#f46d43',
                '#fdae61',
                '#fee090',
                '#ffffbf',
                '#e0f3f8',
                '#abd9e9',
                '#74add1',
                '#4575b4',
                '#313695',
                '#313695',

            ]
        },
    },
    opacity: [1, 1],
    animation: false,
    emphasis: {
        itemStyle: {
            color: 'yellow'
        },

    },
    series: [
        {
            type: 'scatter', // heatmap
            symbol: 'rect',

            // use `lmap` as the coordinate system
            coordinateSystem: "lmap",
            data: data,
            symbolSize: 12,
            // blurSize: 5,
            emphasis: {
                itemStyle: {
                    borderColor: '#333',
                    borderWidth: 1
                }
            },

            animation: false
        },
    ],
};


// initialize echart
var chart = echarts.init(document.getElementById("map"));
chart.setOption(option);
chart.on('click', { seriesIndex: 0 }, function (params) {
    console.log(params.data)
    alert('Zb = ' + params.data[2])
    // alert('ff')
})

// get Leaflet extension component and Leaflet instance
var lmapComponent = chart.getModel().getComponent("lmap");
var lmap = lmapComponent.getLeaflet();

L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    {
        attribution:
            "Tiles &copy; Esri &mdash",
    }
).addTo(lmap);





// Add data to leaft chart ///////

const markLine = [];
const positions = [
    'start',
    'middle',
    'end',
    'insideStart',
    'insideStartTop',
    'insideStartBottom',
    'insideMiddle',
    'insideMiddleTop',
    'insideMiddleBottom',
    'insideEnd',
    'insideEndTop',
    'insideEndBottom'
];
for (var i = 0; i < positions.length; ++i) {
    markLine.push({
        name: positions[i],
        yAxis: 1.8 - 0.2 * Math.floor(i / 3),
        label: {
            formatter: '{b}',
            position: positions[i]
        }
    });
    if (positions[i] !== 'middle') {
        const name =
            positions[i] === 'insideMiddle' ? 'insideMiddle / middle' : positions[i];
        markLine.push([
            {
                name: 'start: ' + positions[i],
                coord: [0, 0.3],
                label: {
                    formatter: name,
                    position: positions[i]
                }
            },
            {
                name: 'end: ' + positions[i],
                coord: [3, 1]
            }
        ]);
    }
}
option = {
    animation: false,
    textStyle: {
        fontSize: 14
    },
    toolbox: {
        feature: {
            restore: { show: true },
            saveAsImage: { show: true }
        },
    },
    xAxis: {
        data: ['A', 'B', 'C', 'D', 'E'],
        boundaryGap: true,
        splitArea: {
            show: true
        }
    },
    yAxis: {
        max: 2
    },
    series: [
        {
            name: 'line',
            type: 'line',
            stack: 'all',
            symbolSize: 6,
            data: [0.3, 1.4, 1.2, 1, 0.6],
            markLine: {
                data: markLine,
                label: {
                    distance: [20, 8]
                }
            }
        }
    ],
    grid: {
        top: 30,
        left: 60,
        right: 60,
        bottom: 40
    }
};


// initialize echart
var chart1 = echarts.init(document.getElementById("chart1"));
chart1.setOption(option);




option = {
    legend: {
        data: ['Altitude (km) vs. temperature (°C)']
    },
    tooltip: {
        trigger: 'axis',
        formatter: 'Temperature : <br/>{b}km : {c}°C'
    },
    toolbox: {
        feature: {
            restore: { show: true },
            saveAsImage: { show: true }
        },
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: {
        type: 'value',
        axisLabel: {
            formatter: '{value} °C'
        }
    },
    yAxis: {
        type: 'category',
        axisLine: { onZero: false },
        axisLabel: {
            formatter: '{value} km'
        },
        boundaryGap: false,
        data: ['0', '10', '20', '30', '40', '50', '60', '70', '80']
    },
    series: [
        {
            name: 'Altitude (km) vs. temperature (°C)',
            type: 'line',
            symbolSize: 10,
            symbol: 'circle',
            smooth: true,
            lineStyle: {
                width: 3,
                shadowColor: 'rgba(0,0,0,0.3)',
                shadowBlur: 10,
                shadowOffsetY: 8
            },
            data: [15, -50, -56.5, -46.5, -22.1, -2.5, -27.7, -55.7, -76.5]
        }
    ]
};


// initialize echart
var chart2 = echarts.init(document.getElementById("chart2"));
chart2.setOption(option);

window.addEventListener('resize', function () {
    chart2.resize();
    chart1.resize();

});
$(document).ready(function () {
    $('#myModal').modal('show')
    $('#mailbutton').click(function (event) {
        window.location = "mailto:h.marzouk@uni-muenster.de";
    });
});

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
                '<b>Long:</b> ' +
                params.data[0].toFixed(2) + '°' +
                '<br><b>Lat:</b> ' +
                params.data[1].toFixed(2) + '°' +
                '<br><b>Curie depth:</b> ' +
                params.data[2].toFixed(2) + ' km'
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
        center: [30, 20], // [lng, lat]
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
        dimension: 2, // map the third column
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
            // data: data.map(function (val) {
            //     return val.slice(0, -1);
            // }),
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
// calculate 1d model

chart.on('click', { seriesIndex: 0 }, function (params) {
    // console.log(params.data)
    // alert('Zb = ' + params.data[2].toFixed(2) + ' and HF = ' + params.data[3].toFixed(2))
    // alert('ff')

    // reinitialize
    option1.series = option1.series.slice(0, 2)
    option1.legend.data = option1.legend.data.slice(0, 2)
    // option2.series = option2.series.slice(0)
    // option2.legend.data = option2.legend.data.slice(0)
    option2.series = []
    option2.legend.data = []
    chart1.setOption(option1, true);
    chart2.setOption(option2, true);


    var annualSurfaceTemperature = 0                        // T0
    var MeanObservedHeatFlow = params.data[3] / 1000        // Q0
    CPD = params.data[2] * 1000                         //cd (m)
    // var CPD = 30 * 1000                      //cd (m)

    var MaxCrustalconductivity = 3.5                        // ck1
    var MinCrustalconductivity = 1.0                        // ck2
    var IntervalCrustalconductivity = 0.5                   // dck
    var DepthOfHeatProducingElements = 10 * 1000            // b (m)
    var CurieTemp = 580                                  // Tc(°C) 
    var DepthToCalculation = 100 * 1000                  //cz (m)

    var z = Array.from({ length: DepthToCalculation / 1000 + 1 }, (v, k) => k * 1000)
    var CurieTemp = CurieTemp - annualSurfaceTemperature;
    var ick = (MaxCrustalconductivity - MinCrustalconductivity) / IntervalCrustalconductivity + 1
    for (let i = 1; i <= ick; i++) {
        // for (let i = 1; i <= 1; i++) {

        var ck = MaxCrustalconductivity - (i - 1) * IntervalCrustalconductivity;

        // console.log(i)
        // console.log(ck)

        const [T, q, A0] = CalculateTemp(MeanObservedHeatFlow, annualSurfaceTemperature, ck, CPD, DepthToCalculation, z, CurieTemp, DepthOfHeatProducingElements);


        var qm = q[q.length - 2] * 1000

        // console.log(T, q, A0)
        // console.log(i, A0, qm)

        if (A0 >= 0 && qm > 0 && qm < 100) {
            console.log(i + ': ok')
            // option1 = option1_base

            option1.legend.data.push('Kcrust:' + ck)
            option1.series.push({
                name: 'Kcrust:' + ck,
                type: 'line',
                symbol: 'roundRect',
                showSymbol: false,
                animation: true,
                universalTransition: {
                    enabled: false
                },
                data: T,
                markLine: {
                    silent: true,
                    data: [{
                        name: 'Curie depth',
                        yAxis: CPD / 1000,
                        label: {
                            position: 'middle',
                            formatter: '{b}',

                        }
                    }],
                    lineStyle: {
                        width: 2,
                        color: '#EDC6C3',
                        // shadowBlur: 10,
                        // shadowOffsetY: 8,
                        type: 'dashed',
                    },

                }

            })


            var dz = z[1] - z[0]
            var z1 = z.map(x => x + (dz / 2))
            z1 = z1.map(x => x / 1000)
            z1.splice(-1)

            // console.log(q)

            q.splice(-1)
            // console.log(q)

            var q1 = q.map(x => x * 1000)

            // console.log(z1)


            option2.yAxis.data = z1
            option2.legend.data.push('Kcrust:' + ck)
            option2.series.push({
                name: 'Kcrust:' + ck,
                type: 'line',
                symbol: 'roundRect',
                showSymbol: false,
                animation: true,
                universalTransition: {
                    enabled: false
                },
                data: q1,
                markLine: {
                    silent: true,
                    data: [{
                        name: 'Curie depth',
                        yAxis: CPD / 1000,
                        label: {
                            position: 'middle',
                            formatter: '{b}',

                        }
                    }],
                    lineStyle: {
                        width: 2,
                        color: '#EDC6C3',
                        // shadowBlur: 10,
                        // shadowOffsetY: 8,
                        type: 'dashed',
                    },

                }
            })

        }
    }

    // Resize to make sure the container is ok! (may be useless :))
    chart1.resize();
    chart2.resize();

    // start plotting
    chart1.setOption(option1, true)
    chart2.setOption(option2, true);


},

)

function CalculateTemp(Q0, T0, ck, cd, cz, z, Tc, b) {
    // console.log(Q0, T0, ck, cd, cz, z, Tc, b)
    var dz = z[1] - z[0]	                //depth increment
    var q = Array.from({ length: z.length }, (v, k) => k = 0)
    var A0byck = ((Tc - (Q0 / ck * cd)) / (Math.pow(b, 2) - (b * cd) - (Math.pow(b, 2) * Math.exp(-cd / b))));
    var A0 = A0byck * ck;

    var T = z.map(x => Q0 * x / ck + (((A0 * Math.pow(b, 2)) - (x * A0 * b)) / ck) - (A0 * Math.pow(b, 2) * Math.exp(-x / b) / ck))

    var T1 = circularShift(T, 1, true)

    var q = T1.map(function (item, index) {   // T1-T
        return item - T[index];
    })

    var q = q.map(x => x * (ck / dz))
    q[0] = Q0

    return [T, q, A0]

    // console.log(q);
    // console.log(T)
    // console.log(T1)

}

function circularShift(arrayPar, steps, shiftLeft) {
    var array = arrayPar.slice(0);
    for (var i = 0; i < steps; i++) {
        if (shiftLeft)
            array.push(array.shift());
        else
            array.unshift(array.pop());
    }
    return array;
}

// get Leaflet extension component and Leaflet instance
var lmapComponent = chart.getModel().getComponent("lmap");
var lmap = lmapComponent.getLeaflet();

// L.tileLayer(
//     "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
//     {
//         attribution:
//             "Tiles &copy; Esri &mdash",
//     }
// ).addTo(lmap);

var layers = [];
for (var providerId in providers) {
    layers.push(providers[providerId]);
}
// L.geoJson(egyptBoundary, {
//     // Add invert: true to invert the geometries in the GeoJSON file
//     invert: true,
//     renderer: L.svg({ padding: 5 }),
//     color: 'gray', fillOpacity: 0.4, weight: 0, setZIndex: 0
// }).addTo(lmap);

L.control.scale(
    {
        imperial: false,
    }).addTo(lmap);


var ctrl = L.control.iconLayers(layers).addTo(lmap);

lmap.addControl(new L.Control.LinearMeasurement({
    unitSystem: 'metric',
    color: '#FF0080',
    type: 'line'
}));


L.Control.betterFileLayer({
    fileSizeLimit: 60240, // File size limit in kb (10 MB)),
    text: { // If you need translate
        title: "Import a file (Max 60 MB)", // Plugin Button Text
    },
}).addTo(lmap);

var notification = L.control
    .notifications({
        className: 'pastel',
        timeout: 5000,
        position: 'topleft',
        closable: true,
        dismissable: true,
    })
    .addTo(lmap);

lmap.on("bfl:layerloaded", function () { notification.success('Success', 'Data loaded successfully'); })
lmap.on("bfl:layerloaderror", function () { notification.alert('Error', 'Unable to load file'); })
lmap.on("bfl:filenotsupported", function () { notification.alert('Error', 'File type not supported'); })
lmap.on("bfl:layerisempty", function () { notification.warning('Error', 'No features in file'); })
lmap.on("bfl:filesizelimit", function () { notification.alert('Error', 'Maximun file size allowed is 50 MB'); })



option1 = {
    legend: {
        data: ['T_Curie', 'Solidus (3°C/km)'],
    },
    // title: {
    //     text: '1-D Geotherm',
    //     left: '1%'

    // },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: "cross"
        },
        textStyle: {
            fontSize: 12,
        },
        valueFormatter: (value) => + value.toFixed(2) + ' °C',


    },
    toolbox: {
        feature: {
            restore: { show: true },
            saveAsImage: {
                show: true,
                pixelRatio: 5,
                name: 'Geotherm'
            }
        },
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '4%',
        containLabel: true
    },
    dataZoom: [
        {
            type: 'inside',
            xAxisIndex: [0],
            yAxisIndex: [0],

        },],
    xAxis: {
        name: 'Temperature',
        nameLocation: 'middle',
        type: 'value',
        axisLabel: {
            formatter: '{value} °C'
        },

        nameTextStyle: {
            verticalAlign: 'top',
            lineHeight: 27,
            fontWeight: 'bold'
        },
    },
    yAxis: {
        name: 'Depth (Km)',
        min: 0,
        max: 100,
        interval: 2000,
        nameLocation: 'start',

        nameTextStyle: {
            fontWeight: 'bold'
        },
        type: 'category',
        axisLine: { onZero: false },
        axisLabel: {
            formatter: '{value} km'
        },
        inverse: true,
        boundaryGap: false,
        data: Array.from({ length: 101 }, (v, k) => k + 1) - 1
    },
    series: [
        {
            name: 'T_Curie',
            type: 'line',
            symbol: 'emptycircle',
            showSymbol: false,
            smooth: true,
            color: '#EDC6C3',
            lineStyle: {
                width: 2,
                shadowColor: 'rgba(0,0,0,0.3)',
                shadowBlur: 10,
                shadowOffsetY: 8,
                type: 'dashed',
            },

            animation: false,
            data: Array.from({ length: 101 }, (v, k) => 580)

        },
        {
            name: 'Solidus (3°C/km)',
            type: 'line',
            symbol: 'emptycircle',
            showSymbol: false,
            color: '#C0BBBA',
            animation: false,

            lineStyle: {
                width: 2,
                shadowColor: 'rgba(0,0,0,0.3)',
                shadowBlur: 10,
                shadowOffsetY: 8,
                type: 'dotted',
            },
            data:
                Array.from({ length: 101 }, (v, k) => 1100 + k * 1000 * 0.0035) // solidus at 3.5 c/km

        }
    ]
};


// initialize echart
var chart1 = echarts.init(document.getElementById("chart1"));
chart1.setOption(option1);





option2 = {
    legend: {
        data: [],
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: "cross"
        },
        textStyle: {
            fontSize: 12,
        },
        valueFormatter: (value) => + value.toFixed(2) + ' mW/m2',


    },
    toolbox: {
        feature: {
            restore: { show: true },
            saveAsImage: {
                show: true,
                pixelRatio: 5,
                name: 'Geotherm'
            }
        },
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '4%',
        containLabel: true,
        show: true,
    },
    dataZoom: [
        {
            type: 'inside',
            xAxisIndex: [0],
            yAxisIndex: [0],

        },],
    xAxis: {
        name: 'Heat flow (mW/m2)',
        nameLocation: 'middle',
        type: 'value',
        min: -0.1,
        max: 60,

        nameTextStyle: {
            verticalAlign: 'top',
            lineHeight: 27,
            fontWeight: 'bold'
        },
    },
    yAxis: {
        name: 'Depth (Km)',
        min: -6,
        max: 100.1,
        nameLocation: 'start',
        nameTextStyle: {
            fontWeight: 'bold',
            // lineHeight: 40,
        },
        type: 'category',
        axisLabel: {
            formatter: '{value} km'
        },
        inverse: true,
        boundaryGap: false,
        data: ['0', '100']
    },
    series: [
        {
            data: [0, 100],
            // type: 'line',
            show: false,
        }
    ]

};

// initialize echart
var chart2 = echarts.init(document.getElementById("chart2"));
chart2.setOption(option2);

window.addEventListener('resize', function () {
    chart1.resize();
    chart2.resize();

});
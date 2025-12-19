import { exec } from "kernelsu";

function writeValueByQuerySelector(key, value, type = "textContent") {
    const keyElement = document.querySelector(key);
    switch(type) {
        case "innerHTML":
            keyElement.innerHTML = value;
            break;
        case "innerText":
            keyElement.innerText = value;
            break;
        case "textContent":
            keyElement.textContent = value;
            break;
        case "value":
            keyElement.value = value;
            break;
        default:
            keyElement.innerHTML = value;
    };
};

function addValueByQuerySelector(key, value, type = "innerHTML") {
    const keyElement = document.querySelector(key);
    switch(type) {
        case "innerHTML":
            keyElement.insertAdjacentHTML("beforeend", value);
            break;
        case "innerText":
            keyElement.innerText += value;
            break;
        case "textContent":
            keyElement.textContent += value;
            break;
        case "value":
            keyElement.value += value;
            break;
        default:
            keyElement.innerHTML += value;
    };
};

function chartCard(keyword, title, subtitle) {
    return `
<div id="${keyword}-chart-container" class="chart-container">
    <div class="chart-card-title">
        <div>${title}</div>
        <div>${subtitle}</div>
    </div>
    <div id="${keyword}-chart-wrapper" style="position: relative; width: 100%;">
        <canvas id="${keyword}-chart"></canvas>
    </div>
</div>`;
};

function chartCardBottomInfo(max, min, avg, unit) {
    return `
<div class="chart-card-btm-info">
    <div>MAX: ${max}${unit}</div>
    <div>MIN: ${min}${unit}</div>
    <div>AVG: ${avg}${unit}</div>
</div>`;
};

function getFPSYTicks(maxFPS) {
    if (maxFPS <= 62) {
        return [15, 30, 45, 60];
    } else if (maxFPS <= 92) {
        return [30, 60, 90];
    } else if (maxFPS <= 122) {
        return [30, 60, 90, 120];
    } else if (maxFPS <= 146) {
        return [30, 60, 90, 120, 144];
    } else if (maxFPS <= 167) {
        return [30, 60, 90, 120, 165];
    } else {
        return [30, 60, 90, 120, 165];
    };
};

function getCpuFreqYTicks(maxFreq) {
    const step = maxFreq <= 3000 ? 300 : 400;  
    const ticks = [];
    const limit = Math.ceil(maxFreq / step) * step;
    for (let i = step; i <= limit; i += step) ticks.push(i);
    return { ticks, step };
};


const policyColors = {
    "7": "rgba(252, 138, 27, 1)",
    "6": "rgba(252, 138, 27, 1)",
    "5": "rgba(2, 185, 194, 1)",
    "4": "rgba(0, 213, 217, 1)",
    "3": "rgba(0, 213, 217, 1)",
    "2": "rgba(0, 213, 217, 1)",
    "0": "rgba(178, 118, 227, 1)",
    "default": "rgba(127.5, 127.5, 127.5, 1)",
};

function policyListToColors(policyList) {
    const colorMap = new Map([
        [["0,2,5,7"], ["rgba(178, 118, 227, 1)", "rgba(0, 213, 217, 1)", "rgba(2, 185, 194, 1)", "rgba(252, 138, 27, 1)"]],
        [["0,4,7"], ["rgba(178, 118, 227, 1)", "rgba(0, 213, 217, 1)", "rgba(252, 138, 27, 1)"]],
        [["0,3,7"], ["rgba(178, 118, 227, 1)", "rgba(0, 213, 217, 1)", "rgba(252, 138, 27, 1)"]],
        [["0,6"], ["rgba(178, 188, 227, 1)", "rgba(252, 138, 27, 1)"]],
    ]);
    const key = policyList.sort((a, b) => a - b).toString();
    return colorMap.get(key) || null;
};

async function main() {
    try {
        const fileName = document.querySelector("title").textContent;
        const container = document.querySelector(".container");
        const csvListPath = "/data/adb/frame_tracker/output";
        const [csvListRaw, allCsvRaw] = await Promise.all([
            exec(`cat "${csvListPath}/csvList.json"`).then(r => r.stdout),
            exec(`cat "${csvListPath}/allCsvData.json"`).then(r => r.stdout),
        ]);
        const csvList = JSON.parse(csvListRaw.trim()).map(item => item.slice(0, -4));
        const allCsvData = JSON.parse(allCsvRaw.trim());
        const fileIndex = csvList.indexOf(fileName);
        // FPS & Battery Temperature Card
        const fpsIndex = allCsvData[fileIndex].header.indexOf("FPS");
        const batteryTempIndex = allCsvData[fileIndex].header.indexOf("Battery(℃)");
        const fpsList = allCsvData[fileIndex].rows.map(row => parseFloat(row[fpsIndex]));
        const batteryTempList = allCsvData[fileIndex].rows.map(row => parseFloat(row[batteryTempIndex]));
        let addCode = chartCard("fps", "FPS", "Temperature(℃)");
        addValueByQuerySelector(".container", addCode, "innerHTML");
        const fpsWrapper = document.getElementById("fps-chart-wrapper");
        const fpsCard = document.getElementById("fps-chart").getContext("2d");
        const labels = fpsList.map((value, index) => index);
        const total = labels.length;
        const step = Math.floor((total - 1) / 5);
        const ticksPositions = [
            0,
            step,
            step * 2,
            step * 3,
            step * 4,
            total - 1,
        ];
        const maxFPS = Math.max(...fpsList);
        const maxBatteryTemp = Math.max(...batteryTempList);
        const FPSyTickValues = getFPSYTicks(maxFPS);
        const tempMax = Math.ceil(maxBatteryTemp / 5) * 5;
        const tempMin = Math.floor(Math.min(...batteryTempList) / 5) * 5;
        const FPSLeftTickCount = FPSyTickValues.length + 1;
        const targetIndexForMax = FPSLeftTickCount - 2;
        const rangeCount = (tempMax - tempMin) / 5;
        const btstep = rangeCount > (FPSLeftTickCount - 1) / 2 + 1 ? 20 : 10;
        let y1Ticks = new Array(FPSLeftTickCount).fill(0);
        y1Ticks[targetIndexForMax] = tempMax;
        for (let i = targetIndexForMax - 1; i >= 0; i--) {
            y1Ticks[i] = y1Ticks[i + 1] - btstep;
        };
        for (let i = targetIndexForMax + 1; i < FPSLeftTickCount; i++) {
            y1Ticks[i] = y1Ticks[i - 1] + btstep;
        };
        let y1DisplayTicks = [...y1Ticks];
        if (btstep === 10) {
            let extraTicks = [];
            for (let i = 0; i < y1Ticks.length - 1; i++) {
                const a = y1Ticks[i];
                const b = y1Ticks[i + 1];
                if (Math.abs(b - a) === 10) {
                    extraTicks.push(a + 5);
                };
            };
            y1DisplayTicks = Array.from(new Set([...y1DisplayTicks, ...extraTicks])).sort((a, b) => a - b);
        };
        y1DisplayTicks = y1DisplayTicks.filter(v => v % 5 === 0);
        fpsWrapper.style.height = "210px";
        const timeLine = {
            min: 0,
            grid: {
                drawTicks: false,
                lineWidth: 0.5,
                color: (ctx) => {
                    return ticksPositions.includes(ctx.index)
                        ? "rgba(0, 0, 0, 0.1)"
                        : "rgba(0, 0, 0, 0)";
                },
            },
            border: {
                color: "rgba(0, 0, 0, 0)",
            },
            ticks: {
                autoSkip: false,
                minRotation: 0,
                maxRotation: 0,
                font: {
                    size: 8,
                    color: "rgba(0, 0, 0, 0.5)",
                },
                callback: (value, index) => {
                    if (!ticksPositions.includes(index)) return "";
                    const sec = labels[index];
                    if (sec === 0) return "0";
                    const m = Math.floor(sec / 60);
                    const s = sec % 60;
                    if (m > 0) {
                        if (s > 0) return `${m}m${s}s`;
                        return `${m}m`;
                    };
                    return `${s}s`;
                },
            },
        };
        const fpsChart = new Chart(fpsCard, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "FPS",
                        data: fpsList,
                        borderWidth: 1,
                        borderColor: "rgba(127.5, 127.5, 127.5, 1)",
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        pointRadius: 0,
                        tension: 0.01,
                        yAxisID: "y",
                    },
                    {
                        label: "TEMP(℃)",
                        data: batteryTempList,
                        borderWidth: 1,
                        borderColor: "rgba(255, 190, 127, 1)",
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        pointRadius: 0,
                        tension: 0.01,
                        yAxisID: "y1",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            font: {
                                size: 10,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            padding: 6,
                            boxWidth: 5,
                            boxHeight: 5,
                            usePointStyle: true,
                            pointStyle: "circle",
                            generateLabels(chart) {
                                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                labels.forEach(label => {
                                    label.lineWidth = 1;
                                    label.strokeStyle = label.strokeStyle;
                                    label.fillStyle = "rgba(0, 0, 0, 0)";
                                });
                                return labels;
                            },
                        },
                    },
                },
                scales: {
                    x: timeLine,
                    y: {
                        min: 0,
                        max: Math.max(FPSyTickValues[FPSyTickValues.length - 1], Math.ceil(maxFPS)),
                        grid: {
                            drawTicks: false,
                            lineWidth: (context) => {
                                if (context.tick.value === 0) return 1.5;
                                return 1;
                            },
                            color: (context) => {
                                if (context.tick.value === 0) return "rgba(0, 0, 0, 0.5)";
                                return "rgba(0, 0, 0, 0.2)";
                            },
                        },
                        border: {
                            dash: [1, 2],
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 8,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            callback: (value) => {
                                if (value === 0) return "";
                                return FPSyTickValues.includes(value) ? value : "";
                            },
                        },
                        afterBuildTicks: (axis) => {
                            axis.ticks = [0, ...FPSyTickValues].map(v => ({ value: v }));
                        },
                    },
                    y1: {
                        position: "right",
                        min: y1DisplayTicks[0],
                        max: y1DisplayTicks[y1DisplayTicks.length - 1],
                        grid: {
                            drawTicks: false,
                            drawOnChartArea: false,
                        },
                        border: {
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 8,
                            },
                            color: (ctx) => {
                                const value = ctx.tick.value;
                                if (tempMin <= value && value <= tempMax) return "rgba(0, 0, 0, 0.5)";
                                return "rgba(0, 0, 0, 0)";
                            },
                        },
                        afterBuildTicks: (axis) => {
                            axis.ticks = y1DisplayTicks.map(v => ({ value: v }));
                        },
                    },
                },
            },
        });
        // JANK Card
        const jankIndex = allCsvData[fileIndex].header.indexOf("JANK");
        const bigJankIndex = allCsvData[fileIndex].header.indexOf("BigJANK");
        const jankList = allCsvData[fileIndex].rows.map(row => parseFloat(row[jankIndex]) || 0);
        const bigJankList = allCsvData[fileIndex].rows.map(row => parseFloat(row[bigJankIndex]) || 0);
        const jankCount = jankList.reduce((sum, val) => sum + val, 0);
        const bigJankCount = bigJankList.reduce((sum, val) => sum + val, 0);
        addCode = chartCard("jank", "JANK", "");
        addValueByQuerySelector(".container", addCode, "innerHTML");
        const jankWrapper = document.getElementById("jank-chart-wrapper");
        const jankCard = document.getElementById("jank-chart").getContext("2d");
        jankWrapper.style.height = "105px";
        const jankYTicks = [0, 1, 2, 3];
        const jankChart = new Chart(jankCard, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: `JANK: ${jankCount}`, 
                        data: jankList,
                        borderWidth: 0.25,
                        borderColor: "rgba(134, 211, 255, 1)",
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        barPercentage: 1,
                        categoryPercentage: 1,
                        minBarLength: 1,
                        order: 0,
                    },
                    {
                        label: `BIG JANK: ${bigJankCount}`, 
                        data: bigJankList,
                        borderWidth: 0.25,
                        borderColor: "rgba(253, 182, 226, 1)",
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        barPercentage: 1,
                        categoryPercentage: 1,
                        minBarLength: 1,
                        order: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            font: {
                                size: 10,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            padding: 6,
                            boxWidth: 5,
                            boxHeight: 5,
                            usePointStyle: true,
                            pointStyle: "circle",
                            generateLabels(chart) {
                                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                labels.forEach(label => {
                                    label.lineWidth = 1;
                                    label.strokeStyle = label.strokeStyle;
                                    label.fillStyle = "rgba(0, 0, 0, 0)";
                                });
                                return labels;
                            },
                        },
                        onClick: (e) => e.stopPropagation(),
                    },
                },
                scales: {
                    x: {
                        ...timeLine,
                        offset: false,
                        grid: {
                            ...timeLine.grid,
                            offset: false,
                        },
                    },
                    y: {
                        min: 0,
                        max: 3,
                        grid: {
                            drawTicks: false,
                            lineWidth: (context) => {
                                if (context.tick.value === 0) return 1.5;
                                return 1;
                            },
                            color: (context) => {
                                if (context.tick.value === 0) return "rgba(0, 0, 0, 0.5)";
                                return "rgba(0, 0, 0, 0.2)";
                            },
                        },
                        border: {
                            dash: [1, 2],
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 8,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            callback: (value) => {
                                if (value === 0) return "";
                                return jankYTicks.includes(value) ? value : "";
                            },
                        },
                        afterBuildTicks: (axis) => {
                            axis.ticks = jankYTicks.map(v => ({ value: v }));
                        },
                    },
                },
            },
        });
        // Frame Time Card
        const ftIndex = allCsvData[fileIndex].header.indexOf("Max FrameTime(ms)");
        const ftList = allCsvData[fileIndex].rows.map(row => parseFloat(row[ftIndex]) || 0);
        const maxFT = Math.max(...ftList).toFixed(2);
        const minFT = Math.min(...ftList).toFixed(2);
        const avgFT = (ftList.reduce((sum, val) => sum + val, 0) / ftList.length).toFixed(2);
        addCode = chartCard("frametime", "Frame Time(ms)", "");
        addValueByQuerySelector(".container", addCode, "innerHTML");
        let bottomInfoHtml = chartCardBottomInfo(maxFT, minFT, avgFT, "ms");
        addValueByQuerySelector("#frametime-chart-container", bottomInfoHtml, "innerHTML");
        const ftWrapper = document.getElementById("frametime-chart-wrapper");
        const ftCard = document.getElementById("frametime-chart").getContext("2d");
        ftWrapper.style.height = "210px";
        let ftYMax = 50;
        if (50 < maxFT && maxFT <= 75) {
            ftYMax = 75;
        } else if (maxFT > 75) {
            ftYMax = 100;
        };
        const ftFixedTicks = [8, 16, 25, 33, 41, 50, 58, 66, 75, 83, 91, 100];
        const maxFrameTime = maxFT;
        const frametimeChart = new Chart(ftCard, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Frame Time(ms)", 
                        data: ftList,
                        borderWidth: 0.25,
                        borderColor: "rgba(135, 211, 255, 1)",
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        barPercentage: 1,
                        categoryPercentage: 1,
                        minBarLength: 1,
                        order: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            font: {
                                size: 10,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            padding: 6,
                            boxWidth: 5,
                            boxHeight: 5,
                            usePointStyle: true,
                            pointStyle: "circle",
                            generateLabels(chart) {
                                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                labels.forEach(label => {
                                    label.lineWidth = 1;
                                    label.strokeStyle = label.strokeStyle;
                                    label.fillStyle = "rgba(0, 0, 0, 0)";
                                });
                                return labels;
                            },
                        },
                        onClick: (e) => e.stopPropagation(),
                    },
                },
                scales: {
                    x: {
                        ...timeLine,
                        offset: false,
                        grid: {
                            ...timeLine.grid,
                            offset: false,
                        },
                    },
                    y: {
                        min: 0,
                        max: ftYMax,
                        grid: {
                            drawTicks: false,
                            lineWidth: (context) => {
                                if (context.tick.value === 0) return 1.5;
                                return 1;
                            },
                            color: (context) => {
                                if (context.tick.value === 0) return "rgba(0, 0, 0, 0.5)";
                                return "rgba(0, 0, 0, 0.2)";
                            },
                        },
                        border: {
                            dash: [1, 2],
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 8,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            callback: (value) => {
                                if (value === 0) return "";
                                return ftFixedTicks.includes(value) ? value : "";
                            },
                        },
                        afterBuildTicks: (axis) => {
                            const ticksToShow = [0, ...ftFixedTicks.filter(v => v <= ftYMax)];
                            axis.ticks = ticksToShow.map(v => ({ value: v }));
                        },
                    },
                },
            },
        });
        // CPU Usage Card
        const cpuPolicy = await getCpuPolicyIds();
        const sortedPolicies = cpuPolicy.slice().sort((a, b) => a - b);
        const colors = policyListToColors(sortedPolicies);
        const cpuUsageDatasets = [];
        for (let i = 0; i < sortedPolicies.length; i++) {
            const policyId = sortedPolicies[i];
            const color = colors ? colors[i] : (policyColors[policyId] || policyColors["default"]);
            const cpus = await getCpuClusterLabel(policyId, "cpunum");
            let clusterLabel;
            if (cpus.length === 0) {
                clusterLabel = `CPU ${policyId}`;
            } else {
                let ranges = [];
                let start = cpus[0];
                let end = start;
                for (let j = 1; j < cpus.length; j++) {
                    const current = cpus[j];
                    if (current === end + 1) {
                        end = current;
                    } else {
                        ranges.push(start === end ? `CPU ${start}` : `CPU ${start}~${end}`);
                        start = current;
                        end = current;
                    };
                };
                ranges.push(start === end ? `CPU ${start}` : `CPU ${start}~${end}`);
                clusterLabel = ranges.join(", ");
            };
            let firstCpu = true;
            for (const cpunum of cpus) {
                const cpuUsageIndex = allCsvData[fileIndex].header.indexOf(`CPU${cpunum}(%)`);
                if (cpuUsageIndex === -1) continue;
                const cpuUsageList = allCsvData[fileIndex].rows.map(row => parseFloat(row[cpuUsageIndex]) || 0);
                const label = firstCpu ? clusterLabel : undefined;
                cpuUsageDatasets.push({
                    label: label,
                    data: cpuUsageList,
                    borderWidth: 0.75,
                    borderColor: color,
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    pointRadius: 0,
                    tension: 0.1,
                    order: -cpunum,
                });
                firstCpu = false;
            };
        };
        addCode = chartCard("cpuusage", "CPU Usage(%)", "");
        addValueByQuerySelector(".container", addCode, "innerHTML");
        const cpuusageWrapper = document.getElementById("cpuusage-chart-wrapper");
        const cpuusageCard = document.getElementById("cpuusage-chart").getContext("2d");
        cpuusageWrapper.style.height = "210px";
        const cpuUsageYTickValues = Array.from({ length: (100 - 10) / 10 + 1 }, (_, i) => 10 + i * 10);
        const cpuusageChart = new Chart(cpuusageCard, {
            type: "line",
            data: {
                labels: labels,
                datasets: cpuUsageDatasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            font: {
                                size: 10,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            padding: 6,
                            boxWidth: 5,
                            boxHeight: 5,
                            usePointStyle: true,
                            pointStyle: "circle",
                            filter: (item) => {
                                return item.text && item.text !== "undefined";
                            },
                            generateLabels(chart) {
                                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                labels.forEach(label => {
                                    label.lineWidth = 1;
                                    label.strokeStyle = label.strokeStyle;
                                    label.fillStyle = "rgba(0, 0, 0, 0)";
                                });
                                return labels;
                            },
                        },
                        onClick: (e) => e.stopPropagation(),
                    },
                },
                scales: {
                    x: timeLine,
                    y: {
                        min: 0,
                        max: 100,
                        grid: {
                            drawTicks: false,
                            lineWidth: (context) => {
                                if (context.tick.value === 0) return 1.5;
                                return 1;
                            },
                            color: (context) => {
                                if (context.tick.value === 0) return "rgba(0, 0, 0, 0.5)";
                                return "rgba(0, 0, 0, 0.2)";
                            },
                        },
                        border: {
                            dash: [1, 2],
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 8,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            callback: (value) => {
                                if (value === 0) return "";
                                return cpuUsageYTickValues.includes(value) ? value : "";
                            },
                        },
                        afterBuildTicks: (axis) => {
                            axis.ticks = [0, ...cpuUsageYTickValues].map(v => ({ value: v }));
                        },
                    },
                },
            },
        });
        // CPU Frequency Card
        const cpufreqDatasets = [];
        let globalMaxCpuFreq = 0;
        let level = 0;
        for (const policy of cpuPolicy) {
            const cpufreqIndex = allCsvData[fileIndex].header.indexOf(`CPU${policy}(MHz)`);
            const cpufreqList = allCsvData[fileIndex].rows.map(row => parseFloat(row[cpufreqIndex]));
            const currentMax = Math.max(...cpufreqList);
            if (currentMax > globalMaxCpuFreq) globalMaxCpuFreq = currentMax;
            const label = await getCpuClusterLabel(policy, "label");
            const color = policyColors[policy] || policyColors["default"];
            cpufreqDatasets.push({
                label: label,
                data: cpufreqList,
                borderWidth: 0.75,
                borderColor: color,
                backgroundColor: "rgba(0, 0, 0, 0)",
                pointRadius: 0,
                tension: 0.1,
                order: parseInt(level),
            });
            level -= 1;
        };
        addCode = chartCard("cpufreq", "CPU Frequency(MHz)", "");
        addValueByQuerySelector(".container", addCode, "innerHTML");
        const cpufreqWrapper = document.getElementById("cpufreq-chart-wrapper");
        const cpufreqCard = document.getElementById("cpufreq-chart").getContext("2d");
        const { ticks: cpuYTickValues } = getCpuFreqYTicks(globalMaxCpuFreq);
        cpufreqWrapper.style.height = "210px";
        const cpufreqChart = new Chart(cpufreqCard, {
            type: "line",
            data: {
                labels: labels,
                datasets: cpufreqDatasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            font: {
                                size: 10,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            padding: 6,
                            boxWidth: 5,
                            boxHeight: 5,
                            usePointStyle: true,
                            pointStyle: "circle",
                            generateLabels(chart) {
                                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                labels.forEach(label => {
                                    label.lineWidth = 1;
                                    label.strokeStyle = label.strokeStyle;
                                    label.fillStyle = "rgba(0, 0, 0, 0)";
                                });
                                return labels;
                            },
                        },
                    },
                },
                scales: {
                    x: timeLine,
                    y: {
                        min: 0,
                        max: cpuYTickValues[cpuYTickValues.length - 1] || globalMaxCpuFreq, 
                        grid: {
                            drawTicks: false,
                            lineWidth: (context) => {
                                if (context.tick.value === 0) return 1.5;
                                return 1;
                            },
                            color: (context) => {
                                if (context.tick.value === 0) return "rgba(0, 0, 0, 0.5)";
                                return "rgba(0, 0, 0, 0.2)";
                            },
                        },
                        border: {
                            dash: [1, 2],
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 8,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            callback: (value) => {
                                if (value === 0) return "";
                                return cpuYTickValues.includes(value) ? value : "";
                            },
                        },
                        afterBuildTicks: (axis) => {
                            axis.ticks = [0, ...cpuYTickValues].map(v => ({ value: v }));
                        },
                    },
                },
            },
        });
        // CPU Cycles & Temperature Card
        const cpuCyclesDatasets = [];
        for (let i = 0; i < sortedPolicies.length; i++) {
            const policyId = sortedPolicies[i];
            const color = colors ? colors[i] : (policyColors[policyId] || policyColors["default"]);
            const cpus = await getCpuClusterLabel(policyId, "cpunum");
            let clusterLabel;
            if (cpus.length === 0) {
                clusterLabel = `CPU ${policyId}`;
            } else {
                let ranges = [];
                let start = cpus[0];
                let end = start;
                for (let j = 1; j < cpus.length; j++) {
                    const current = cpus[j];
                    if (current === end + 1) {
                        end = current;
                    } else {
                        ranges.push(start === end ? `CPU ${start}` : `CPU ${start}~${end}`);
                        start = current;
                        end = current;
                    };
                };
                ranges.push(start === end ? `CPU ${start}` : `CPU ${start}~${end}`);
                clusterLabel = ranges.join(", ");
            };
            let firstCpu = true;
            for (const cpunum of cpus) {
                const cpuCyclesIndex = allCsvData[fileIndex].header.indexOf(`CPU${cpunum}(M Cycles)`);
                if (cpuCyclesIndex === -1) continue;
                const cpuCyclesList = allCsvData[fileIndex].rows.map(row => parseFloat(row[cpuCyclesIndex]) || 0);
                const label = firstCpu ? clusterLabel : undefined;
                cpuCyclesDatasets.push({
                    label: label,
                    data: cpuCyclesList,
                    borderWidth: 0.75,
                    borderColor: color,
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    pointRadius: 0,
                    tension: 0.1,
                    order: -cpunum,
                });
                firstCpu = false;
            };
        };
        const cpuTempIndex = allCsvData[fileIndex].header.indexOf("CPU(℃)");
        const cpuTempList = allCsvData[fileIndex].rows.map(row => parseFloat(row[cpuTempIndex]) || 0);
        let globalMaxCpuCycles = 0;
        cpuCyclesDatasets.forEach(ds => {
            const max = Math.max(...ds.data);
            if (max > globalMaxCpuCycles) globalMaxCpuCycles = max;
        });
        globalMaxCpuCycles = Math.max(2100, globalMaxCpuCycles);
        const { ticks: cpuCyclesTicks } = getCpuFreqYTicks(globalMaxCpuCycles);
        const cpuTempTicks = Array.from({ length: 10 }, (_, i) => (i + 1) * 10);
        const cpuTempDataset = {
            label: "TEMP(℃)",
            data: cpuTempList,
            borderWidth: 1,
            borderColor: "rgba(135, 211, 255, 1)",
            backgroundColor: "rgba(0, 0, 0, 0)",
            pointRadius: 0,
            tension: 0.1,
            yAxisID: "y1",
            order: 0,
        };
        addCode = chartCard("cpucycles", "CPU Cycles(M)", "CPU Temperature(℃)");
        addValueByQuerySelector(".container", addCode, "innerHTML");
        const cpucyclesWrapper = document.getElementById("cpucycles-chart-wrapper");
        const cpucyclesCard = document.getElementById("cpucycles-chart").getContext("2d");
        cpucyclesWrapper.style.height = "210px";
        const cpucyclesChart = new Chart(cpucyclesCard, {
            type: "line",
            data: {
                labels: labels,
                datasets: [...cpuCyclesDatasets, cpuTempDataset],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            font: {
                                size: 10,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            padding: 6,
                            boxWidth: 5,
                            boxHeight: 5,
                            usePointStyle: true,
                            pointStyle: "circle",
                            filter: (item) => {
                                return item.text && item.text !== "undefined";
                            },
                            generateLabels(chart) {
                                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                labels.forEach(label => {
                                    label.lineWidth = 1;
                                    label.strokeStyle = label.strokeStyle;
                                    label.fillStyle = "rgba(0, 0, 0, 0)";
                                });
                                return labels;
                            },
                        },
                        onClick: (e) => e.stopPropagation(),
                    },
                },
                scales: {
                    x: timeLine,
                    y: {
                        min: 0,
                        max: cpuCyclesTicks[cpuCyclesTicks.length - 1] || globalMaxCpuCycles,
                        grid: {
                            drawTicks: false,
                            lineWidth: (context) => {
                                if (context.tick.value === 0) return 1.5;
                                return 1;
                            },
                            color: (context) => {
                                if (context.tick.value === 0) return "rgba(0, 0, 0, 0.5)";
                                return "rgba(0, 0, 0, 0.2)";
                            },
                        },
                        border: {
                            dash: [1, 2],
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 8,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            callback: (value) => {
                                if (value === 0) return "";
                                return cpuCyclesTicks.includes(value) ? value : "";
                            },
                        },
                        afterBuildTicks: (axis) => {
                            axis.ticks = [0, ...cpuCyclesTicks].map(v => ({ value: v }));
                        },
                    },
                    y1: {
                        position: "right",
                        min: 0,
                        max: 100,
                        grid: {
                            drawTicks: false,
                            drawOnChartArea: false,
                        },
                        border: {
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 8,
                            },
                            color: (ctx) => {
                                const value = ctx.tick.value;
                                if (cpuTempTicks.includes(value)) return "rgba(0, 0, 0, 0.5)";
                                return "rgba(0, 0, 0, 0)";
                            },
                            callback: (value) => {
                                if (value === 0) return "";
                                return cpuTempTicks.includes(value) ? value : "";
                            },
                        },
                        afterBuildTicks: (axis) => {
                            axis.ticks = [0, ...cpuTempTicks].map(v => ({ value: v }));
                        },
                    },
                },
            },
        });
        // GPU Frequency & Usage Card
        const gpufreqIndex = allCsvData[fileIndex].header.indexOf("GPU(KHz)");
        const gpuUsageIndex = allCsvData[fileIndex].header.indexOf("GPU(%)");
        const gpufreqList = allCsvData[fileIndex].rows.map(row => parseFloat(row[gpufreqIndex]));
        const gpuUsageList = allCsvData[fileIndex].rows.map(row => parseFloat(row[gpuUsageIndex]));
        addCode = chartCard("gpufreq", "GPU Frequency(MHz)", "Usage(%)");
        addValueByQuerySelector(".container", addCode, "innerHTML");
        const gpufreqWrapper = document.getElementById("gpufreq-chart-wrapper");
        const gpufreqCard = document.getElementById("gpufreq-chart").getContext("2d");
        gpufreqWrapper.style.height = "210px";
        const maxGpuFreqMHz = Math.max(...gpufreqList);
        const gpuYMax = Math.max(600, Math.ceil(maxGpuFreqMHz / 100) * 100);
        const gpuFreqTicks = [];
        for (let i = 100; i <= gpuYMax; i += 100) {
            gpuFreqTicks.push(i);
        };
        const gpuUsageTicks = Array.from({ length: (100 - 5) / 5 + 1 }, (_, i) => 5 + i * 5);
        const gpuUsageDisplayList = [50, 75, 90, 100]
        const gpufreqChart = new Chart(gpufreqCard, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Frequency(MHz)",
                        data: gpufreqList,
                        borderWidth: 1,
                        borderColor: "rgba(135, 211, 255, 1)",
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        pointRadius: 0,
                        tension: 0.1,
                        yAxisID: "y",
                        order: 1,
                    },
                    {
                        label: "Usage(%)",
                        data: gpuUsageList,
                        borderWidth: 1,
                        borderColor: "rgba(21, 116, 228, 1)",
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        pointRadius: 0,
                        tension: 0.1,
                        yAxisID: "y1",
                        order: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            font: {
                                size: 10,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            padding: 6,
                            boxWidth: 5,
                            boxHeight: 5,
                            usePointStyle: true,
                            pointStyle: "circle",
                            generateLabels(chart) {
                                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                labels.forEach(label => {
                                    label.lineWidth = 1;
                                    label.strokeStyle = label.strokeStyle;
                                    label.fillStyle = "rgba(0, 0, 0, 0)";
                                });
                                return labels;
                            },
                        },
                    },
                },
                scales: {
                    x: timeLine,
                    y: {
                        min: 0,
                        max: gpuYMax,
                        grid: {
                            drawTicks: false,
                            lineWidth: (context) => {
                                if (context.tick.value === 0) return 1.5;
                                return 1;
                            },
                            color: (context) => {
                                if (context.tick.value === 0) return "rgba(0, 0, 0, 0.5)";
                                return "rgba(0, 0, 0, 0.2)";
                            },
                        },
                        border: {
                            dash: [1, 2],
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 8,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            callback: (value) => {
                                if (value === 0) return "";
                                return gpuFreqTicks.includes(value) ? value : "";
                            },
                        },
                        afterBuildTicks: (axis) => {
                            axis.ticks = [0, ...gpuFreqTicks].map(v => ({ value: v }));
                        },
                    },
                    y1: {
                        position: "right",
                        min: 0,
                        max: 100,
                        grid: {
                            drawTicks: false,
                            drawOnChartArea: false,
                        },
                        border: {
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 8,
                            },
                            color: (ctx) => {
                                const value = ctx.tick.value;
                                if (gpuUsageDisplayList.includes(value)) return "rgba(0, 0, 0, 0.5)";
                                return "rgba(0, 0, 0, 0)";
                            },
                            callback: (value) => {
                                if (value === 0) return "";
                                return gpuUsageTicks.includes(value) ? value : "";
                            },
                        },
                        afterBuildTicks: (axis) => {
                            axis.ticks = [0, ...gpuUsageTicks].map(v => ({ value: v }));
                        },
                    },
                },
            },
        });
        // DDR Frequency Card
        const ddrIndex = allCsvData[fileIndex].header.indexOf("DDR(Mbps)");
        const ddrList = allCsvData[fileIndex].rows.map(row => parseFloat(row[ddrIndex]) || 0);
        addCode = chartCard("ddr", "DDR(MHz | Mbps)", "");
        addValueByQuerySelector(".container", addCode, "innerHTML");
        const ddrWrapper = document.getElementById("ddr-chart-wrapper");
        const ddrCard = document.getElementById("ddr-chart").getContext("2d");
        ddrWrapper.style.height = "210px";
        const maxDDR = Math.max(...ddrList);
        const ddrUniqueValues = [...new Set(ddrList)].sort((a, b) => a - b);
        if (!ddrUniqueValues.includes(0)) {
            ddrUniqueValues.unshift(0);
        };
        const ddrChart = new Chart(ddrCard, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Frequency(MHz| Mbps)",
                        data: ddrList,
                        borderWidth: 1,
                        borderColor: "rgba(135, 211, 255, 1)", 
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        pointRadius: 0,
                        tension: 0.1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            font: {
                                size: 10,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            padding: 6,
                            boxWidth: 5,
                            boxHeight: 5,
                            usePointStyle: true,
                            pointStyle: "circle",
                            generateLabels(chart) {
                                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                labels.forEach(label => {
                                    label.lineWidth = 1;
                                    label.strokeStyle = label.strokeStyle;
                                    label.fillStyle = "rgba(0, 0, 0, 0)";
                                });
                                return labels;
                            },
                        },
                    },
                    onClick: (e) => e.stopPropagation(),
                },
                scales: {
                    x: timeLine,
                    y: {
                        min: 0,
                        max: maxDDR,
                        grid: {
                            drawTicks: false,
                            lineWidth: (context) => {
                                if (context.tick.value === 0) return 1.5;
                                return 1;
                            },
                            color: (context) => {
                                if (context.tick.value === 0) return "rgba(0, 0, 0, 0.5)";
                                return "rgba(0, 0, 0, 0.2)";
                            },
                        },
                        border: {
                            dash: [1, 2],
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 8,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            callback: (value) => {
                                if (value === 0) return "";
                                return ddrUniqueValues.includes(value) ? value : "";
                            },
                        },
                        afterBuildTicks: (axis) => {
                            axis.ticks = ddrUniqueValues.map(v => ({ value: v }));
                        },
                    },
                },
            },
        });
        // Power & Battery Capacity Card
        const powerIndex = allCsvData[fileIndex].header.indexOf("Power(mW)");
        const batteryCapIndex = allCsvData[fileIndex].header.indexOf("Battery(%)");
        const powerListMW = allCsvData[fileIndex].rows.map(row => parseFloat(row[powerIndex]) || 0);
        const batteryCapList = allCsvData[fileIndex].rows.map(row => parseFloat(row[batteryCapIndex]) || 0);
        const powerList = powerListMW.map(v => v / 1000);
        const maxPW = Math.max(...powerList).toFixed(2);
        const minPW = Math.min(...powerList).toFixed(2);
        const avgPW = (powerList.reduce((sum, val) => sum + val, 0) / powerList.length).toFixed(2);
        let maxPower = Math.ceil(Math.max(...powerList));
        if (maxPower < 5) maxPower = 5;
        const powerTicks = [];
        for (let i = 1; i <= maxPower; i++) powerTicks.push(i);
        const batteryTicks = [0, 20, 40, 60, 80, 100];
        addCode = chartCard("power", "Power(W)", "Capacity(%)");
        addValueByQuerySelector(".container", addCode, "innerHTML");
        bottomInfoHtml = chartCardBottomInfo(maxPW, minPW, avgPW, "W");
        addValueByQuerySelector("#power-chart-container", bottomInfoHtml, "innerHTML");
        const powerWrapper = document.getElementById("power-chart-wrapper");
        const powerCard = document.getElementById("power-chart").getContext("2d");
        powerWrapper.style.height = "210px";
        const powerChart = new Chart(powerCard, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Power(W)",
                        data: powerList,
                        borderWidth: 1,
                        borderColor: "rgba(135, 211, 255, 1)",
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        pointRadius: 0,
                        tension: 0.1,
                        yAxisID: "y",
                        order: 1,
                    },
                    {
                        label: "Capacity(%)",
                        data: batteryCapList,
                        borderWidth: 1,
                        borderColor: "rgba(21, 116, 228, 1)",
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        pointRadius: 0,
                        tension: 0.1,
                        yAxisID: "y1",
                        order: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            font: {
                                size: 10,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            padding: 6,
                            boxWidth: 5,
                            boxHeight: 5,
                            usePointStyle: true,
                            pointStyle: "circle",
                            generateLabels(chart) {
                                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                labels.forEach(label => {
                                    label.lineWidth = 1;
                                    label.strokeStyle = label.strokeStyle;
                                    label.fillStyle = "rgba(0, 0, 0, 0)";
                                });
                                return labels;
                            },
                        },
                    },
                },
                scales: {
                    x: timeLine,
                    y: {
                        min: 0,
                        max: maxPower,
                        grid: {
                            drawTicks: false,
                            lineWidth: (ctx) => ctx.tick.value === 0 ? 1.5 : 1,
                            color: (ctx) => ctx.tick.value === 0 
                                ? "rgba(0, 0, 0, 0.5)" 
                                : "rgba(0, 0, 0, 0.2)",
                        },
                        border: {
                            dash: [1, 2],
                             color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            autoSkip: false,
                            font: { size: 8 },
                            callback: (value) => value === 0 ? "" : (powerTicks.includes(value) ? value : ""),
                        },
                        afterBuildTicks: (axis) => {
                            axis.ticks = [0, ...powerTicks].map(v => ({ value: v }));
                        },
                    },
                    y1: {
                        position: "right",
                        min: 0,
                        max: 100,
                        grid: {
                            drawTicks: false,
                            drawOnChartArea: false,
                        },
                        border: {
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            autoSkip: false,
                            font: { size: 8 },
                            color: (ctx) => {
                                const value = ctx.tick.value;
                                return batteryTicks.includes(value)
                                    ? "rgba(0, 0, 0, 0.5)"
                                    : "rgba(0, 0, 0, 0)";
                            },
                            callback: (value) => value === 0 ? "" : (batteryTicks.includes(value) ? value : ""),
                        },
                        afterBuildTicks: (axis) => {
                            axis.ticks = batteryTicks.map(v => ({ value: v }));
                        },
                    },
                },
            },
        });
        // CPU Temperature Card
        const maxCT = Math.max(...cpuTempList).toFixed(2);
        const minCT = Math.min(...cpuTempList).toFixed(2);
        const avgCT = (cpuTempList.reduce((sum, val) => sum + val, 0) / cpuTempList.length).toFixed(2);
        addCode = chartCard("cputemp", "CPU Temperature(℃)", "");
        addValueByQuerySelector(".container", addCode, "innerHTML");
        bottomInfoHtml = chartCardBottomInfo(maxCT, minCT, avgCT, "℃");
        addValueByQuerySelector("#cputemp-chart-container", bottomInfoHtml, "innerHTML");
        const cputempWrapper = document.getElementById("cputemp-chart-wrapper");
        const cputempCard = document.getElementById("cputemp-chart").getContext("2d");
        cputempWrapper.style.height = "210px";
        const cputempChart = new Chart(cputempCard, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "TEMP(℃)",
                        data: cpuTempList,
                        borderWidth: 1,
                        borderColor: "rgba(135, 211, 255, 1)",
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        pointRadius: 0,
                        tension: 0.1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            font: {
                                size: 10,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            padding: 6,
                            boxWidth: 5,
                            boxHeight: 5,
                            usePointStyle: true,
                            pointStyle: "circle",
                            generateLabels(chart) {
                                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                labels.forEach(label => {
                                    label.lineWidth = 1;
                                    label.strokeStyle = label.strokeStyle;
                                    label.fillStyle = "rgba(0, 0, 0, 0)";
                                });
                                return labels;
                            },
                        },
                    },
                    onClick: (e) => e.stopPropagation(),
                },
                scales: {
                    x: timeLine,
                    y: {
                        min: 0,
                        max: 100,
                        grid: {
                            drawTicks: false,
                            lineWidth: (context) => {
                                if (context.tick.value === 0) return 1.5;
                                return 1;
                            },
                            color: (context) => {
                                if (context.tick.value === 0) return "rgba(0, 0, 0, 0.5)";
                                return "rgba(0, 0, 0, 0.2)";
                            },
                        },
                        border: {
                            dash: [1, 2],
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            autoSkip: false,
                            font: {
                                size: 8,
                                color: "rgba(0, 0, 0, 0.5)",
                            },
                            callback: (value) => {
                                if (value === 0) return "";
                                return cpuTempTicks.includes(value) ? value : "";
                            },
                        },
                        afterBuildTicks: (axis) => {
                            axis.ticks = [0, ...cpuTempTicks].map(v => ({ value: v }));
                        },
                    },
                },
            },
        });
    } catch (error) {
        console.error("Catch error: ", error);
    };
};

async function getCpuPolicyIds() {
    try {
        const policyPath = "/sys/devices/system/cpu/cpufreq"
        const output = await exec(`ls "${policyPath}"`);
        const folders = output.stdout.trim().split(/\s+/).filter(folder => folder.startsWith("policy"));
        const policyIds = folders.map(folder => {
            const match = folder.match(/policy(\d+)/);
            return match ? parseInt(match[1], 10) : null;
        }).filter(id => id !== null);
        return policyIds;
  } catch (error) {
    console.error("Start failed: ", error);
    return [];
  };
};

async function getCpuClusterLabel(policyId, returnType = "label") {
    try {
        const path = `/sys/devices/system/cpu/cpufreq/policy${policyId}/affected_cpus`;
        const output = await exec(`cat "${path}"`);        
        const cpus = output.stdout.trim().split(/\s+/)
            .filter(c => c !== "")
            .map(c => parseInt(c, 10))
            .sort((a, b) => a - b);
        if (returnType === "cpunum") return cpus;
        if (cpus.length === 0) return `CPU ${policyId}`;
        let ranges = [];
        let start = cpus[0];
        let end = start;
        for (let i = 1; i < cpus.length; i++) {
            const current = cpus[i];
            if (current === end + 1) {
                end = current;
            } else {
                ranges.push(start === end ? `CPU ${start}` : `CPU ${start}~${end}`);
                start = current;
                end = current;
            };
        };
        ranges.push(start === end ? `CPU ${start}` : `CPU ${start}~${end}`);
        return ranges.join(", ");
    } catch (error) {
        console.error(`Error reading affected_cpus for policy${policyId}: `, error);
        return returnType === "cpunum" ? [] : `CPU ${policyId}`;
    };
};

async function getAllCpuNums() {
    try {
        const policyIds = await getCpuPolicyIds();
        const allCpuArrays = await Promise.all(
            policyIds.map(id => getCpuClusterLabel(id, "cpunum"))
        );
        const flatCpuList = allCpuArrays.flat(); 
        const uniqueCpuList = [...new Set(flatCpuList)].sort((a, b) => a - b);
        return uniqueCpuList;
    } catch (error) {
        console.error("Error fetching all CPU numbers:", error);
        return [];
    };
};

main().catch(error => {
    console.error("Start failed: ", error);
});

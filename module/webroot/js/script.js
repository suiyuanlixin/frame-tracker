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
            keyElement.innerHTML += value;
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

async function main() {
    try {
        const [modelResult, platformResult, osResult] = await Promise.all([
            exec("getprop ro.product.model"),
            exec("getprop ro.board.platform"),
            exec("getprop ro.build.version.release"),
        ]);
        writeValueByQuerySelector("#model-value", modelResult.stdout, "textContent");
        writeValueByQuerySelector("#platform-value", platformResult.stdout.toUpperCase(), "textContent");
        writeValueByQuerySelector("#os-value", "Android" + osResult.stdout, "textContent");
        const csvDir = "/data/adb/frame_tracker/csv";
        const csvList = await getCsvFiles(csvDir);
        const outFilePath = "/data/adb/frame_tracker/output";
        let fileIndex = 0;
        let allCsvData = [];
        let csvListSlice = [];
        for (const csvFile of csvList) {
            const parts = csvFile.split(" ");
            csvListSlice.push([parts[0], parts[1], parts[2].slice(0, -4).replace(/-/g, ":")]);
        };
        exec(`echo '${JSON.stringify(csvList, null, 0)}' > "${outFilePath}/csvList.json"`);
        for (const csvFile of csvList) {
            try {
                const csvPath = `${csvDir}/${csvFile}`;
                const { stdout } = await exec(`cat "${csvPath}"`);
                const lines = stdout.trim().split("\n");
                const header = lines[0].split(",");
                const rows = lines.slice(1).map(line => line.split(","));
                allCsvData.push({
                    filename: csvList[fileIndex],
                    header: header,
                    rows: rows,
                });
                fileIndex += 1;
            } catch(error) {
                console.error("Read csv path failed: ", error);
            };
        };
        exec(`echo '${JSON.stringify(allCsvData, null, 0)}' > "${outFilePath}/allCsvData.json"`);
        fileIndex = 0;
        for (const csvFile of csvList) {
            const avgFPS = calculateByKeyword(allCsvData, fileIndex, "FPS", 2, "avg");
            const avgPower = calculateByKeyword(allCsvData, fileIndex, "Power(mW)", 2, "avg");
            const powerW = mWToW(avgPower, 2);
            const timeLength = allCsvData[fileIndex].rows.length;
            const time = secondToTime(timeLength);
            csvListSlice[fileIndex].push(avgFPS, avgPower, timeLength);
            const outputList = [
                csvListSlice[fileIndex][0],
                csvListSlice[fileIndex][1],
                csvListSlice[fileIndex][3],
                powerW + "W",
                time,
            ];
            const pageUrl = csvList[fileIndex].slice(0, -4);
            addValueByQuerySelector(".container", recordCard(...outputList, pageUrl), "innerHTML");
            fileIndex += 1;
        };
        fileIndex = 0;
        for (const csvFile of csvList) {
            const pageDir = "/data/adb/modules/frame_tracker/webroot/page";
            const maxFPS = calculateByKeyword(allCsvData, fileIndex, "FPS", 1, "max");
            const minFPS = calculateByKeyword(allCsvData, fileIndex, "FPS", 1, "min");
            const avgFPS = calculateByKeyword(allCsvData, fileIndex, "FPS", 1, "avg");
            const varFPS = calculateByKeyword(allCsvData, fileIndex, "FPS", 1, "var");
            const aboFPS = calculateByKeyword(allCsvData, fileIndex, "FPS", 1, "abo45");
            const lowFPS = calculateByKeyword(allCsvData, fileIndex, "FPS", 1, "low5");
            const maxTemp = calculateByKeyword(allCsvData, fileIndex, "Battery(℃)", 1, "max");
            const avgPowerMW = calculateByKeyword(allCsvData, fileIndex, "Power(mW)", 2, "avg")
            const avgPowerW = mWToW(avgPowerMW, 2);
            const csvPage = recordInfoCard(
                csvFile.slice(0, -4),
                csvListSlice[fileIndex][0],
                platformResult.stdout.toUpperCase(),
                modelResult.stdout,
                osResult.stdout,
                csvListSlice[fileIndex][1],
                csvListSlice[fileIndex][2],
                maxFPS,
                minFPS,
                avgFPS,
                varFPS,
                aboFPS,
                lowFPS,
                maxTemp,
                avgPowerW,
            );
            exec(`printf '%s' '${csvPage}' > "${pageDir}/${csvFile.slice(0, -4)}.html"`);
            fileIndex += 1;
        };
    } catch (error) {
        console.error("Catch error: ", error);
    };
};

async function getCsvFiles(csvDir) {
    try {
        const { stdout } = await exec("ls -1", { cwd: csvDir });
        const files = stdout.split(/\r?\n/).filter(Boolean);
        return files.filter(file => file.toLowerCase().endsWith(".csv"));
    } catch (error) {
        console.error("Read csv dir failed: ", error);
        return [];
    };
};

function calculateByKeyword(database, dataIndex, keyword, accurate, mode) {
    const data = database[dataIndex];
    const header = data.header;
    const rows = data.rows;
    const keywordIndex = header.indexOf(keyword);
    let lineNum = 0;
    let valueSum = 0;
    let aboveCount = 0;
    let valueArray = [];
    let maxNum, minNum, avgValue, varValue, lowValue;
    let abo45Percent, percent5Conut;
    for (const row of rows) {
        if (lineNum === 0) {
            maxNum = minNum = parseFloat(row[keywordIndex]);
        } else {
            if (parseFloat(row[keywordIndex]) > maxNum) {
                maxNum = parseFloat(row[keywordIndex]);
            };
            if (parseFloat(row[keywordIndex]) < minNum) {
                minNum = parseFloat(row[keywordIndex]);
            };
        };
        lineNum += 1;
        valueSum += parseFloat(row[keywordIndex]);
        if (parseFloat(row[keywordIndex]) >= 45) {
            aboveCount += 1;
        };
        valueArray.push(parseFloat(row[keywordIndex]));
    };
    avgValue = valueSum / lineNum;
    abo45Percent = (aboveCount / lineNum) * 100;
    if (mode == "low5") {
        valueSum = 0;
        valueArray.sort((a, b) => a - b);
        percent5Conut = Math.round(lineNum * 0.05);
        const sliceArray = valueArray.slice(0, percent5Conut);
        for (let value of sliceArray) {
            valueSum += value;
        };
        lowValue = valueSum / percent5Conut;
    };
    if (mode == "var") {
        lineNum = 0;
        valueSum = 0;
        for (const row of rows) {
            lineNum += 1;
            valueSum += (parseFloat(row[keywordIndex]) - avgValue) ** 2;
        };
        varValue = valueSum / lineNum;
    };
    switch (mode) {
        case "max": return maxNum.toFixed(accurate);
        case "min": return minNum.toFixed(accurate);
        case "avg": return avgValue.toFixed(accurate);
        case "var": return varValue.toFixed(accurate);
        case "abo45": return abo45Percent.toFixed(accurate);
        case "low5": return lowValue.toFixed(accurate);
    };
};

function secondToTime(second) {
    const timeMinute = Math.floor(second / 60);
    const timeSecond = second % 60;    
    let time;    
    if (timeMinute === 0) {
        time = `${timeSecond}s`;
    } else if (timeSecond === 0) {
        time = `${timeMinute}m`;
    } else {
        time = `${timeMinute}m${timeSecond}s`;
    };
    return time;
};

function mWToW(mW, accurate) {
    return (Math.round(mW * 0.001 * 10 ** accurate) * 0.1 ** accurate).toFixed(accurate);
};

main().catch(error => {
    console.error("Start failed: ", error);
});

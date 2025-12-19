function recordCard(appName, date, avgFPS, avgPower, time, url) {
    return `
<div class="record-card">
    <div class="header-icon delete-action">
        <svg t="1763030250410" class="icon" viewBox="0 0 1024 1024" version="1.1"
            xmlns="http://www.w3.org/2000/svg" p-id="1270" width="30" height="30">
            <path
                d="M828.9 317.1H195.1c-12.9 0-22.9 11.4-21.1 24.2l73 522.3c5.2 42.8 41.6 75.1 84.7 75.1h360.8c43.2 0 79.5-32.2 84.7-75.1l73-522.3c1.6-12.8-8.4-24.2-21.3-24.2zM722 856.9c-1.8 15-14.6 26.3-29.6 26.3H331.6c-15.1 0-27.8-11.3-29.8-27.3l-67.5-483.3h555.4L722 856.9z"
                p-id="1271" fill="#000000bb"></path>
            <path
                d="M398.9 478.6h55.5v298.7h-55.5zM569.6 478.6h55.5v298.7h-55.5zM701 193.2l-30.1-71c-7.6-17.9-25.4-29.5-45.3-29.5H398.4c-19.9 0-37.7 11.6-45.3 29.5l-30.1 71H128v55.5h768v-55.5H701z m-298.6-45.1h219.3l19.1 45.1H383.2l19.2-45.1z"
                p-id="1272" fill="#000000bb"></path>
        </svg>
    </div>
    <a href="page/${url}.html" class="record-info-card-link">
        <div class="record-info-card">
            <div class="up-package-name">${appName}</div>
            <div class="down-record-infos">
                <div class="left-info">
                    <div class="date">${date}</div>
                    <div class="avg-fps-power">
                        ${avgFPS}
                        ${avgPower}
                    </div>
                </div>
                <div class="time">${time}</div>
            </div>
        </div>
    </a>
</div>`;
};

function recordInfoCard(fileName, appName, platform, model, os, date, time, maxFPS, minFPS, avgFPS, varFPS, abo45FPS, low5PercentFPS, maxTemp, avgPower) {
    return `
<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName}</title>
    <link rel="stylesheet" href="../css/page.css">
</head>

<body>
    <div id="app">
        <div class="container">
            <div class="status-bar"></div>
            <div class="header">
                <div class="title">
                    <span class="title-txt">
                        ${appName}
                    </span>
                </div>
                <div class="header-icon-list">
                    <a href="../index.html" class="header-icon-link">
                        <div class="header-icon">
                            <svg t="1763974367454" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="2944" width="24" height="24">
                                <path
                                    d="M662.645636 47.07909c8.791318 0 17.582636 3.353697 24.289577 10.060638 13.414334 13.414334 13.414334 35.163917 0 48.578251l-387.909843 387.910294 388.66123 388.661229c13.414334 13.414334 13.414334 35.163465 0 48.5778-13.414786 13.414334-35.163917 13.414334-48.578251 0l-412.950355-412.950355c-13.414786-13.414334-13.414786-35.163917 0-48.578251l412.198968-412.198968c6.706941-6.706941 15.498259-10.060638 24.288674-10.060638z"
                                    p-id="2945" fill="#000000bb"></path>
                            </svg>
                        </div>
                    </a>
                </div>
            </div>
            <div class="device-info-card">
                <div class="device-info">
                    <div class="info-key">
                        Platform
                    </div>
                    <div class="info-icon">
                        <svg t="1763026803619" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="1859" width="40" height="40">
                            <path
                                d="M640 0a42.6624 42.6624 0 0 1 42.6624 42.6624V128H768c70.6944 0 128 57.3056 128 128v85.3248h85.3376a42.6624 42.6624 0 0 1 42.5984 40.3328L1024 384a42.6624 42.6624 0 0 1-42.6624 42.6624H896v128h85.3376a42.6624 42.6624 0 0 1 42.5984 40.32l0.064 2.3552A42.6624 42.6624 0 0 1 981.3376 640H896v128c0 70.6944-57.3056 128-128 128h-85.3376v85.3376a42.6624 42.6624 0 0 1-40.32 42.5984L640 1024a42.6624 42.6624 0 0 1-42.6624-42.6624L597.3248 896H426.6624v85.3376a42.6624 42.6624 0 0 1-40.32 42.5984L384 1024a42.6624 42.6624 0 0 1-42.6624-42.6624L341.3248 896H256c-70.6944 0-128-57.3056-128-128V640H42.6624a42.6624 42.6624 0 0 1-42.5984-40.32L0 597.3376a42.6624 42.6624 0 0 1 42.6624-42.6752H128v-128H42.6624a42.6624 42.6624 0 0 1-42.5984-40.32L0 384a42.6624 42.6624 0 0 1 42.6624-42.6624L128 341.3248V256c0-70.6944 57.3056-128 128-128h85.3248V42.6624A42.6624 42.6624 0 0 1 381.6704 0.064L384 0a42.6624 42.6624 0 0 1 42.6624 42.6624V128h170.6624V42.6624A42.6624 42.6624 0 0 1 637.6704 0.064L640 0z m128 213.3376H256A42.6624 42.6624 0 0 0 213.3376 256v512A42.6624 42.6624 0 0 0 256 810.6624h512A42.6624 42.6624 0 0 0 810.6624 768V256A42.6624 42.6624 0 0 0 768 213.3376z m-128 128A42.6624 42.6624 0 0 1 682.6624 384v256A42.6624 42.6624 0 0 1 640 682.6624H384A42.6624 42.6624 0 0 1 341.3376 640V384A42.6624 42.6624 0 0 1 384 341.3376h256z m-42.6624 85.3248H426.6624v170.6752h170.6752V426.6624z"
                                fill="#000000bb" p-id="1860"></path>
                        </svg>
                    </div>
                    <div id="platform-value" class="info-value">
                        ${platform}
                    </div>
                </div>
                <div class="device-info">
                    <div class="info-key">
                        Model
                    </div>
                    <div class="info-icon">
                        <svg t="1763027259508" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="4274" width="40" height="40">
                            <path
                                d="M725.333333 981.333333H298.666667c-72.533333 0-128-55.466667-128-128V170.666667c0-72.533333 55.466667-128 128-128h426.666666c72.533333 0 128 55.466667 128 128v682.666666c0 72.533333-55.466667 128-128 128zM298.666667 128c-25.6 0-42.666667 17.066667-42.666667 42.666667v682.666666c0 25.6 17.066667 42.666667 42.666667 42.666667h426.666666c25.6 0 42.666667-17.066667 42.666667-42.666667V170.666667c0-25.6-17.066667-42.666667-42.666667-42.666667H298.666667z"
                                fill="#000000bb" p-id="4275"></path>
                            <path
                                d="M512 810.666667c-25.6 0-42.666667-17.066667-42.666667-42.666667s17.066667-42.666667 42.666667-42.666667 42.666667 17.066667 42.666667 42.666667-17.066667 42.666667-42.666667 42.666667z"
                                fill="#000000bb" p-id="4276"></path>
                        </svg>
                    </div>
                    <div id="model-value" class="info-value">
                        ${model}
                    </div>
                </div>
                <div class="device-info">
                    <div class="info-key">
                        OS
                    </div>
                    <div class="info-icon">
                        <svg t="1763028829963" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="30675" width="40" height="40">
                            <path
                                d="M827.505778 647.054222c0 177.152-141.994667 320.056889-317.838222 320.056889-175.843556 0-317.838222-142.904889-317.838223-320.056889V583.111111h635.676445v64zM679.139556 327.111111a42.666667 42.666667 0 0 0 0 85.333333 42.666667 42.666667 0 1 0 0-85.333333z m-338.944 0a42.666667 42.666667 0 1 0 0 85.333333 42.666667 42.666667 0 0 0 0-85.333333z m495.786666-138.695111l-63.544889 64.056889c36.010667 51.2 55.068444 113.038222 55.068445 181.304889v64.056889H191.829333V433.777778c0-66.161778 21.219556-130.104889 55.068445-181.304889L183.352889 188.416a44.088889 44.088889 0 0 1 0-61.838222 43.349333 43.349333 0 0 1 61.44 0l61.44 61.838222A314.368 314.368 0 0 1 509.724444 113.777778c78.392889 0 148.309333 27.761778 203.434667 74.638222l61.44-61.838222a43.406222 43.406222 0 0 1 61.44 0 44.088889 44.088889 0 0 1 0 61.838222z"
                                fill="#000000bb" p-id="30676"></path>
                        </svg>
                    </div>
                    <div id="os-value" class="info-value">
                        Android${os}
                    </div>
                </div>
            </div>
            <div class="record-card">
                <div class="record-info-card">
                    <div class="up-record-infos">${date} ${time}</div>
                    <div class="down-record-infos">
                        <div class="max-fps">
                            MAX
                            <p>${maxFPS}</p>
                            FPS
                        </div>
                        <div class="min-fps">
                            MIN
                            <p>${minFPS}</p>
                            FPS
                        </div>
                        <div class="avg-fps">
                            AVG
                            <p>${avgFPS}</p>
                            FPS
                        </div>
                        <div>
                            VARIANCE
                            <p>${varFPS}</p>
                            FPS
                        </div>
                        <div class="above-45-FPS">
                            ≥45FPS
                            <p>${abo45FPS}%</p>
                            Smoothness
                        </div>
                        <div class="low-5%-FPS">
                            %5 Low
                            <p>${low5PercentFPS}</p>
                            FPS
                        </div>
                        <div class="max-temp">
                            MAX
                            <p>${maxTemp}</p>
                            Temperature
                        </div>
                        <div class="avg-power">
                            AVG
                            <p>${avgPower}</p>
                            Power(W)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script type="importmap">{"imports":{"kernelsu":"https://cdn.jsdelivr.net/npm/kernelsu/+esm"}}</script>
    <script type="module" src="../js/load.js"></script>
</body>

</html>`;
};

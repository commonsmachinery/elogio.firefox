(function() {
    'use strict';
    var buttons = require('sdk/ui/button/action');
    var pageMod = require("sdk/page-mod");
    var data = require('sdk/self').data;
    var tabs = require('sdk/tabs');
    var activeTab=tabs.activateTab;
    var limitPixels = 100;
    var sidebarWorker = null;
    var imageStorage = {};
    var workersObject = {};
    var wheelUrl = data.url('overlay.png');
    var isExtensionEnabled = false;
    var sidebar = require("sdk/ui/sidebar").Sidebar({
        id: 'elogio-firefox-plugin',
        title: 'Elog.io Image Catalog',
        url: require("sdk/self").data.url("panel.html"),
        onAttach: function (worker) {
            sidebarWorker = worker;
            isExtensionEnabled = true;
            sidebarWorker.port.on("panelLoaded", function () {
                if (isExtensionEnabled) {
                    sidebarWorker.port.emit('drawItems', imageStorage[activeTab.id]);
                } else {
                    sidebarWorker.port.emit('drawItems', []);
                }
            });
            sidebarWorker.port.on('addonSwitchOn', function () {
                var workersArray = workersObject[activeTab.id];
                for (var i = 0; i < workersArray.length; i++) {
                    workersArray[i].port.emit('extensionSwitchOn');
                }
                isExtensionEnabled = true;
            });
            sidebarWorker.port.on('addonSwitchOff', function () {
                var workersArray = workersObject[activeTab.id];
                for (var i = 0; i < workersArray.length; i++) {
                    workersArray[i].port.emit('extensionSwitchOff');
                }
                isExtensionEnabled = false;
            });
            sidebarWorker.port.on('getImageFromContent', function (inputId) {
                var workersOfTab = workersObject[activeTab.id];
                for (var i = 0; i < workersOfTab.length; i++) {
                    console.log(inputId);
                    workersOfTab[i].port.emit('scrollToImageById', inputId);
                }
            });
        }
    });
    buttons.ActionButton({
        id: "elogio-button",
        label: "Get images",
        icon: {
            "16": "./icon-16.png",
            "32": "./icon-32.png",
            "64": "./icon-64.png"
        },
        onClick: function () {
            sidebar.show();
        }
    });

    function detachWorker(worker, workerArray) {
        var index = workerArray.indexOf(worker);
        if (index !== -1) {
            workerArray.splice(index, 1);
        }
    }

    pageMod.PageMod({
        include: "*",
        contentScriptFile: [data.url("content-script.js")],
        attachTo: 'top',
        onAttach: function (worker) {
            var tabId = worker.tab.id;
            if (!workersObject[tabId]) {
                workersObject[tabId] = [];
            }
            activeTab = worker.tab;
            workersObject[tabId].push(worker);
            worker.on('detach', detachWorker.bind(null, worker, workersObject[worker.tab.id]));
            function imagesReceived(imagesFromPage) {
                if (imagesFromPage) {
                    if (!imageStorage[tabId]) {
                        imageStorage[tabId] = [];
                    }
                    for (var i = 0; i < imagesFromPage.length; i++) {
                        imageStorage[tabId].push(imagesFromPage[i]);
                    }
                    if (sidebarWorker && tabId === activeTab.id) {
                        sidebarWorker.port.emit('drawItems', imageStorage[tabId]);
                    }
                }
            }

            function getThePicture(uniqueId) {

                if (!sidebar.isShowing) {
                    sidebar.show();
                }
                if (sidebarWorker) {
                    console.log(uniqueId);
                    sidebarWorker.port.emit('showPictureById', uniqueId);
                }
            }

            function onBeforeUnloadTopPage(tabId) {
                imageStorage[tabId] = null;
                if (tabId === activeTab.id) {
                    sidebarWorker.port.emit("drawItems", null);
                }
            }

            if (isExtensionEnabled) {
                worker.port.on("gotElement", imagesReceived.bind(worker));
                worker.port.on("onBeforeUnload", onBeforeUnloadTopPage.bind(null, tabId));
                worker.port.on("getPicture", getThePicture.bind(worker));
                worker.port.emit("getElement", limitPixels, wheelUrl);
            }
        }
    });
    tabs.on('activate', function (tab) {
        activeTab = tab;
        if (sidebarWorker) {
            if (isExtensionEnabled) {
                sidebarWorker.port.emit('drawItems', imageStorage[activeTab.id]);
            }
        }
    });

    tabs.on('open', function (tab) {
        imageStorage[tab.id] = null;
    });

//if tab was closed the we need to remove all workers of this tab
    tabs.on('close', function (tab) {
        if (workersObject[tab.id]) {
            workersObject[tab.id] = null;
        }
        if (imageStorage[tab.id]) {
            imageStorage[tab.id] = null;
        }
    });
})();
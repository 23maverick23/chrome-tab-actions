/**
 * Create a context menu for managing tabs.
 */

// Begin container menu
var container = chrome.contextMenus.create({
    "title"      : "Chrome Tab Actions",
    "id"         : "container"
});
// Begin sub-menu items
var closeTabsLeft = chrome.contextMenus.create({
    "title"      : "Close tabs to the left",
    "id"         : "closeTabsLeft",
    "parentId"   : container,
});
var closeTabsRight = chrome.contextMenus.create({
    "title"      : "Close tabs to the right",
    "id"         : "closeTabsRight",
    "parentId"   : container,
});
// Separator
var separatorOne = chrome.contextMenus.create({
    "type"       : "separator",
    "id"         : "separatorOne",
    "parentId"   : container
});
var closeTabsOther = chrome.contextMenus.create({
    "title"      : "Close other tabs",
    "id"         : "closeTabsOther",
    "parentId"   : container,
});
// Separator
var separatorTwo = chrome.contextMenus.create({
    "type"       : "separator",
    "id"         : "separatorTwo",
    "parentId"   : container
});
var closeTabsSimilar = chrome.contextMenus.create({
    "title"      : "Close similar tabs",
    "id"         : "closeTabsSimilar",
    "parentId"   : container,
});
// Separator
var separatorThree = chrome.contextMenus.create({
    "type"       : "separator",
    "id"         : "separatorThree",
    "parentId"   : container
});
var closeTabsUndo = chrome.contextMenus.create({
    "title"      : "Undo closed tabs",
    "id"         : "closeTabsUndo",
    "parentId"   : container,
});
// End sub-menu items
// End container menu


/**
 * Log context menu information
 * @param  {object}   info Information about the page where the context menu was clicked.
 * @param  {object}   tab  Information about the tab where the context menu was clicked.
 * @return {string}        None.
 */
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    var tabIdsArray = [],
        tabsArray = [];

    /**
     * Build an array of tab information.
     * @param  {object} tab Tab object.
     * @return {none}
     */
    function buildTabArrays(tab) {
        tabIdsArray.push(tab.id);
        tabsArray.push({"windowId": tab.windowId, "index": tab.index, "url": tab.url});
    }

    /**
     * Save tab information in local Chrome storage.
     * @param  {array} tabsArray Array of tab information.
     * @return {none}
     */
    function saveClosedTabs(tabsArray) {
        chrome.storage.local.set({
            "arrayOfClosedTabs": tabsArray
        });
    }

    switch (info.menuItemId) {
        case "closeTabsLeft":
            chrome.tabs.query({currentWindow: true}, function(queryTabs) {
                queryTabs.slice(0, tab.index).forEach(function(t) {
                    buildTabArrays(t);
                });
                saveClosedTabs(tabsArray);
                chrome.tabs.remove(tabIdsArray);
            });
            break;
        

        case "closeTabsRight":
            chrome.tabs.query({currentWindow: true}, function(queryTabs) {
                queryTabs.slice(tab.index+1, queryTabs.length).forEach(function(t) {
                    buildTabArrays(t);
                });
                saveClosedTabs(tabsArray);
                chrome.tabs.remove(tabIdsArray);
            });
            break;
        
        case "closeTabsOther":
            chrome.tabs.query({currentWindow: true}, function(queryTabs) {
                queryTabs.splice(tab.index, 1);
                queryTabs.forEach(function(t) {
                    buildTabArrays(t);
                });
                saveClosedTabs(tabsArray);
                chrome.tabs.remove(tabIdsArray);
            });
            break;
        
        case "closeTabsSimilar":
            var re = /(^http(s)?\:\/\/[A-Za-z0-9-\.]+(\.[A-Za-z0-9-]+)*?(\:[0-9]+)?(\/)?)/i;
            var m = re.exec(tab.url);
            var baseurl = m[0] + "*";

            chrome.tabs.query({currentWindow: true, url: baseurl}, function(queryTabs) {
                queryTabs.forEach(function(t, i) {
                    if (t.id !== tab.id) {
                        buildTabArrays(t);
                    }
                });

                saveClosedTabs(tabsArray);
                chrome.tabs.remove(tabIdsArray);
            });
            break;
        
        case "closeTabsUndo":
            chrome.storage.local.get("arrayOfClosedTabs", function(result) {
                if (result.hasOwnProperty("arrayOfClosedTabs")) {
                    result.arrayOfClosedTabs.forEach(function(t) {
                        t.active = false;
                        chrome.tabs.create(t);
                    });
                }
            });
            break;
        
        default:
            return false;
    }
});
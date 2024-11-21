let activeTabId = null;
let startTime = null;
let activeTabUrl = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (activeTabId !== null) {
    calculateTimeSpent();
  }
  activeTabId = activeInfo.tabId;
  startTime = new Date();
  chrome.tabs.get(activeTabId, (tab) => {
    activeTabUrl = new URL(tab.url).hostname;
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tabId === activeTabId) {
    calculateTimeSpent();
    startTime = new Date();
    activeTabUrl = new URL(tab.url).hostname;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) {
    calculateTimeSpent();
    activeTabId = null;
    startTime = null;
    activeTabUrl = null;
  }
});

function calculateTimeSpent() {
  if (startTime && activeTabUrl) {
    const timeSpent = (new Date() - startTime) / 60000; // Time spent in minutes
    console.log(
      `Time spent on ${activeTabUrl}: ${timeSpent.toFixed(2)} minutes`
    );

    chrome.storage.local.get(["timeSpentPerSite"], function (result) {
      const timeSpentPerSite = result.timeSpentPerSite || {};
      timeSpentPerSite[activeTabUrl] =
        (timeSpentPerSite[activeTabUrl] || 0) + timeSpent;
      chrome.storage.local.set({ timeSpentPerSite }, function () {
        console.log(
          `Total time spent on ${activeTabUrl} updated to: ${timeSpentPerSite[
            activeTabUrl
          ].toFixed(2)} minutes`
        );
      });
    });
  }
}

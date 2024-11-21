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
    if (tab.url) {
      try {
        activeTabUrl = new URL(tab.url).hostname;
      } catch (error) {
        console.error("Invalid URL: ", tab.url);
        activeTabUrl = null;
      }
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tabId === activeTabId) {
    calculateTimeSpent();
    startTime = new Date();
    if (tab.url) {
      try {
        activeTabUrl = new URL(tab.url).hostname;
      } catch (error) {
        console.error("Invalid URL: ", tab.url);
        activeTabUrl = null;
      }
    }
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
    if (timeSpent >= 5) {
      // Only log if time spent is greater than or equal to 5 minutes
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
}

let activeTabId = null;
let startTime = null;
let activeTabUrl = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("Tab activated", activeInfo);
  if (activeTabId !== null) {
    calculateTimeSpent();
  }
  activeTabId = activeInfo.tabId;
  startTime = new Date();
  chrome.tabs.get(activeTabId, (tab) => {
    if (tab.url) {
      try {
        activeTabUrl = new URL(tab.url).hostname;
        console.log("Active tab URL:", activeTabUrl);
      } catch (error) {
        console.error("Invalid URL: ", tab.url);
        activeTabUrl = null;
      }
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tabId === activeTabId) {
    console.log("Tab updated", tabId, changeInfo, tab);
    calculateTimeSpent();
    startTime = new Date();
    if (tab.url) {
      try {
        activeTabUrl = new URL(tab.url).hostname;
        console.log("Updated tab URL:", activeTabUrl);
      } catch (error) {
        console.error("Invalid URL: ", tab.url);
        activeTabUrl = null;
      }
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  console.log("Tab removed", tabId);
  if (tabId === activeTabId) {
    calculateTimeSpent();
    activeTabId = null;
    startTime = null;
    activeTabUrl = null;
  }
});

function calculateTimeSpent() {
  console.log("Calculating time spent");
  if (startTime && activeTabUrl) {
    const timeSpent = (new Date() - startTime) / 60000; // Time spent in minutes
    console.log("Time spent:", timeSpent);
    if (timeSpent >= 0.5) {
      // Only log if time spent is greater than or equal to 0.5 minutes (30 seconds)
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

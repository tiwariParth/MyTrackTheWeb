import { useEffect, useState } from "react";

const Popup = () => {
  const [timeSpentPerSite, setTimeSpentPerSite] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["timeSpentPerSite"], function (result) {
        console.log(
          "Retrieved timeSpentPerSite from storage:",
          result.timeSpentPerSite
        );
        setTimeSpentPerSite(result.timeSpentPerSite || {});
      });

      chrome.storage.onChanged.addListener(function (changes, areaName) {
        if (areaName === "local" && changes.timeSpentPerSite) {
          console.log("Storage onChanged event:", changes.timeSpentPerSite);
          setTimeSpentPerSite(changes.timeSpentPerSite.newValue || {});
        }
      });
    }
  }, []);

  const handleReset = () => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.clear(() => {
        setTimeSpentPerSite({});
        console.log("Time spent data has been reset.");
      });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">TrackMyWeb</h1>
      <button
        onClick={handleReset}
        className="bg-red-500 text-white px-4 py-2 mt-4"
      >
        Reset Time Spent
      </button>
      <div id="time-spent" className="mt-4">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Website</th>
              <th className="px-4 py-2">Time Spent (minutes)</th>
            </tr>
          </thead>
          <tbody id="time-spent-table-body">
            {Object.entries(timeSpentPerSite).map(([site, timeSpent]) => (
              <tr key={site}>
                <td className="border px-4 py-2">{site}</td>
                <td className="border px-4 py-2">{timeSpent.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Popup;

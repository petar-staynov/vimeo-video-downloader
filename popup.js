backLog = object => {
  chrome.extension.getBackgroundPage().console.log(object);
};
start = () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
    url = tabs[0].url;
    getDownloadLinks(url);
  });
};

getDownloadLinks = url => {
  let downloadOptionsDiv = document.getElementById("download-options");
  if(!url.includes("vimeo")){
    let htmlElementString = `<p>Can't get video URL. Make sure you're on Vimeo</p>`;
        downloadOptionsDiv.insertAdjacentHTML("beforeend", htmlElementString);
        return;
  }
  let videoId = url.substring(url.lastIndexOf("/") + 1, url.length);
  backLog(videoId);

  fetch(`http://player.vimeo.com/video/${videoId}/config`, { method: "GET" })
    .then(response => response.json())
    .then(response => {
      backLog(response);
      

      if (response.message) {
        let htmlElementString = `<p>Download unavailable. Video is either private or contains adult content.</p>`;
        downloadOptionsDiv.insertAdjacentHTML("beforeend", htmlElementString);
        return;
      }

      let videoTitle = response["video"]["title"];
      let availableFormats = response["request"]["files"]["progressive"];


      for (let format of availableFormats) {
        let videoUrl = format["url"];
        let videoResolution = `Resolution - ${format["width"]}p`;

        //Retry getting video urls from a different CDN since this one is blocked.
        if (videoUrl.includes("gcs-vimeo.akamaized.net")) {
          backLog("Retrying");
          testClick();
          return;
        }

        let htmlElementString = `<a download href="${videoUrl}" target="_blank">${videoResolution}</a><br>`;
        downloadOptionsDiv.insertAdjacentHTML("beforeend", htmlElementString);
      }
    });
};

document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById("getFormats").addEventListener("click", start);
});

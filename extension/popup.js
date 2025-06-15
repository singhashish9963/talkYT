const root = document.getElementById("root");

root.innerHTML = `
  <h3>🎬 YouTube AI Chat</h3>
  <input type="text" id="question" placeholder="Ask about this video..." style="width: 100%; padding: 5px;" />
  <button id="askBtn" style="margin-top: 8px;">Ask now</button>
  <pre id="response" style="margin-top: 10px; white-space: pre-wrap;"></pre>
`;

document.getElementById("askBtn").addEventListener("click", () => {
  const responseElem = document.getElementById("response");
  // Simple loading animation
  let dots = 0;
  responseElem.innerText = "Loading";
  const loadingInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    responseElem.innerText = "Loading" + ".".repeat(dots);
  }, 500);
  const copyBtn = document.getElementById("copyBtn");
    copyBtn.style.display = "none";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getVideoId" }, (response) => {
      const videoId = response?.videoId;
      const question = document.getElementById("question").value;

      fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId, question }),
      })
        .then((res) => res.json())
        .then((data) => {
          clearInterval(loadingInterval);
          responseElem.innerText = data.answer || "No answer found.";
           copyBtn.style.display = "inline-block"; // Show copy button after loading
        })
        .catch((err) => {
          clearInterval(loadingInterval);
          responseElem.innerText = "Error: " + err.message;
           copyBtn.style.display = "none";
        });
    });
  });
});

document.getElementById("copyBtn").addEventListener("click", () => {
  const responseElem = document.getElementById("response");
  navigator.clipboard.writeText(responseElem.innerText)
    .then(() => {
      // Optional: Provide visual feedback that the text has been copied
      copyBtn.innerText = "Copied!";
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
});
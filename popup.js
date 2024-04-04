let list = document.getElementById("emailList");
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let emailBodies = request.emailBodies;
  if (emailBodies == null || emailBodies.length == 0) {
    let li = document.createElement("li");
    li.innerHTML = "No email found";
    list.appendChild(li);
  } else {
    emailBodies.forEach((email) => {
      let li = document.createElement("li");
      li.innerHTML = email;
      list.appendChild(li);
    });
  }
});
async function scrapeEmailsBody() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: scrapeEmailsFromPage,
  });
}
function scrapeEmailsFromPage() {
  let emailBodies = [];
  // let emailBodyElements = document.querySelectorAll("div.adn.ads div.ii.gt");
  let emailBodyElements = document.querySelectorAll("div.adn.ads");

  emailBodyElements.forEach((emailBodyElement) => {
    let emailBody = emailBodyElement.innerText;
    emailBodies.push(emailBody);
  });

  chrome.runtime.sendMessage({ emailBodies });
}
scrapeEmailsBody();

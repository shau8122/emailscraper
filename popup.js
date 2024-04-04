// Function to handle message from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check if the message contains email details
  let emailBody = request.emailBody;
  let emailPopupContent = request.emailPopupContent;
  let emailDetailsExtracted = extractEmailInfo(emailPopupContent);

  if (emailBody) {
    document.getElementById("body").textContent = emailBody || "";
  }
  if (emailDetailsExtracted) {
    // Update email details
    // // Update DOM elements with email details
    document.getElementById("subject").textContent =
      emailDetailsExtracted.subject || "";
    document.getElementById("senderName").textContent =
      emailDetailsExtracted.senderName || "";
    document.getElementById("senderEmail").textContent =
      emailDetailsExtracted.senderEmail || "";
    document.getElementById("recipients").textContent =
      emailDetailsExtracted.emailAddresses
        ? emailDetailsExtracted.emailAddresses.join(", ")
        : "";
    document.getElementById("datetime").textContent =
      emailDetailsExtracted.dateTime || "";
  }
});

// Function to scrape email details
async function scrapeEmailDetails() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: extractEmailDetails,
  });
}
function extractEmailDetails() {
  // Extract sender and sender email from body
  let emailBodyElement = document.querySelector("div.adn.ads div.ii.gt");

  let element = document.querySelector(".ajz");
  if (element) {
    // Trigger a click event on the element
    element.click();
  }
  let emailPopUp = document.querySelector("div.adn.ads div.ajA.SK");
  if (element) {
    // Trigger a click event on the element
    element.click();
  }
  emailBody = emailBodyElement.innerText;
  emailPopupContent = emailPopUp.innerText;

  // Send extracted details to the extension

  chrome.runtime.sendMessage({ emailBody, emailPopupContent });
}
function extractEmailInfo(emailString) {
  // Extract sender name and email
  var senderMatch = emailString.match(
    /from:\s*([^<]+)\s*<([^>]+)>|from:\s*([^@\s]+@[^\s>]+)/i
  );

  var senderName = "";
  var senderEmail = "";

  if (senderMatch) {
    if (senderMatch[1] !== undefined && senderMatch[2] !== undefined) {
      senderName = senderMatch[1].trim();
      senderEmail = senderMatch[2].trim();
    } else if (senderMatch[3] !== undefined) {
      senderEmail = senderMatch[3].trim();
    }
  }

  // Extract recipients
  var recipientMatches = emailString.match(
    /to:\s*([^<]+)\s*(?:<([^>]+)>|,|$)/gi
  );

  var emailAddresses = [];

  if (recipientMatches) {
    recipientMatches.forEach(function (match) {
      var emailsInMatch = match.match(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
      );
      if (emailsInMatch) {
        emailsInMatch.forEach(function (email) {
          emailAddresses.push(email);
        });
      }
    });
  }

  alert(emailAddresses);

  // Extract datetime
  var dateTimeMatch = emailString.match(/date:\s*([^]+?)(?=\s*subject:|$)/i);
  var dateTime = dateTimeMatch ? dateTimeMatch[1].trim() : "";

  // Extract subject
  var subjectMatch = emailString.match(
    /subject:\s*([^]+?)(?=\s*mailed-by:|$)/i
  );
  var subject = subjectMatch ? subjectMatch[1].trim() : "";

  return {
    senderName,
    senderEmail,
    emailAddresses,
    dateTime,
    subject,
  };
}

function extractNameAndEmail(emailDetails) {
  // Regular expression to match name and email separately
  const regex = /^([^<]+) <([^>]+)>$/;
  const match = emailDetails.match(regex);

  if (match) {
    const senderName = match[1].trim(); // Extracted name
    const senderEmail = match[2]; // Extracted email
    return { senderName, senderEmail };
  } else {
    // If the string doesn't match the expected format
    console.error("Invalid email details format");
    return { senderName: null, senderEmail: null };
  }
}

// Trigger email details extraction when the extension is invoked
scrapeEmailDetails();

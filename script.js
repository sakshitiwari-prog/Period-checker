let periods;
const installButton = document.getElementById("installButton");
const pastPeriodHeader = document.createElement("h2");
pastPeriodHeader.textContent = "Past periods";
let url = "http://192.168.43.87:5000/api/uploadData";
const pastPeriodList = document.createElement("ul");
const newPeriodFormEl = document.getElementsByTagName("form")[0];
const pastPeriodContainer = document.getElementById("past-periods");
const STORAGE_KEY = "period-tracker";
const startDateInputEl = document.getElementById("start-date");
const endDateInputEl = document.getElementById("end-date");
let deferredPrompt;

const postRequest = async (url, data) => {
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};
function checkInternetConnection(sDate, eDate) {
  let dateObject;
  let userId;
  let parseData;
  if (navigator.onLine) {
    if (sDate && eDate) {
      const data = window.localStorage.getItem(STORAGE_KEY);

      if (data) {
        let parseData = JSON.parse(data);
        userId = parseData.userId;
      } else {
        dateObject = new Date(sDate);
        userId = dateObject.getTime();
      }

      let sendData = {
        userId,
        sDate,
        eDate,
      };
      postRequest(url, sendData)
        .then((data) => {
          console.log("Data received:", data);
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data.UserExist)
          );
          renderPastPeriods(data.UserExist.dateList);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      console.log("hy");
      const data = window.localStorage.getItem(STORAGE_KEY);

      if (data) {
        console.log(data, "0");
        parseData = JSON.parse(data);
        renderPastPeriods(parseData.dateList);
        postRequest(url, JSON.parse(data))
          .then((data) => {
            console.log("Data received:-", data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }
  } else {
    const data = window.localStorage.getItem(STORAGE_KEY);
    console.log(data, "data inside else");
    parseData = JSON.parse(data);
    if (parseData && parseData.userId != null) {
      let parseData = JSON.parse(data);
      if (parseData) {
        if (sDate && eDate) {
          parseData.dateList.push({ sDate, eDate });
          parseData.dateList.sort((a, b) => {
            return new Date(b.sDate) - new Date(a.sDate);
          });
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parseData));
        }
        renderPastPeriods(parseData.dateList);
      }
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      console.log(sDate, "=", eDate);

      if (typeof sDate == "string") {
        dateObject = new Date(sDate);
        userId = dateObject.getTime();
        parseData = {
          userId: userId,
          dateList: [{ sDate: sDate, eDate: eDate }],
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parseData));
        renderPastPeriods(parseData.dateList);
      }
    }
  }
}
checkInternetConnection();
window.addEventListener("online", checkInternetConnection);
window.addEventListener("offline", checkInternetConnection);
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  document.getElementById("installButton").style.display = "block";
});

installButton.addEventListener("click", () => {
  //   console.log("click", deferredPrompt);
  if (deferredPrompt) {
    // console.log("deferredPrompt", deferredPrompt);
    //log
    // Show the installation prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        // Clear the deferredPrompt variable
        deferredPrompt = null;
        // Hide the install button
        installButton.style.display = "none";
      })
      .catch((error) => {
        console.error("Error while prompting to install:", error);
        // Clear the deferredPrompt variable
        deferredPrompt = null;
        // Hide the install button
        installButton.style.display = "none";
      });
  }
});
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then(
    (registration) => {
      console.log("Service worker registration successful:");
    },
    (error) => {
      console.error(`Service worker registration failed: ${error}`);
    }
  );
} else {
  console.error("Service workers are not supported.");
}

newPeriodFormEl.addEventListener("submit", (event) => {
  event.preventDefault();

  const sDate = startDateInputEl.value;
  const eDate = endDateInputEl.value;

  console.log(checkDatesInvalid(sDate, eDate), ":--=");
  if (checkDatesInvalid(sDate, eDate)) {
    return;
  }
  checkInternetConnection(sDate, eDate);
  newPeriodFormEl.reset();
});

function checkDatesInvalid(sDate, eDate) {
  console.log(!sDate, !eDate, sDate > eDate);
  if (!sDate || !eDate || sDate > eDate) {
    newPeriodFormEl.reset();
    return true;
  }
  return false;
}
function renderPastPeriods(dateList) {
  const pastPeriodHeader = document.createElement("h2");
  const pastPeriodList = document.createElement("ul");
  const periods = dateList;
  if (periods.length === 0) {
    return;
  }
  pastPeriodContainer.innerHTML = "";
  pastPeriodHeader.textContent = "Past periods";
  periods.forEach((period) => {
    console.log(period, "===");
    const periodEl = document.createElement("li");
    periodEl.textContent = `From ${formatDate(period.sDate)} to ${formatDate(
      period.eDate
    )}`;
    pastPeriodList.appendChild(periodEl);
  });

  pastPeriodContainer.appendChild(pastPeriodHeader);
  pastPeriodContainer.appendChild(pastPeriodList);
}
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { timeZone: "UTC" });
}

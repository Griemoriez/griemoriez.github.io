var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#fitness");

var listMoves = [];
var isOnline;

function openCreatePostModal() {
  createPostArea.style.display = "block";
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === "dismissed") {
        console.log("User cancelled installation");
      } else {
        console.log("User added to home screen");
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = "none";
}

function onSaveButtonClicked(event) {
  console.log("clicked");
  if ("caches" in window) {
    caches.open("user-requested").then(function (cache) {
      cache.add("https://httpbin.org/get");
      cache.add("/src/images/sf-boat.jpg");
    });
  }
}

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.innerHTML =
    '<div class="cards-item rounded-lg h-80 bg-orange-300 mx-4 border overflow-hidden mb-6 sm:w-72 md:w-96 lg:w-80 xl:w-80 2xl:w-96 transition hover:-translate-y-5 hover:duration-300"><div class="cards-image w-full h-3/4"><img class="rounded-t-md h-full w-full object-cover" src="' +
    data.image +
    '" alt="" /></div><p class="mx-5 my-5 font-bold text-xl">' +
    data.name +
    "</p></div>";
  cardWrapper.addEventListener("click", async function (event) {
    event.preventDefault();
    const test = `https://ambw-c3a79-default-rtdb.asia-southeast1.firebasedatabase.app/tes1/${data.id}.json`;

    const fetchDetail = async () => {
      const response = await fetch(test);
      if (!response.ok) throw new Error("Fetch error");
      return response.json();
    };

    const goToDetailPage = (detail) => {
      localStorage.setItem("i", JSON.stringify(detail));
      localStorage.setItem(data.id, JSON.stringify(detail));
      window.location.href = "detail.html";
    };

    const detailInLocal = localStorage.getItem(data.id);

    if (detailInLocal) {
      goToDetailPage(JSON.parse(detailInLocal));
    } else {
      try {
        const detail = await fetchDetail();
        goToDetailPage(detail);
      } catch (error) {
        window.location.href = "offline.html";
      }
    }
  });
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

var url =
  "https://ambw-c3a79-default-rtdb.asia-southeast1.firebasedatabase.app/tes1.json";
var networkDataReceived = false;

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log("From web", data);
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    listMoves = dataArray;
    updateUI(dataArray);
  });

if ("indexedDB" in window) {
  readAllData("posts").then(function (data) {
    if (!networkDataReceived) {
      console.log("From cache", data);
      updateUI(data);
    }
  });
}

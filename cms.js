/* ================= FIREBASE ================= */
const firebaseConfig = {
  apiKey: "AIzaSyCYJY8PoJSoH_xiyrRHATjj-43j0Q9CrRQ",
  authDomain: "bha-ai-admin.firebaseapp.com",
  projectId: "bha-ai-admin"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


/* ================= ROBOT UI ================= */

const robot = document.createElement("div");
robot.className = "robot-launcher";
robot.innerHTML =
  '<div class="robot-head">' +
    '<div class="robot-face">' +
      '<div>' +
        '<div class="robot-eyes">' +
          '<div class="eye"></div>' +
          '<div class="eye"></div>' +
        '</div>' +
        '<div class="robot-mouth"></div>' +
      '</div>' +
    '</div>' +
  '</div>' +
  '<div class="robot-body"></div>';

const container = document.createElement("div");
container.className = "robot-container";
container.appendChild(robot);
document.body.appendChild(container);


/* ================= CHAT WINDOW ================= */

const chat = document.createElement("div");
chat.className = "chatbot-window";

chat.innerHTML =
  '<div class="chat-header">🤖 bhA-Ai | Bhavan’s Assistant</div>' +
  '<div class="chat-body" id="chatBody"></div>';

document.body.appendChild(chat);

const chatBody = document.getElementById("chatBody");


/* ================= TOGGLE ================= */

robot.onclick = function () {

  if(chat.style.display === "flex"){
      chat.style.display = "none";
  }else{
      chat.style.display = "flex"; // ⭐ IMPORTANT FIX
      loadHome();
  }

};


/* ================= HOME ================= */

function loadHome() {

  chatBody.innerHTML = '<div class="bot-msg">How can I help you?</div>';

  /* SEARCH WRAPPER */
  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.gap = "6px";

  const search = document.createElement("input");
  search.placeholder = "Search Faculty Name...";
  search.style.flex = "1";

  const btn = document.createElement("button");
  btn.textContent = "Search";

  btn.onclick = function () {
    if (!search.value.trim()) return;
    searchFaculty(search.value.trim());
  };

  wrap.appendChild(search);
  wrap.appendChild(btn);
  chatBody.appendChild(wrap);

  /* ENTER KEY SUPPORT 🔥 */
  search.addEventListener("keypress", function(e){
    if(e.key === "Enter"){
      btn.click();
    }
  });

  /* MODULE BUTTONS */
  db.collection("modules").get().then(function (snapshot) {
    snapshot.forEach(function (doc) {
      const m = doc.data();

      const btn = document.createElement("button");
      btn.textContent = m.name;
      btn.onclick = function () {
        loadModule(m);
      };

      chatBody.appendChild(btn);
    });
  });
}



/* ================= MODULE ================= */

function loadModule(module) {

  chatBody.innerHTML = "";

  const title = document.createElement("div");
  title.className = "bot-msg";
  title.textContent = module.name;

  chatBody.appendChild(title);


  /* SIMPLE MODULES */
  if (module.type === "simple") {

    db.collection("items")
      .where("module", "==", module.key)
      .get()
      .then(function (snapshot) {

        if(snapshot.empty){
            chatBody.innerHTML += "<small>No data available</small>";
        }

        const list = document.createElement("div");

        snapshot.forEach(function (doc) {

          const i = doc.data();

          const link = document.createElement("a");
          link.href = i.url;
          link.target = "_blank";
          link.textContent = i.title;
          link.className = "chat-link"; // ⭐ styled via CSS

          list.appendChild(link);
        });

        chatBody.appendChild(list);
        backBtn();
      });
  }


  /* FACULTY MODULE */
  if (module.type === "faculty") {
    loadDepartments();
  }

}



/* ================= FACULTY ================= */

function loadDepartments() {

  chatBody.innerHTML = '<div class="bot-msg">Select Department</div>';

  db.collection("faculty_departments").get().then(function (snapshot) {

    snapshot.forEach(function (doc) {

      const d = doc.data();

      const btn = document.createElement("button");
      btn.className = "chat-btn";
      btn.textContent = d.name;

      btn.onclick = function () {
        loadFaculty(doc.id, d.name);
      };

      chatBody.appendChild(btn);
    });

    backBtn();
  });

}



function loadFaculty(deptId, deptName) {

  chatBody.innerHTML = '<div class="bot-msg">' + deptName + ' Faculty</div>';

  db.collection("faculty_members")
    .where("department", "==", deptId)
    .get()
    .then(function (snapshot) {

      const list = document.createElement("div");

      snapshot.forEach(function (doc) {

        const f = doc.data();

        const link = document.createElement("a");
        link.href = f.url;
        link.target = "_blank";
        link.textContent = "👩‍🏫 " + f.name;
        link.className = "chat-link";

        list.appendChild(link);
      });

      chatBody.appendChild(list);
      backBtn();
    });
}



/* ================= SEARCH ================= */

function searchFaculty(text){

  chatBody.innerHTML =
    '<div class="bot-msg">Faculty Search Results</div>';

  db.collection("faculty_members")
    .get()
    .then(function(snapshot){

      if(snapshot.empty){
        chatBody.innerHTML += "<small>No faculty found</small>";
        backBtn();
        return;
      }

      let found = false;

      snapshot.forEach(function(doc){

        const f = doc.data();

        if(f.name.toLowerCase().includes(text.toLowerCase())){

          found = true;

          const link = document.createElement("a");
          link.href = f.url;
          link.target = "_blank";
          link.textContent = "👩‍🏫 " + f.name;

          chatBody.appendChild(link);
        }
      });

      if(!found){
        chatBody.innerHTML += "<small>No matching faculty found</small>";
      }

      backBtn();
    });
}


/* ================= BACK BUTTON ================= */

function backBtn() {

  const btn = document.createElement("button");
  btn.className = "chat-btn";
  btn.textContent = "⬅ Back";

  btn.onclick = loadHome;

  chatBody.appendChild(btn);
}


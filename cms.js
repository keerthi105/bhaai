/* ================= FIREBASE ================= */
const firebaseConfig = {
  apiKey: "AIzaSyCYJY8PoJSoH_xiyrRHATjj-43j0Q9CrRQ",
  authDomain: "bha-ai-admin.firebaseapp.com",
  projectId: "bha-ai-admin"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ================= ROBOT ================= */
const robot = document.createElement("div");
robot.className = "robot-launcher";
robot.innerHTML =
  '<div class="robot-head">' +
  '<div class="robot-face">' +
  '<div>' +
  '<div class="robot-eyes"><div class="eye"></div><div class="eye"></div></div>' +
  '<div class="robot-mouth"></div>' +
  '</div></div></div>' +
  '<div class="robot-body"></div>';

const container = document.createElement("div");
container.className = "robot-container";
container.appendChild(robot);
document.body.appendChild(container);

/* ================= CHAT WINDOW ================= */
const chat = document.createElement("div");
chat.className = "chatbot-window";

chat.innerHTML =
  '<div class="chat-header">🤖 BhA-Ai Assistant <span id="closeChat">✖</span></div>' +
  '<div class="chat-body" id="chatBody"></div>' +
  '<div class="chat-footer" id="chatFooter"></div>';

document.body.appendChild(chat);

const chatBody = document.getElementById("chatBody");

/* ================= OPEN / CLOSE ================= */
robot.onclick = () => {
  chat.style.display =
    chat.style.display === "flex" ? "none" : "flex";

  if (chat.style.display === "flex") loadHome();
};

document.addEventListener("click", e => {
  if (e.target.id === "closeChat") {
    chat.style.display = "none";
  }
});

/* ================= BOT MESSAGE ================= */
function botMsg(text){
  const msg=document.createElement("div");
  msg.className="bot-msg";
  msg.innerHTML=text;
  chatBody.appendChild(msg);
}

/* ================= USER MESSAGE ================= */
function userBubble(text){
  const msg=document.createElement("div");
  msg.style.alignSelf="flex-end";
  msg.style.background="#2563eb";
  msg.style.color="white";
  msg.style.padding="10px";
  msg.style.borderRadius="12px";
  msg.textContent=text;
  chatBody.appendChild(msg);
}

/* ================= HOME ================= */
function loadHome(){
  chatBody.innerHTML="";
  document.getElementById("chatFooter").innerHTML="";

  botMsg("Welcome to BhA-Ai 🤖<br>Ask me anything about the college.");
  createInput();
}

/* ================= INPUT ================= */
function createInput(){
  const input=document.createElement("input");
  input.placeholder="Type your question...";
  chatBody.appendChild(input);

  input.addEventListener("keypress", e=>{
    if(e.key==="Enter"){
      const text=input.value.trim().toLowerCase();
      if(!text) return;

      userBubble(text);
      input.value="";

      searchModules(text);
    }
  });
}

/* ================= SEARCH ENGINE ================= */
function searchModules(keyword){
  const facultyWords = [
    "faculty","teacher","teachers",
    "staff","lecturer","professor"
  ];

  if(facultyWords.some(word => keyword.includes(word))){
      loadDepartments(true);
      return;
  }

  let moduleFound=false;

  db.collection("modules").get().then(snapshot=>{
    snapshot.forEach(doc=>{
      const m=doc.data();
      if(m.name.toLowerCase().includes(keyword)){
        moduleFound=true;
        loadModule(m);
      }
    });

    if(!moduleFound){
      db.collection("faculty_members").get().then(fac=>{
        let facultyMatch=false;
        chatBody.innerHTML="";
        fac.forEach(d=>{
          const f=d.data();
          if(f.name.toLowerCase().includes(keyword)){
            if(!facultyMatch) facultyMatch=true;

            const link=document.createElement("a");
            link.href=f.url;
            link.target="_blank";
            link.textContent=f.name;
            chatBody.appendChild(link);
          }
        });

        if(facultyMatch){
          backBtn();
        } else {
          botMsg("❗ I can assist only with these currently:");
          showAllModules();
          backBtn();
        }
      });
    }
  });
}

/* ================= SHOW MODULES ================= */
function showAllModules(){
  db.collection("modules")
    .orderBy("name")
    .get()
    .then(snapshot=>{
      snapshot.forEach(doc=>{
        const m=doc.data();
        const btn=document.createElement("button");
        btn.textContent=m.name;

        btn.onclick = () => {
          if(m.type === "syllabus"){
            loadSyllabusModule();
          } else {
            loadModule(m);
          }
        };

        chatBody.appendChild(btn);
      });
    });
}

/* ================= LOAD MODULE ================= */
function loadModule(module){
  chatBody.innerHTML="";
  botMsg(module.name);

  if(module.type === "simple"){
    db.collection("items")
      .where("module","==",module.key)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const i = doc.data();
          const link = document.createElement("a");
          link.href = i.url;
          link.target = "_blank";
          link.textContent = i.title;
          chatBody.appendChild(link);
        });
        backBtn();
      });
  }
  else if(module.type === "faculty"){
    loadDepartments(true);
  }
  else if(module.type === "syllabus"){
    loadSyllabusModule();
  }
}

/* ================= LOAD SYLLABUS MODULE ================= */
function loadSyllabusModule(){
  chatBody.innerHTML = "";
  botMsg("Search for your course syllabus");

  const container = document.createElement("div");
  chatBody.appendChild(container);

  const input = document.createElement("input");
  input.placeholder = "Type course name...";
  input.style.marginBottom = "10px";
  input.style.width = "100%";
  input.style.padding = "8px";
  container.appendChild(input);

  const resultsDiv = document.createElement("div");
  container.appendChild(resultsDiv);

  // Show all syllabus initially
  db.collection("syllabus").orderBy("course").get().then(snapshot => {
    snapshot.forEach(doc => {
      const s = doc.data();
      const link = document.createElement("a");
      link.href = s.url;
      link.target = "_blank";
      link.style.display = "block";
      link.style.margin = "5px 0";
      link.textContent = "📄 " + s.course + " - " + s.title;
      resultsDiv.appendChild(link);
    });
  });

  // Search functionality
  input.addEventListener("keypress", e=>{
    if(e.key==="Enter"){
      const keyword = input.value.trim().toLowerCase();
      resultsDiv.innerHTML="";

      let found = false;
      db.collection("syllabus").get().then(snapshot=>{
        snapshot.forEach(doc=>{
          const s = doc.data();
          if(s.course.toLowerCase().includes(keyword)){
            const link = document.createElement("a");
            link.href = s.url;
            link.target="_blank";
            link.style.display = "block";
            link.style.margin = "5px 0";
            link.textContent = "📄 " + s.course + " - " + s.title;
            resultsDiv.appendChild(link);
            found=true;
          }
        });

        if(!found){
          const msg = document.createElement("div");
          msg.textContent = "❗ No syllabus found for this course.";
          container.appendChild(msg);
        }
      });
    }
  });

  backBtn();
}

/* ================= FACULTY ================= */
function loadDepartments(enableSearch=false){
  chatBody.innerHTML="";
  botMsg("Select Department or Search Faculty");

  if(enableSearch){
    const search=document.createElement("input");
    search.placeholder="Search faculty name...";
    chatBody.appendChild(search);

    search.addEventListener("keypress",e=>{
      if(e.key==="Enter"){
        const text=search.value.toLowerCase();
        chatBody.innerHTML="";

        db.collection("faculty_members").get().then(snapshot=>{
          snapshot.forEach(doc=>{
            const f=doc.data();
            if(f.name.toLowerCase().includes(text)){
              const link=document.createElement("a");
              link.href=f.url;
              link.target="_blank";
              link.textContent="👩‍🏫 "+f.name;
              chatBody.appendChild(link);
            }
          });
          backBtn();
        });
      }
    });
  }

  db.collection("faculty_departments").get().then(snapshot=>{
    snapshot.forEach(doc=>{
      const d=doc.data();
      const btn=document.createElement("button");
      btn.textContent=d.name;
      btn.onclick=()=>loadFaculty(doc.id,d.name);
      chatBody.appendChild(btn);
    });
    backBtn();
  });
}

/* ================= LOAD FACULTY ================= */
function loadFaculty(id,name){
  chatBody.innerHTML="";
  botMsg(name+" Faculty");

  db.collection("faculty_members")
    .where("department","==",id)
    .get()
    .then(snapshot=>{
      snapshot.forEach(doc=>{
        const f=doc.data();
        const link=document.createElement("a");
        link.href=f.url;
        link.target="_blank";
        link.textContent="👩‍🏫 "+f.name;
        chatBody.appendChild(link);
      });
      backBtn();
    });
}

/* ================= BACK BUTTON ================= */
function backBtn(){
  const footer=document.getElementById("chatFooter");
  footer.innerHTML="";
  const btn=document.createElement("button");
  btn.textContent="⬅ Back";
  btn.onclick=loadHome;
  footer.appendChild(btn);
}

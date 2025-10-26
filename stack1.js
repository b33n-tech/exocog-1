// --- Elements ---
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const tasksContainer = document.getElementById("tasksContainer");
const buttonsRow = document.querySelector(".buttons-row");
const promptsContainer = document.getElementById("promptsContainer");
const copiedMsg = document.getElementById("copiedMsg");
const llmSelect = document.getElementById("llmSelect");
const batchInput = document.getElementById("batchInput");
const pasteDownloadBtn = document.getElementById("pasteDownloadBtn");

// --- Stockage local ---
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// --- Format date ---
function formatDate(iso){
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// --- Render tasks ---
function renderTasks(){
  tasksContainer.innerHTML = "";
  tasks.slice().sort((a,b)=> new Date(a.date)-new Date(b.date))
    .forEach((task,index)=>{
      const li = document.createElement("li"); li.className="task-item";
      const taskText = document.createElement("div"); taskText.textContent=task.text; taskText.style.cursor="pointer";
      if(task.comments?.length) taskText.title=task.comments.map(c=>`• ${c.text} (${formatDate(c.date)})`).join("\n");

      const commentBlock = document.createElement("div"); commentBlock.className="comment-section";
      const commentList = document.createElement("ul");
      if(task.comments?.length) task.comments.forEach(c=>{
        const cLi = document.createElement("li"); cLi.textContent=`[${formatDate(c.date)}] ${c.text}`; commentList.appendChild(cLi);
      });
      commentBlock.appendChild(commentList);

      const commentInputDiv = document.createElement("div"); commentInputDiv.className="comment-input";
      const commentInput = document.createElement("input"); commentInput.placeholder="Ajouter un commentaire…";
      const commentBtn = document.createElement("button"); commentBtn.textContent="+";
      commentBtn.addEventListener("click", ()=>{
        const val=commentInput.value.trim(); if(val!==""){ if(!task.comments) task.comments=[];
          task.comments.push({text:val,date:new Date().toISOString()});
          localStorage.setItem("tasks", JSON.stringify(tasks));
          commentInput.value=""; renderTasks();
        }
      });
      commentInputDiv.appendChild(commentInput); commentInputDiv.appendChild(commentBtn);
      commentBlock.appendChild(commentInputDiv);

      li.appendChild(taskText); li.appendChild(commentBlock);
      taskText.addEventListener("click",()=>{ commentBlock.style.display=commentBlock.style.display==="none"?"flex":"none"; });

      tasksContainer.appendChild(li);
    });
}

// --- Ajouter tâche ---
addBtn.addEventListener("click", ()=>{
  const text=taskInput.value.trim(); if(text!==""){ tasks.push({text,date:new Date().toISOString(),comments:[]});
  localStorage.setItem("tasks",JSON.stringify(tasks)); taskInput.value=""; renderTasks();
}});

// --- Nettoyage / archivage ---
const clearBtn=document.createElement("button"); clearBtn.textContent="🧹 Tout nettoyer"; clearBtn.addEventListener("click",()=>{
  if(confirm("Es-tu sûr ?")){ tasks=[]; localStorage.removeItem("tasks"); renderTasks(); alert("✅ Toutes les tâches ont été supprimées."); }
});
buttonsRow.appendChild(clearBtn);

const archiveBtn=document.createElement("button"); archiveBtn.textContent="📂 Archiver JSON"; archiveBtn.addEventListener("click",()=>{
  if(tasks.length===0){ alert("Aucune tâche !"); return; }
  const blob=new Blob([JSON.stringify(tasks,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url;
  a.download=`taches_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
});
buttonsRow.appendChild(archiveBtn);

// --- Prompts ---
const prompts = [
  {id:"planifier", label:"Plan", text:"Transforme ces tâches en plan structuré étape par étape :"},
  {id:"prioriser", label:"Priorité", text:"Classe ces tâches par ordre de priorité et urgence :"},
  {id:"categoriser", label:"Catégories", text:"Range ces tâches dans des catégories logiques :"}
];

prompts.forEach(p=>{
  const btn=document.createElement("button"); btn.textContent=p.label;
  btn.addEventListener("click",()=>{
    const combined=p.text+"\n\n"+tasks.map(t=>{
      let str="- "+t.text;
      if(t.comments?.length) str+="\n  Commentaires:\n"+t.comments.map(c=>`    - [${formatDate(c.date)}] ${c.text}`).join("\n");
      return str;
    }).join("\n");
    navigator.clipboard.writeText(combined).then(()=>{
      copiedMsg.style.display="block"; setTimeout(()=>copiedMsg.style.display="none",2000);
      window.open(llmSelect.value,"_blank");
    });
  });
  promptsContainer.appendChild(btn);
});

// --- Batch JSON → Stack2 ---
pasteDownloadBtn.addEventListener("click", async ()=>{
  try{
    let raw=batchInput.value.trim(); if(!raw){ alert("JSON vide !"); return; }
    const data=JSON.parse(raw);
    // téléchargement JSON
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url;
    a.download=`batch_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    // ouvre Stack2
    window.open("stack2.html","_blank");
  }catch(err){ console.error(err); alert("JSON invalide !"); }
});

// --- Initial render ---
renderTasks();

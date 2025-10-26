document.addEventListener("DOMContentLoaded", ()=>{
  const jalonsList=document.getElementById("jalonsList");
  const messagesTableBody=document.querySelector("#messagesTable tbody");
  const rdvList=document.getElementById("rdvList");
  const livrablesList=document.getElementById("livrablesList");
  const generateMailBtn=document.getElementById("generateMailBtn");
  const mailPromptSelect=document.getElementById("mailPromptSelect");
  const generateLivrableBtn=document.getElementById("generateLivrableBtn");
  const livrablePromptSelect=document.getElementById("livrablePromptSelect");
  const llmSelect=document.getElementById("llmSelect");

  const mailPrompts={1:"Écris un email professionnel clair et concis pour :",2:"Écris un email amical et léger pour :"};
  const livrablePrompts={1:"Génère un plan détaillé pour :",2:"Génère un résumé exécutif pour :",3:"Génère une checklist rapide pour :"};

  let llmData=JSON.parse(localStorage.getItem("llmJson")||"null");

  function renderModules(){
    if(!llmData) return;

    // Jalons
    jalonsList.innerHTML="";
    (llmData.jalons||[]).forEach(j=>{
      const li=document.createElement("li");
      li.innerHTML=`<strong>${j.titre}</strong> (${j.datePrévue||""})`;
      jalonsList.appendChild(li);
    });

    // Messages
    messagesTableBody.innerHTML="";
    (llmData.messages||[]).forEach(m=>{
      const tr=document.createElement("tr");
      const tdCheck=document.createElement("td");
      const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=m.envoyé||false;
      tdCheck.appendChild(cb);
      tr.appendChild(tdCheck);
      tr.appendChild(document.createElement("td")).textContent=m.destinataire||"";
      tr.appendChild(document.createElement("td")).textContent=m.sujet||"";
      tr.appendChild(document.createElement("td")).textContent=m.texte||"";
      messagesTableBody.appendChild(tr);
    });

    // RDV
    rdvList.innerHTML="";
    (llmData.rdv||[]).forEach(r=>{
      const li=document.createElement("li");
      li.textContent=`${r.titre||""} - ${r.date||""} (${r.durée||""})`;
      rdvList.appendChild(li);
    });

    // Livrables
    livrablesList.innerHTML="";
    (llmData.livrables||[]).forEach(l=>{
      const li=document.createElement("li");
      const cb=document.createElement("input"); cb.type="checkbox";
      cb.dataset.titre=l.titre; cb.dataset.type=l.type;
      li.appendChild(cb);
      li.appendChild(document.createTextNode(` ${l.titre} (${l.type})`));
      livrablesList.appendChild(li);
    });
  }

  renderModules();

  generateMailBtn.addEventListener("click", ()=>{
    if(!llmData?.messages) return;
    const selected=Array.from(messagesTableBody.querySelectorAll("input[type=checkbox]")).filter(cb=>cb.checked).map((cb,i)=>llmData.messages[i]);
    if(!selected.length){ alert("Coche au moins un message !"); return; }
    const promptTexte=mailPrompts[mailPromptSelect.value];
    const content=selected.map(m=>`À: ${m.destinataire}\nSujet: ${m.sujet}\nMessage: ${m.texte}`).join("\n\n");
    navigator.clipboard.writeText(`${promptTexte}\n\n${content}`).then(()=>alert("Prompt + messages copiés !"));
    window.open(llmSelect.value,"_blank");
  });

  generateLivrableBtn.addEventListener("click", ()=>{
    if(!llmData?.livrables) return;
    const selected=Array.from(livrablesList.querySelectorAll("input[type=checkbox]")).filter(cb=>cb.checked);
    if(!selected.length){ alert("Coche au moins un livrable !"); return; }
    const promptTexte=livrablePrompts[livrablePromptSelect.value];
    const content=selected.map(cb=>`${cb.dataset.titre} (${cb.dataset.type})`).join("\n\n");
    navigator.clipboard.writeText(`${promptTexte}\n\n${content}`).then(()=>alert("Prompt + livrables copiés !"));
    window.open(llmSelect.value,"_blank");
  });
});

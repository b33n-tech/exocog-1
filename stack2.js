document.addEventListener("DOMContentLoaded",()=>{
  const jsonInput=document.getElementById("jsonInput");
  const loadJsonBtn=document.getElementById("loadJsonBtn");

  const jalonsList=document.getElementById("jalonsList");
  const messagesTableBody=document.querySelector("#messagesTable tbody");
  const rdvList=document.getElementById("rdvList");
  const livrablesList=document.getElementById("livrablesList");

  const generateMailBtn=document.getElementById("generateMailBtn");
  const mailPromptSelect=document.getElementById("mailPromptSelect");

  const generateLivrableBtn=document.getElementById("generateLivrableBtn");
  const livrablePromptSelect=document.getElementById("livrablePromptSelect");

  let llmData=null;

  function renderModules(){
    if(!llmData) return;

    // Jalons
    jalonsList.innerHTML="";
    (llmData.jalons||[]).forEach(j=>{
      const li=document.createElement("li");
      li.innerHTML=`<strong>${j.titre}</strong> (${j.datePrévue||''})`;
      if(j.sousActions?.length){
        const subUl=document.createElement("ul");
        j.sousActions.forEach(s=>{
          const subLi=document.createElement("li");
          const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=s.statut==="fait";
          cb.addEventListener("change",()=>s.statut=cb.checked?"fait":"à faire");
          subLi.appendChild(cb); subLi.appendChild(document.createTextNode(s.texte)); subUl.appendChild(subLi);
        });
        li.appendChild(subUl);
      }
      jalonsList.appendChild(li);
    });

    // Messages
    messagesTableBody.innerHTML="";
    (llmData.messages||[]).forEach(m=>{
      const tr=document.createElement("tr");
      const tdCheck=document.createElement("td"); const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=m.envoye; cb.addEventListener("change",()=>m.envoye=cb.checked); tdCheck.appendChild(cb);
      tr.appendChild(tdCheck); tr.appendChild(document.createElement("td")).textContent=m.destinataire;
      tr.appendChild(document.createElement("td")).textContent=m.sujet; tr.appendChild(document.createElement("td")).textContent=m.texte;
      messagesTableBody.appendChild(tr);
    });

    // RDV
    rdvList.innerHTML="";
    (llmData.rdv||[]).forEach(r=>{
      const li=document.createElement("li");
      li.innerHTML=`<strong>${r.titre}</strong> - ${r.date||''} (${r.duree||''}) - Participants: ${(r.participants||[]).join(", ")}`;
      rdvList.appendChild(li);
    });

    // Livrables
    livrablesList.innerHTML="";
    (llmData.livrables||[]).forEach(l=>{
      const li=document.createElement("li");
      const cb=document.createElement("input"); cb.type="checkbox"; cb.dataset.titre=l.titre; cb.dataset.type=l.type; li.appendChild(cb);
      li.appendChild(document.createTextNode(` ${l.titre} (${l.type})`));

      const note=document.createElement("textarea"); note.className="livrable-note"; note.placeholder="Ajouter une note..."; note.dataset.titre=l.titre; li.appendChild(note);

      livrablesList.appendChild(li);
    });
  }

  // Charger JSON
  loadJsonBtn.addEventListener("click",()=>{
    try{
      llmData=JSON.parse(jsonInput.value);
      renderModules();
      alert("✅ JSON chargé !");
    }catch(err){ console.error(err); alert("JSON invalide !"); }
  });

  // Générer Mail GPT
  generateMailBtn.addEventListener("click",()=>{
    if(!llmData?.messages) return;
    const selected=llmData.messages.filter(m=>m.envoye);
    if(!selected.length){ alert("Coche au moins un message !"); return; }
    const prompt=mailPromptSelect.value==1?"Écris un email professionnel clair et concis pour :":"Écris un email amical et léger pour :";
    const content=selected.map(m=>`À: ${m.destinataire}\nSujet: ${m.sujet}\nMessage: ${m.texte}`).join("\n\n");
    navigator.clipboard.writeText(`${prompt}\n\n${content}`).then(()=>alert("✅ Copié + prêt à coller dans LLM !"));
    window.open("https://chat.openai.com/","_blank");
  });

  // Générer Livrables
  generateLivrableBtn.addEventListener("click",()=>{
    if(!llmData?.livrables) return;
    const selected=Array.from(livrablesList.querySelectorAll("li")).filter(li=>li.querySelector("input[type=checkbox]").checked);
    if(!selected.length){ alert("Coche au moins un livrable !"); return; }
    const prompt=livrablePromptSelect.value==1?"Génère un plan détaillé pour :":livrablePromptSelect.value==2?"Génère un résumé exécutif pour :":"Génère une checklist rapide pour :";
    const content=selected.map(li=>{
      const cb=li.querySelector("input[type=checkbox]"); const note=li.querySelector("textarea").value.trim();
      return note?`${cb.dataset.titre} (${cb.dataset.type})\nNote: ${note}`:`${cb.dataset.titre} (${cb.dataset.type})`;
    }).join("\n\n");
    navigator.clipboard.writeText(`${prompt}\n\n${content}`).then(()=>alert("✅ Copié + prêt à coller dans LLM !"));
    window.open("https://chat.openai.com/","_blank");
  });

});

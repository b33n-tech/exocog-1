const jalonsList = document.getElementById("jalonsList");
const messagesTableBody = document.querySelector("#messagesTable tbody");
const rdvList = document.getElementById("rdvList");
const livrablesList = document.getElementById("livrablesList");

const loadJsonBtn = document.getElementById("loadJsonBtn");
const pasteJsonStack2 = document.getElementById("pasteJsonStack2");

const generateMailBtn = document.getElementById("generateMailBtn");
const mailPromptSelect = document.getElementById("mailPromptSelect");

const generateLivrableBtn = document.getElementById("generateLivrableBtn");
const livrablePromptSelect = document.getElementById("livrablePromptSelect");

const mailPrompts = {
  1:"Écris un email professionnel clair et concis pour :",
  2:"Écris un email amical et léger pour :"
};

const livrablePrompts = {
  1:"Génère un plan détaillé pour :",
  2:"Génère un résumé exécutif pour :",
  3:"Génère une checklist rapide

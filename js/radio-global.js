(function () {
  const SERVIDORES_RB = [
    "https://de1.api.radio-browser.info",
    "https://nl1.api.radio-browser.info",
    "https://at1.api.radio-browser.info"
  ];

  const MAPA_ISO = {
    "Brasil": "BR", "Angola": "AO", "Moçambique": "MZ", "Cabo Verde": "CV",
    "Portugal": "PT", "Argentina": "AR", "Estados Unidos": "US", "Canadá": "CA",
    "México": "MX", "Chile": "CL", "Colômbia": "CO", "Peru": "PE", "Uruguai": "UY",
    "Paraguai": "PY", "Bolívia": "BO", "Equador": "EC", "Venezuela": "VE",
    "Costa Rica": "CR", "Panamá": "PA", "Cuba": "CU", "República Dominicana": "DO",
    "Guatemala": "GT", "Honduras": "HN", "El Salvador": "SV", "Espanha": "ES",
    "Itália": "IT", "França": "FR", "Alemanha": "DE", "Reino Unido": "GB",
    "Irlanda": "IE", "Suíça": "CH", "Áustria": "AT", "Bélgica": "BE",
    "Países Baixos": "NL", "Suécia": "SE", "Noruega": "NO", "Dinamarca": "DK",
    "Finlândia": "FI", "Polônia": "PL", "Grécia": "GR", "Romênia": "RO",
    "Hungria": "HU", "República Tcheca": "CZ", "Croácia": "HR", "Ucrânia": "UA",
    "Islândia": "IS", "Estônia": "EE", "Lituânia": "LT", "Japão": "JP",
    "Coreia do Sul": "KR", "China": "CN", "Índia": "IN", "Austrália": "AU",
    "Nova Zelândia": "NZ", "Tailândia": "TH", "Indonésia": "ID", "Vietnã": "VN",
    "Filipinas": "PH", "Malásia": "MY", "Singapura": "SG", "Taiwan": "TW",
    "Mongólia": "MN", "Cazaquistão": "KZ", "Sri Lanka": "LK", "Nepal": "NP",
    "Cambodja": "KH", "Laos": "LA", "Fiji": "FJ", "África do Sul": "ZA",
    "Nigéria": "NG", "Egito": "EG", "Marrocos": "MA", "Quênia": "KE",
    "Gana": "GH", "Etiópia": "ET", "Senegal": "SN", "Tanzânia": "TZ",
    "Tunísia": "TN", "Argélia": "DZ", "Israel": "IL"
  };

  let estacoes = [];
  let indiceEstacao = 0;
  let volumeBase = 0.7;

  function obterPaisAtual() {
    const ativo = document.querySelector(".chip-pais.ativo");
    return ativo ? ativo.textContent.trim() : "Brasil";
  }

  async function buscarEstacoes(codigoPais) {
    for (const base of SERVIDORES_RB) {
      try {
        const url = base + "/json/stations/bycountrycodeexact/" + encodeURIComponent(codigoPais) +
          "?limit=12&order=votes&reverse=true&hidebroken=true";
        const resp = await fetch(url);
        if (!resp.ok) continue;
        const lista = await resp.json();
        const httpsList = lista.filter((s) => s.url_resolved && s.url_resolved.startsWith("https://"));
        if (httpsList.length) return httpsList;
      } catch (_) {}
    }
    return [];
  }

  function iniciarModuloRadio() {
    const statusBox = document.getElementById("statusRadio");
    if (!statusBox || document.getElementById("blocoStreamGlobal")) return;

    const cardRadio = statusBox.closest("section.card");
    const audioStream = document.createElement("audio");
    audioStream.id = "playerRadioStream";
    audioStream.preload = "none";
    audioStream.crossOrigin = "anonymous";

    const bloco = document.createElement("div");
    bloco.id = "blocoStreamGlobal";
    bloco.className = "destaque-box";
    bloco.style.borderLeft = "4px solid #FFD700";

    const titulo = document.createElement("strong");
    titulo.textContent = "Rádio Ao Vivo do País (Stream Gratuito 0800)";

    const info = document.createElement("p");
    info.id = "infoStreamGlobal";
    info.textContent = "Clique abaixo para sintonizar uma emissora pública real do país selecionado.";

    const barraBtns = document.createElement("div");
    barraBtns.className = "grade-acoes";

    const btnPlay = document.createElement("button");
    btnPlay.type = "button";
    btnPlay.className = "acao";
    btnPlay.style.marginTop = "0";
    btnPlay.textContent = "Sintonizar Ao Vivo";

    const btnProx = document.createElement("button");
    btnProx.type = "button";
    btnProx.className = "acao-sec";
    btnProx.textContent = "Próxima Estação";

    const btnStop = document.createElement("button");
    btnStop.type = "button";
    btnStop.className = "acao-sec";
    btnStop.textContent = "Parar Música";

    barraBtns.appendChild(btnPlay);
    barraBtns.appendChild(btnProx);
    barraBtns.appendChild(btnStop);
    bloco.appendChild(titulo);
    bloco.appendChild(info);
    bloco.appendChild(barraBtns);
    bloco.appendChild(audioStream);
    cardRadio.appendChild(bloco);

    const volSlider = document.getElementById("volAudio");
    if (volSlider) {
      volumeBase = Math.max(0.15, Number(volSlider.value) / 100);
      volSlider.addEventListener("input", () => {
        volumeBase = Math.max(0.1, Number(volSlider.value) / 100);
        audioStream.volume = volumeBase;
      });
    }

    const playerVoz = document.getElementById("playerAudioMestre");
    if (playerVoz) {
      playerVoz.addEventListener("play", () => { audioStream.volume = Math.min(0.18, volumeBase); });
      playerVoz.addEventListener("ended", () => { audioStream.volume = volumeBase; });
      playerVoz.addEventListener("pause", () => { audioStream.volume = volumeBase; });
    }

    function tocarIndice(idx) {
      if (!estacoes.length) {
        info.textContent = "Nenhuma emissora HTTPS disponível para este país no momento.";
        return;
      }
      indiceEstacao = idx % estacoes.length;
      const st = estacoes[indiceEstacao];
      audioStream.src = st.url_resolved;
      audioStream.volume = volumeBase;
      const genero = st.tags ? st.tags.split(",").slice(0, 3).join(", ") : "Geral";
      const kbps = st.bitrate ? st.bitrate + " kbps" : "Ao vivo";
      info.textContent = "NO AR: " + st.name + " • " + (st.country || obterPaisAtual()) + " (" + genero + " • " + kbps + ")";
      audioStream.play().catch(() => {
        if (indiceEstacao + 1 < estacoes.length) {
          tocarIndice(indiceEstacao + 1);
        } else {
          info.textContent = "Não foi possível reproduzir o stream automaticamente. Tente outra estação.";
        }
      });
    }

    audioStream.addEventListener("error", () => {
      if (estacoes.length > 1 && indiceEstacao + 1 < estacoes.length) {
        tocarIndice(indiceEstacao + 1);
      }
    });

    btnPlay.addEventListener("click", async () => {
      const pais = obterPaisAtual();
      const iso = MAPA_ISO[pais] || "BR";
      info.textContent = "Buscando emissoras públicas ao vivo em " + pais + "...";
      estacoes = await buscarEstacoes(iso);
      tocarIndice(0);
    });

    btnProx.addEventListener("click", () => {
      if (estacoes.length) tocarIndice(indiceEstacao + 1);
    });

    btnStop.addEventListener("click", () => {
      audioStream.pause();
      audioStream.removeAttribute("src");
      info.textContent = "Stream pausado.";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarModuloRadio);
  } else {
    iniciarModuloRadio();
  }
})();
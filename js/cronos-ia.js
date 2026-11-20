(function(){
  let dados=null, falar=false;
  const paisAtivo=()=> (document.querySelector(".chip-pais.ativo")?.textContent.trim() || "Brasil");
  const fichaPais=(nome)=>{
    if(!dados?.regioes) return null;
    for(const r of Object.keys(dados.regioes)){
      for(const i of dados.regioes[r]||[]){
        if(i[0]?.toLowerCase()===nome.toLowerCase()) return {r,n:i[0],id:i[1],bcp:i[2],s:i[3],c:i[4]};
      }
    }
    return null;
  };
  const duck=(on)=>{
    const st=document.getElementById("playerRadioStream");
    if(!st) return;
    if(on){ st.dataset.v=String(st.volume||0.7); st.volume=0.15; }
    else if(st.dataset.v){ st.volume=Number(st.dataset.v)||0.7; }
  };
  const falarTxt=(t,lang)=>{
    if(!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(t);
    u.lang=lang||"pt-BR";
    u.onstart=()=>duck(true); u.onend=()=>duck(false); u.onerror=()=>duck(false);
    speechSynthesis.speak(u);
  };
  const responder=(q)=>{
    const s=(q||"").toLowerCase(), p=paisAtivo(), f=fichaPais(p);
    const tx=dados?.textosCronos||{}, bio=dados?.perfilFundador||{};
    if(/fundador|elias|sousa|criador/.test(s)) return {t:(bio.nome||"Elias Pereira de Sousa")+" — "+(bio.bio||"Idealizador do Sousa 20 Cronos e SOUSA 2.0, Itinga do Pará - PA."),l:"pt-BR"};
    if(/80|oitenta|tokusatsu|nostalg/.test(s)) return {t:(tx.anos80||"Os anos 80 marcaram época com rádio FM, tokusatsu e animações.")+(f?" Em "+f.n+": "+f.c+".":""),l:"pt-BR"};
    if(/fé|fe|relig|espirit|tradi/.test(s)) return {t:(tx.feETradicoes||"Tradições protestante, católica e hebraica ao longo do século.")+(f?" Recorte de "+f.n+": "+f.c+".":""),l:"pt-BR"};
    if(/linha|1926|2026|século|decada/.test(s)) return {t:"Linha 1926–2026: 1920s–30s (Rádio) → 1950s–60s (TV) → 1980s (FM, Cultura Pop e Tokusatsu) → 2000s–2026 (Internet e IA).",l:"pt-BR"};
    if(/sauda|idioma|ola|olá/.test(s)) return f?{t:"["+f.n+" • "+f.id+"] "+f.s,l:f.bcp}:{t:"Bem-vindo à Cronos IA! Escolha um dos 80 países.",l:"pt-BR"};
    return f?{t:"País ativo: "+f.n+" ("+f.r+" • "+f.id+"). "+f.c+". Saudação: \""+f.s+"\"",l:"pt-BR"}:{t:"Cronos IA pronta! Pergunte sobre "+p+", anos 80, fé, 1926–2026 ou o fundador.",l:"pt-BR"};
  };
  const montar=()=>{
    if(document.getElementById("painelCronosIA")) return;
    const st=document.createElement("style");
    st.textContent=".cia{border-top:4px solid #FFD700}.cia-t{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}.cia-b{background:#0A1642;color:#FFD700;padding:4px 10px;border-radius:99px;font-size:.78rem;font-weight:700}.cia-l{background:#F8FAFC;border:1px solid #CBD5E1;border-radius:10px;padding:12px;max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin-bottom:10px}.cia-m{padding:8px 12px;border-radius:10px;font-size:.92rem;max-width:92%}.cia-m.ia{background:#0A1642;color:#FFF;align-self:flex-start;border-left:3px solid #FFD700}.cia-m.u{background:#E2E8F0;color:#0A1642;align-self:flex-end;font-weight:600}.cia-c{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.cia-c button{background:#FFF;color:#0A1642;border:1px solid #0A1642;border-radius:99px;padding:5px 10px;font-size:.82rem;font-weight:600;cursor:pointer}.cia-c button:hover{background:#0A1642;color:#FFD700}.cia-f{display:flex;gap:8px;flex-wrap:wrap}.cia-f input{flex:1;min-width:200px;padding:9px 12px;border:1.5px solid #0A1642;border-radius:8px}.cia-p{background:#0A1642;color:#FFD700;border:none;border-radius:8px;padding:9px 14px;font-weight:700;cursor:pointer}.cia-s{background:#FFF;color:#0A1642;border:1.5px solid #0A1642;border-radius:8px;padding:9px 12px;font-weight:700;cursor:pointer}";
    document.head.appendChild(st);
    const sec=document.createElement("section");
    sec.id="painelCronosIA"; sec.className="card cia";
    sec.innerHTML='<div class="cia-t"><h2 style="margin:0">Cronos IA — Guia Cultural (1926–2026)</h2><span class="cia-b">ONLINE • 80 PAÍSES • 0800</span></div><div class="cia-c" id="ciaChips"><button type="button" data-q="Memória do país">Memória do país</button><button type="button" data-q="Saudação nativa">Saudação nativa</button><button type="button" data-q="Anos 80">Anos 80</button><button type="button" data-q="Fé e tradições">Fé & Tradições</button><button type="button" data-q="Linha do tempo 1926 a 2026">Linha do Tempo</button><button type="button" data-q="Fundador Elias">Fundador</button></div><div class="cia-l" id="ciaLog"></div><form class="cia-f" id="ciaForm"><input id="ciaIn" placeholder="Pergunte à Cronos IA..." autocomplete="off"><button type="submit" class="cia-p">Perguntar</button><button type="button" class="cia-s" id="ciaVoz">Voz: OFF</button><button type="button" class="cia-s" id="ciaVin">Vinheta Elias</button></form>';
    (document.querySelector("main")||document.body).appendChild(sec);
    const log=document.getElementById("ciaLog"), inp=document.getElementById("ciaIn");
    const add=(t,c)=>{ const d=document.createElement("div"); d.className="cia-m "+c; d.textContent=t; log.appendChild(d); log.scrollTop=log.scrollHeight; };
    const go=(q)=>{ if(!q.trim()) return; add(q,"u"); const r=responder(q); add(r.t,"ia"); if(falar) falarTxt(r.t,r.l); };
    add("Cronos IA ativada! Selecione um país no portal e use os atalhos ou digite sua pergunta.","ia");
    document.getElementById("ciaForm").addEventListener("submit",(e)=>{ e.preventDefault(); go(inp.value); inp.value=""; });
    document.getElementById("ciaChips").addEventListener("click",(e)=>{ const b=e.target.closest("button"); if(b) go(b.dataset.q); });
    document.getElementById("ciaVoz").addEventListener("click",(e)=>{ falar=!falar; e.target.textContent=falar?"Voz: ON":"Voz: OFF"; if(!falar && "speechSynthesis" in window){ speechSynthesis.cancel(); duck(false); } });
    document.getElementById("ciaVin").addEventListener("click",()=>{ const a=document.getElementById("playerAudioMestre")||new Audio("./audio/voz_mestre_elias.wav"); a.src="./audio/voz_mestre_elias.wav"; a.onplay=()=>duck(true); a.onended=()=>duck(false); a.play().catch(()=>add("Áudio voz_mestre_elias.wav não encontrado em ./audio/.","ia")); });
  };
  fetch("./dados/cronos.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{dados=j;}).catch(()=>{}).finally(()=> document.readyState==="loading"?document.addEventListener("DOMContentLoaded",montar):montar());
})();
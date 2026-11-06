(() => {
  "use strict";
  const SUPABASE_URL = "https://hwlvnuhmsaybsgrrcduc.supabase.co";
  const SUPABASE_KEY = "sb_publishable_kJVY-fdggdo1xbsZwPrD0A_GRvqyDbp";
  const KEYS = ["ht-collection", "ht-career-achievements-v1", "ht-favorite-trio-v1", "ht-daily-challenge-played", "ht-username", "ht-club-name-v1"];
  const defaults = {
    "ht-collection": "[]",
    "ht-career-achievements-v1": JSON.stringify({stats:{matches:0,goals:0,conceded:0,wins:0,losses:0},unlocked:[]}),
    "ht-favorite-trio-v1": "[]",
    "ht-daily-challenge-played": "",
    "ht-username": "",
    "ht-club-name-v1": "Meu Clube"
  };
  const client = window.supabase?.createClient(SUPABASE_URL, SUPABASE_KEY);
  if (!client) { console.error("Supabase SDK não carregado."); return; }
  window.HT_SUPABASE = client;
  let currentUser = null, ready = false, saveTimer = null, applyingRemote = false, lastLoadError = "";
  const $ = (s, r=document) => r.querySelector(s);

  function readJson(key, fallback) { try { const v=localStorage.getItem(key); return v===null?fallback:JSON.parse(v); } catch { return fallback; } }
  function snapshot() {
    const career=readJson("ht-career-achievements-v1", {stats:{matches:0,goals:0,conceded:0,wins:0,losses:0},unlocked:[]});
    return {
      stats: career.stats || {matches:0,goals:0,conceded:0,wins:0,losses:0},
      daily_challenge_played: localStorage.getItem("ht-daily-challenge-played") || null,
      extra_data: {
        collection: readJson("ht-collection", []),
        achievements: Array.isArray(career.unlocked) ? career.unlocked : [],
        favorite_trio: readJson("ht-favorite-trio-v1", []),
        club_name: (localStorage.getItem("ht-club-name-v1")||"Meu Clube").slice(0,40)
      }
    };
  }
  async function saveRemote() {
    if (!currentUser || !ready || applyingRemote) return;
    const data=snapshot();
    const {error}=await client.from("player_progress").upsert({user_id:currentUser.id,...data,updated_at:new Date().toISOString()},{onConflict:"user_id"});
    if (error) console.error("Falha ao sincronizar progresso:",error.message);
  }
  function scheduleSave() {
    if (!currentUser || !ready || applyingRemote) return;
    clearTimeout(saveTimer); saveTimer=setTimeout(saveRemote,650);
  }
  async function loadRemote(user) {
    ready=false;
    if (!localStorage.getItem("ht-guest-backup-v1")) {
      const guest={}; KEYS.forEach(k=>{guest[k]=localStorage.getItem(k);});
      localStorage.setItem("ht-guest-backup-v1",JSON.stringify(guest));
    }
    applyingRemote=true;
    const [{data:progress,error:pError},{data:profile,error:uError}]=await Promise.all([
      client.from("player_progress").select("stats,daily_challenge_played,extra_data").eq("user_id",user.id).maybeSingle(),
      client.from("profiles").select("username").eq("id",user.id).maybeSingle()
    ]);
    if (pError || uError) {
      const err = pError || uError;
      lastLoadError = err.message || "Erro desconhecido ao consultar o banco.";
      console.error("Não foi possível carregar o progresso no Supabase:", err);
      applyingRemote=false; return false;
    }
    lastLoadError = "";
    const extra=progress?.extra_data||{};
    localStorage.setItem("ht-collection",JSON.stringify(Array.isArray(extra.collection)?extra.collection:[]));
    localStorage.setItem("ht-career-achievements-v1",JSON.stringify({stats:progress?.stats||{matches:0,goals:0,conceded:0,wins:0,losses:0},unlocked:Array.isArray(extra.achievements)?extra.achievements:[]}));
    localStorage.setItem("ht-favorite-trio-v1",JSON.stringify(Array.isArray(extra.favorite_trio)?extra.favorite_trio:[]));
    localStorage.setItem("ht-club-name-v1",String(extra.club_name||"Meu Clube").slice(0,40));
    window.dispatchEvent(new Event("ht:club-updated"));
    if(progress?.daily_challenge_played) localStorage.setItem("ht-daily-challenge-played",progress.daily_challenge_played); else localStorage.removeItem("ht-daily-challenge-played");
    if(profile?.username) localStorage.setItem("ht-username",profile.username); else localStorage.removeItem("ht-username");
    applyingRemote=false; ready=true;
    window.dispatchEvent(new CustomEvent("ht:cloud-loaded"));
    window.dispatchEvent(new CustomEvent("ht:collection-updated"));
    window.dispatchEvent(new CustomEvent("ht:achievements-updated"));
    window.dispatchEvent(new CustomEvent("ht:favorite-updated"));
    return true;
  }

  // Captura as gravações já existentes no jogo sem modificar suas regras.
  const originalSet=Storage.prototype.setItem, originalRemove=Storage.prototype.removeItem;
  Storage.prototype.setItem=function(key,value){ originalSet.call(this,key,value); if(this===localStorage && KEYS.includes(String(key))) scheduleSave(); };
  Storage.prototype.removeItem=function(key){ originalRemove.call(this,key); if(this===localStorage && KEYS.includes(String(key))) scheduleSave(); };

  function setStatus(message, bad=false) { const el=$("#ht-auth-status"); if(el){el.textContent=message;el.style.color=bad?"#e6a09a":"#d8c18e";} }
  function showAccount(user, username) {
    const authForm=$("#ht-auth-form"), account=$("#ht-account-info"), title=$("#ht-profile-username"), notice=$("#ht-guest-notice");
    if(authForm) { authForm.hidden=!!user; authForm.style.display=user?"none":"grid"; }
    if(account) { account.hidden=!user; account.style.display=user?"block":"none"; }
    if(title && user) title.textContent="@"+(username||user.user_metadata?.username||"jogador");
    if(notice) notice.textContent=user?"Sua conta está conectada. Seu progresso é sincronizado com a nuvem e pode ser acessado em outros dispositivos.":"Seu progresso de visitante fica salvo somente neste navegador.";
    const email=$("#ht-account-email"); if(email&&user) email.textContent=user.email||"";
  }
  function switchMode(mode) {
    const signup=mode==="signup";
    const username=$("#ht-auth-username-wrap"), submit=$("#ht-auth-submit"), toggle=$("#ht-auth-toggle");
    if(username) username.hidden=!signup;
    if(submit) submit.textContent=signup?"CRIAR CONTA":"ENTRAR";
    if(toggle) toggle.textContent=signup?"Já tenho uma conta — entrar":"Ainda não tenho conta — cadastrar";
    const modeField=$("#ht-auth-mode"); if(modeField) modeField.value=mode;
    setStatus("");
  }

  async function refreshWallet() {
    const el=$("#ht-wallet-balance"); if(!el) return;
    if(!currentUser) { el.textContent="—"; return; }
    const {data,error}=await client.from("player_wallet").select("balance").eq("user_id",currentUser.id).maybeSingle();
    if(error) { console.info("Carteira ainda não configurada no Supabase.",error.message); el.textContent="—"; return; }
    el.textContent=Number(data?.balance||0).toLocaleString("pt-BR");
    window.dispatchEvent(new CustomEvent("ht:wallet-updated",{detail:{balance:Number(data?.balance||0)}}));
  }

  async function initAuth() {
    const form=$("#ht-auth-form");
    const {data:{session},error}=await client.auth.getSession();
    if(error) setStatus("Não foi possível verificar a sessão. Atualize a página.",true);
    currentUser=session?.user||null;
    if(currentUser) {
      const ok=await loadRemote(currentUser);
      const {data:profile}=await client.from("profiles").select("username").eq("id",currentUser.id).maybeSingle();
      showAccount(currentUser,profile?.username);
      await refreshWallet();
      if(!ok) setStatus("Conta conectada, mas não foi possível carregar o progresso. Tente atualizar.",true);
    } else { ready=false; if(form) showAccount(null); }
    if(!form) {
      client.auth.onAuthStateChange(async(event,session)=>{ if(event==="SIGNED_OUT"){currentUser=null;ready=false;} });
      return;
    }
    form.addEventListener("submit",async e=>{
      e.preventDefault();
      const mode=$("#ht-auth-mode").value, email=$("#ht-auth-email").value.trim(), password=$("#ht-auth-password").value;
      const username=$("#ht-auth-username").value.trim().toLowerCase();
      const submit=$("#ht-auth-submit"); submit.disabled=true;
      try {
        if(mode==="signup") {
          if(!/^[a-z0-9_]{3,20}$/.test(username)) throw new Error("O nome público deve ter de 3 a 20 caracteres: letras minúsculas, números ou _.");
          if(password.length<8) throw new Error("A senha precisa ter pelo menos 8 caracteres.");
          if(!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) throw new Error("A senha deve conter pelo menos uma letra minúscula, uma letra maiúscula e um número.");
          const {data,error}=await client.auth.signUp({email,password,options:{data:{username},emailRedirectTo:"https://hattrickdor.com.br/perfil.html"}});
          if(error) {
            if(/Password should contain at least one character/i.test(error.message||"")) throw new Error("A senha deve conter pelo menos uma letra minúscula, uma letra maiúscula e um número.");
            throw error;
          }
          if(data.session) { currentUser=data.user; const ok=await loadRemote(currentUser); showAccount(currentUser,username); await refreshWallet(); setStatus(ok?"Conta criada e conectada!":"Conta criada, mas houve uma falha ao carregar o progresso.",!ok); }
          else setStatus("Cadastro iniciado! Confirme o e-mail enviado para ativar sua conta. Depois, entre por aqui.");
        } else {
          const {data,error}=await client.auth.signInWithPassword({email,password}); if(error) throw error;
          currentUser=data.user; const ok=await loadRemote(currentUser);
          const {data:profile}=await client.from("profiles").select("username").eq("id",currentUser.id).maybeSingle();
          showAccount(currentUser,profile?.username);
          await refreshWallet();
          setStatus(ok?"Login realizado e progresso carregado!":"Login realizado, mas houve uma falha ao buscar o progresso. Atualize a página e, se persistir, me envie o erro do Console (F12).",!ok);
          if(!ok) console.error("Detalhe da falha ao carregar progresso:", lastLoadError);
        }
      } catch(err) { setStatus(err.message||"Não foi possível concluir. Confira os dados e tente novamente.",true); }
      finally { submit.disabled=false; }
    });
    $("#ht-auth-toggle")?.addEventListener("click",()=>switchMode($("#ht-auth-mode").value==="signup"?"login":"signup"));
    $("#ht-auth-recovery")?.addEventListener("click",async()=>{
      const email=$("#ht-auth-email").value.trim(); if(!email){setStatus("Digite seu e-mail no campo acima para receber o link de recuperação.",true);return;}
      const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:"https://hattrickdor.com.br/perfil.html"});
      setStatus(error?error.message:"Se o endereço estiver cadastrado, enviaremos um link para redefinir sua senha.",!!error);
    });
    $("#ht-auth-signout")?.addEventListener("click",async()=>{
      const {error}=await client.auth.signOut(); if(error){setStatus(error.message,true);return;}
      currentUser=null; ready=false;
      let guest=null; try{guest=JSON.parse(localStorage.getItem("ht-guest-backup-v1")||"null");}catch{}
      KEYS.forEach(k=>{const value=guest&&Object.prototype.hasOwnProperty.call(guest,k)?guest[k]:null;if(value!==null)originalSet.call(localStorage,k,value);else if(defaults[k])originalSet.call(localStorage,k,defaults[k]);else originalRemove.call(localStorage,k);});
      originalRemove.call(localStorage,"ht-guest-backup-v1");
      showAccount(null); await refreshWallet(); setStatus("Você saiu da conta. O progresso da conta não fica neste navegador.");
      window.dispatchEvent(new CustomEvent("ht:collection-updated"));window.dispatchEvent(new CustomEvent("ht:achievements-updated"));window.dispatchEvent(new Event("ht:club-updated"));
    });
    if(new URLSearchParams(location.hash.slice(1)).get("type")==="recovery") {
      const next=$("#ht-auth-new-password"); if(next) next.hidden=false;
    }
    $("#ht-auth-update-password")?.addEventListener("click",async()=>{
      const password=$("#ht-auth-new-password-value").value;
      if(password.length<8){setStatus("A nova senha precisa ter pelo menos 8 caracteres.",true);return;}
      if(!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)){setStatus("A senha deve conter pelo menos uma letra minúscula, uma letra maiúscula e um número.",true);return;}
      const {error}=await client.auth.updateUser({password});
      setStatus(error?( /Password should contain at least one character/i.test(error.message||"") ? "A senha deve conter pelo menos uma letra minúscula, uma letra maiúscula e um número." : error.message):"Senha atualizada com sucesso.",!!error);
      if(!error) $("#ht-auth-new-password").hidden=true;
    });
    client.auth.onAuthStateChange(async(event,session)=>{
      if(event==="PASSWORD_RECOVERY") { const next=$("#ht-auth-new-password");if(next)next.hidden=false; }
      if(event==="SIGNED_OUT") { currentUser=null;ready=false; }
    });
  }
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden") saveRemote();});
  window.HT_CLOUD_READY=initAuth();
})();

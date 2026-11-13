/* PASSO 808 — inscrição no card de Modos Online. Somente Competitivo. */
(()=>{'use strict';
const card=document.getElementById('ht-competitive-entry');
if(!card)return;
let pending=false;
function feedback(message,isError=false){let el=document.getElementById('ht-competitive-feedback');if(!el){el=document.createElement('p');el.id='ht-competitive-feedback';el.setAttribute('role','status');el.style.cssText='padding:12px 16px;border:1px solid #a98c53;border-radius:8px;background:#15221b;color:#f1d9a0;margin:12px 0';card.insertAdjacentElement('afterend',el)}el.textContent=message;el.style.borderColor=isError?'#d16b6b':'#a98c53'}
function go(){location.href='competitivo.html'}
card.addEventListener('click',async ev=>{
 ev.preventDefault();if(pending)return;pending=true;card.style.pointerEvents='none';
 try{
  const db=window.HT_SUPABASE;
  if(!db)throw Error('Supabase indisponível. Atualize a página.');
  const {data:auth,error:ae}=await db.auth.getUser();
  if(ae||!auth?.user){feedback('Faça login pelo Perfil para participar do Competitivo.',true);return}
  feedback('Verificando sua inscrição no Competitivo…');
  const {data:entries,error:ee}=await db.from('tournament_players').select('tournament_id,joined_at').eq('user_id',auth.user.id).order('joined_at',{ascending:false}).limit(20);
  if(ee)throw Error('Não foi possível verificar sua inscrição: '+ee.message);
  for(const e of entries||[]){const {data:t,error:te}=await db.from('online_tournaments').select('mode,status').eq('id',e.tournament_id).maybeSingle();if(te)throw Error('Não foi possível verificar o torneio: '+te.message);if(t?.mode==='competitive'&&['forming','in_progress'].includes(t.status)){go();return}}
  const {data:w,error:we}=await db.from('player_wallet').select('balance,reserved_balance').eq('user_id',auth.user.id).maybeSingle();
  if(we)throw Error('Não foi possível consultar sua carteira: '+we.message);
  const available=Number(w?.balance||0)-Number(w?.reserved_balance||0);
  if(available<1000){feedback('Saldo insuficiente: são necessárias 1.000 fichas disponíveis. Você tem '+available.toLocaleString('pt-BR')+'.',true);return}
  if(!confirm('Inscrever-se no Torneio Competitivo?\n\nSerão reservadas 1.000 fichas. A cobrança definitiva acontece quando 16 jogadores completarem a fila.')){feedback('Inscrição não realizada.');return}
  feedback('Inscrevendo você no torneio…');
  const {error:je}=await db.rpc('join_competitive_queue');
  if(je)throw Error(je.message);
  go();
 }catch(e){console.error('[Competitivo]',e);feedback(e.message||'Falha na inscrição.',true)}
 finally{pending=false;card.style.pointerEvents=''}
});
})();

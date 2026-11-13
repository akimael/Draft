-- PASSO 1031: executar uma única vez no SQL Editor (sem apagar funções existentes).
CREATE OR REPLACE FUNCTION public.ht_get_offline_penalty_state(p_campaign_id uuid,p_match_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $fn$
DECLARE v_match public.campaign_bracket_matches%ROWTYPE;
 v_events jsonb; v_revealed jsonb; v_round integer; v_total integer; v_a integer; v_b integer;
BEGIN
 SELECT m.* INTO v_match FROM public.campaign_bracket_matches m
 JOIN public.campaign_runs c ON c.id=m.campaign_id
 WHERE m.id=p_match_id AND m.campaign_id=p_campaign_id AND c.user_id=auth.uid()
 AND c.status='active' AND c.current_round=m.round_number
 AND (m.side_a_seed=1 OR m.side_b_seed=1);
 IF NOT FOUND OR v_match.status <> 'in_progress' OR v_match.arena_started_at IS NULL
 THEN RAISE EXCEPTION 'Confronto indisponível.'; END IF;
 IF public.ht_offline_arena_minute(v_match.arena_started_at)<90
 THEN RAISE EXCEPTION 'Aguarde os 90 minutos.'; END IF;
 IF COALESCE((v_match.match_data->>'requires_penalties')::boolean,false) IS NOT TRUE
 THEN RAISE EXCEPTION 'Partida sem pênaltis.'; END IF;
 v_events:=COALESCE(v_match.match_data #> '{penalties,events}','[]'::jsonb);
 SELECT COALESCE(MAX((e.value->>'round')::integer),0) INTO v_total
 FROM jsonb_array_elements(v_events) e(value);
 IF v_total=0 THEN RAISE EXCEPTION 'Cobranças não encontradas.'; END IF;
 v_round:=LEAST(GREATEST(COALESCE(v_match.penalty_round_revealed,0),0),v_total);
 SELECT COALESCE(jsonb_agg(e.value ORDER BY e.ordinality),'[]'::jsonb)
 INTO v_revealed FROM jsonb_array_elements(v_events) WITH ORDINALITY e(value,ordinality)
 WHERE (e.value->>'round')::integer<=v_round;
 SELECT COUNT(*) FILTER(WHERE e.value->>'side'='A' AND (e.value->>'scored')::boolean),
 COUNT(*) FILTER(WHERE e.value->>'side'='B' AND (e.value->>'scored')::boolean)
 INTO v_a,v_b FROM jsonb_array_elements(v_revealed) e(value);
 RETURN jsonb_build_object('success',true,'match_id',v_match.id,
 'round_revealed',v_round,'penalties_a',v_a,'penalties_b',v_b,
 'events',v_revealed,'finished',v_round>=v_total);
END;$fn$;

CREATE OR REPLACE FUNCTION public.ht_take_offline_penalty_safe(
 p_campaign_id uuid,p_match_id uuid,p_expected_round integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $fn$
DECLARE v_current integer;
BEGIN
 IF p_expected_round IS NULL OR p_expected_round<0
 THEN RAISE EXCEPTION 'Rodada esperada inválida.'; END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_campaign_id::text,917));
 SELECT COALESCE(m.penalty_round_revealed,0) INTO v_current
 FROM public.campaign_bracket_matches m JOIN public.campaign_runs c ON c.id=m.campaign_id
 WHERE m.id=p_match_id AND m.campaign_id=p_campaign_id AND c.user_id=auth.uid()
 AND c.status='active' AND c.current_round=m.round_number
 AND (m.side_a_seed=1 OR m.side_b_seed=1) AND m.status='in_progress'
 FOR UPDATE OF m;
 IF NOT FOUND THEN RAISE EXCEPTION 'Confronto indisponível.'; END IF;
 IF v_current<>p_expected_round THEN
   RETURN public.ht_get_offline_penalty_state(p_campaign_id,p_match_id);
 END IF;
 RETURN public.ht_take_offline_penalty(p_campaign_id,p_match_id);
END;$fn$;
REVOKE ALL ON FUNCTION public.ht_get_offline_penalty_state(uuid,uuid) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.ht_take_offline_penalty_safe(uuid,uuid,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.ht_get_offline_penalty_state(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ht_take_offline_penalty_safe(uuid,uuid,integer) TO authenticated;

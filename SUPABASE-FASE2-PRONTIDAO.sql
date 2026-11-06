-- Fase 2: escalação e prontidão. Não inicia partidas nem concede fichas.
-- Requer as tabelas online_rooms e online_room_players da fase 1.
ALTER TABLE public.online_room_players ADD COLUMN IF NOT EXISTS player_ids text[];
ALTER TABLE public.online_room_players ADD COLUMN IF NOT EXISTS captain_id text;
ALTER TABLE public.online_room_players ADD COLUMN IF NOT EXISTS tactic text;
ALTER TABLE public.online_room_players ADD COLUMN IF NOT EXISTS club_name text;
ALTER TABLE public.online_room_players ADD COLUMN IF NOT EXISTS updated_at timestamptz;

CREATE OR REPLACE FUNCTION public.ht_submit_casual_lineup(p_room_id uuid, p_player_ids text[], p_captain_id text, p_tactic text, p_club_name text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_user uuid := auth.uid(); v_room public.online_rooms%ROWTYPE; v_count integer;
BEGIN
 IF v_user IS NULL THEN RAISE EXCEPTION 'Faça login.'; END IF;
 SELECT * INTO v_room FROM public.online_rooms WHERE id=p_room_id FOR UPDATE;
 IF NOT FOUND OR v_room.expires_at <= now() OR v_room.status NOT IN ('waiting','ready') THEN RAISE EXCEPTION 'Sala indisponível.'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.online_room_players WHERE room_id=p_room_id AND user_id=v_user) THEN RAISE EXCEPTION 'Você não participa desta sala.'; END IF;
 IF p_player_ids IS NULL OR cardinality(p_player_ids) <> 3 OR
    (SELECT count(DISTINCT x) FROM unnest(p_player_ids) x) <> 3 OR
    EXISTS(SELECT 1 FROM unnest(p_player_ids) x WHERE x IS NULL OR length(btrim(x)) NOT BETWEEN 1 AND 120)
 THEN RAISE EXCEPTION 'Escolha três cartas diferentes.'; END IF;
 IF p_captain_id IS NULL OR NOT (p_captain_id=ANY(p_player_ids)) THEN RAISE EXCEPTION 'Capitão inválido.'; END IF;
 IF p_tactic NOT IN ('balanced','attack','defense','press') OR p_tactic IS NULL THEN RAISE EXCEPTION 'Estratégia inválida.'; END IF;
 IF p_club_name IS NULL OR length(btrim(p_club_name)) NOT BETWEEN 1 AND 40 THEN RAISE EXCEPTION 'Nome do clube inválido.'; END IF;
 UPDATE public.online_room_players SET player_ids=p_player_ids, captain_id=p_captain_id, tactic=p_tactic,
 club_name=btrim(p_club_name),ready=false,updated_at=now() WHERE room_id=p_room_id AND user_id=v_user;
 UPDATE public.online_rooms SET status='waiting' WHERE id=p_room_id AND status='ready';
 RETURN jsonb_build_object('saved',true,'ready',false);
END; $$;

CREATE OR REPLACE FUNCTION public.ht_set_casual_ready(p_room_id uuid, p_ready boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_user uuid := auth.uid(); v_room public.online_rooms%ROWTYPE; v_total integer; v_ready integer;
BEGIN
 IF v_user IS NULL THEN RAISE EXCEPTION 'Faça login.'; END IF;
 SELECT * INTO v_room FROM public.online_rooms WHERE id=p_room_id FOR UPDATE;
 IF NOT FOUND OR v_room.expires_at<=now() OR v_room.status NOT IN ('waiting','ready') THEN RAISE EXCEPTION 'Sala indisponível.'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.online_room_players WHERE room_id=p_room_id AND user_id=v_user) THEN RAISE EXCEPTION 'Acesso negado.'; END IF;
 IF p_ready IS NULL THEN RAISE EXCEPTION 'Estado inválido.'; END IF;
 IF p_ready AND NOT EXISTS(SELECT 1 FROM public.online_room_players WHERE room_id=p_room_id AND user_id=v_user
 AND cardinality(player_ids)=3 AND captain_id=ANY(player_ids) AND tactic IS NOT NULL) THEN RAISE EXCEPTION 'Salve sua escalação primeiro.'; END IF;
 UPDATE public.online_room_players SET ready=p_ready,updated_at=now() WHERE room_id=p_room_id AND user_id=v_user;
 SELECT count(*),count(*) FILTER (WHERE ready) INTO v_total,v_ready FROM public.online_room_players WHERE room_id=p_room_id;
 UPDATE public.online_rooms SET status=CASE WHEN v_room.mode='x1_casual' AND v_total=2 AND v_ready=2 THEN 'ready' ELSE 'waiting' END WHERE id=p_room_id;
 RETURN jsonb_build_object('members',v_total,'ready_count',v_ready,'all_ready',v_room.mode='x1_casual' AND v_total=2 AND v_ready=2);
END; $$;

CREATE OR REPLACE FUNCTION public.ht_get_casual_room(p_room_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_user uuid := auth.uid(); v_room public.online_rooms%ROWTYPE; v_total integer; v_ready integer; v_my_ready boolean; v_has_lineup boolean;
BEGIN
 IF v_user IS NULL THEN RAISE EXCEPTION 'Faça login.'; END IF;
 SELECT * INTO v_room FROM public.online_rooms WHERE id=p_room_id AND expires_at>now();
 IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM public.online_room_players WHERE room_id=p_room_id AND user_id=v_user)
 THEN RAISE EXCEPTION 'Sala não encontrada ou acesso negado.'; END IF;
 SELECT count(*),count(*) FILTER(WHERE ready) INTO v_total,v_ready FROM public.online_room_players WHERE room_id=p_room_id;
 SELECT ready,cardinality(player_ids)=3 INTO v_my_ready,v_has_lineup FROM public.online_room_players WHERE room_id=p_room_id AND user_id=v_user;
 RETURN jsonb_build_object('id',v_room.id,'code',v_room.room_code,'mode',v_room.mode,'members',v_total,
 'max_players',v_room.max_players,'status',v_room.status,'ready_count',v_ready,'my_ready',v_my_ready,'has_lineup',coalesce(v_has_lineup,false));
END; $$;

REVOKE ALL ON FUNCTION public.ht_submit_casual_lineup(uuid,text[],text,text,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.ht_set_casual_ready(uuid,boolean) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.ht_get_casual_room(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.ht_submit_casual_lineup(uuid,text[],text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ht_set_casual_ready(uuid,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ht_get_casual_room(uuid) TO authenticated;

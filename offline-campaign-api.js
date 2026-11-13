
/* HAT-TRICK d'OR — PASSO 1010
 * Integração segura da campanha offline com Supabase.
 */

(() => {
  'use strict';

  const getClient = () => {
    const client = window.HT_SUPABASE;

    if (!client) {
      throw new Error(
        'Supabase indisponível. Atualize a página.'
      );
    }

    return client;
  };

  async function rpc(name, args = {}) {
    const { data, error } =
      await getClient().rpc(name, args);

    if (error) {
      throw new Error(
        error.message || `Erro na função ${name}.`
      );
    }

    return data;
  }

  const args = campaignId => ({
    p_campaign_id: campaignId
  });

  const assertId = id => {
    if (typeof id !== 'string' || !id.trim()) {
      throw new Error(
        'Identificador de campanha inválido.'
      );
    }

    return id;
  };

  const api = Object.freeze({

    async authenticated() {
      const { data, error } =
        await getClient().auth.getUser();

      if (error) {
        throw new Error(error.message);
      }

      return Boolean(data?.user);
    },

    start: () =>
      rpc('ht_start_offline_campaign'),

    offer: (id, stage) => {
      assertId(id);

      if (![1, 2].includes(stage)) {
        throw new Error('Etapa inválida.');
      }

      return rpc(
        'ht_get_offline_campaign_offer',
        {
          ...args(id),
          p_stage: stage
        }
      );
    },

    choose: (id, stage, playerId) => {
      assertId(id);

      if (![1, 2].includes(stage)) {
        throw new Error('Etapa inválida.');
      }

      return rpc(
        'ht_choose_offline_campaign_card',
        {
          ...args(id),
          p_stage: stage,
          p_player_id: playerId
        }
      );
    },

    quiz: id =>
      rpc(
        'ht_get_offline_campaign_quiz',
        args(assertId(id))
      ),

    answer: (id, selectedIndex) => {
      assertId(id);

      if (
        !Number.isInteger(selectedIndex) ||
        selectedIndex < 0 ||
        selectedIndex > 3
      ) {
        throw new Error('Alternativa inválida.');
      }

      return rpc(
        'ht_answer_offline_campaign_quiz',
        {
          ...args(id),
          p_selected_index: selectedIndex
        }
      );
    },

    thirdOffer: id =>
      rpc(
        'ht_get_offline_campaign_third_offer',
        args(assertId(id))
      ),

    thirdChoose: (id, playerId) =>
      rpc(
        'ht_choose_offline_campaign_third_card',
        {
          ...args(assertId(id)),
          p_player_id: playerId
        }
      ),

    saveLineup: (
      id,
      playerIds,
      captainId,
      tactic,
      clubName
    ) =>
      rpc(
        'ht_save_offline_campaign_lineup',
        {
          ...args(assertId(id)),
          p_player_ids: playerIds,
          p_captain_id: captainId,
          p_tactic: tactic,
          p_club_name: clubName
        }
      ),

    prepare: id =>
      rpc(
        'ht_prepare_offline_campaign',
        args(assertId(id))
      ),

    nextRound: id =>
      rpc(
        'ht_prepare_offline_next_round',
        args(assertId(id))
      ),

    bracket: id =>
      rpc(
        'ht_get_offline_campaign_bracket',
        args(assertId(id))
      ),

    teams: (id, matchId) =>
      rpc(
        'ht_get_offline_arena_teams',
        {
          ...args(assertId(id)),
          p_match_id: matchId
        }
      ),

    startArena: (id, matchId) =>
      rpc(
        'ht_start_offline_arena',
        {
          ...args(assertId(id)),
          p_match_id: matchId
        }
      ),

    arenaState: (id, matchId) =>
      rpc(
        'ht_get_offline_arena_state',
        {
          ...args(assertId(id)),
          p_match_id: matchId
        }
      ),

    penaltyState: (id, matchId) =>
      rpc('ht_get_offline_penalty_state', { ...args(assertId(id)), p_match_id: matchId }),

    penalty: (id, matchId, expectedRound) =>
      rpc(
        'ht_take_offline_penalty_safe',
        {
          ...args(assertId(id)),
          p_match_id: matchId,
          p_expected_round: expectedRound
        }
      ),

    finishArena: (id, matchId) =>
      rpc(
        'ht_finish_offline_arena',
        {
          ...args(assertId(id)),
          p_match_id: matchId
        }
      )

  });

  window.HT_OFFLINE_CAMPAIGN_API = api;

})();

export const TRUST = {
  POSITIVE: {
    QUICK_SETTLE: { delta: +2, reason: 'quick_settle' },
    ON_TIME_STREAMS: { delta: +1, reason: 'on_time_streams' },
    MONTHLY_CLEAN_10: { delta: +5, reason: 'monthly_clean_10' },
  },
  NEGATIVE: {
    NO_SHOW: { delta: -10, reason: 'no_show' },
    STREAM_DROP: { delta: -6, reason: 'stream_drop' },
    ACCEPT_NO_CONFIRM: { delta: -4, reason: 'accept_no_confirm' },
    SCORE_MISMATCH: { delta: -8, reason: 'score_mismatch' },
    RAGE_CANCEL: { delta: -5, reason: 'rage_cancel' },
  },
  CLAMPS: { MIN: 0, MAX: 200, HIGH_WALL: 160 },
};


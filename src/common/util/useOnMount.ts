import * as React from 'react';

export const useOnMount = (fn: React.EffectCallback) => {
  return React.useEffect(fn, [fn])
}
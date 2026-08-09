import { useEffect, useState } from 'react';

export default function useDebounce(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(
    function () {
      const timer = setTimeout(function () {
        setDebounced(value);
      }, delayMs || 400);
      return function () {
        clearTimeout(timer);
      };
    },
    [value, delayMs]
  );

  return debounced;
}

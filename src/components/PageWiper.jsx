import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PageWiper = () => {
  const { pathname } = useLocation();
  const [run, setRun] = useState(false);
  const first = React.useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setRun(false);
    const restart = requestAnimationFrame(() => setRun(true));
    const done = setTimeout(() => setRun(false), 800);
    return () => {
      cancelAnimationFrame(restart);
      clearTimeout(done);
    };
  }, [pathname]);

  return <div className={`page-wiper${run ? ' run' : ''}`} aria-hidden="true" />;
};

export default PageWiper;

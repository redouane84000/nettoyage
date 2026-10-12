import React, { useEffect } from 'react';

let firstLoad = true;

const MotionPage = ({ children, fade = true }) => {
  const skipFade = firstLoad || !fade;

  useEffect(() => {
    firstLoad = false;
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={skipFade ? undefined : 'page-fade-in'}>
      {children}
    </div>
  );
};

export default MotionPage;

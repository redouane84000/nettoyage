import React, { useEffect, useRef } from 'react';
import { whenPageReady } from '../lib/whenPageReady';
import './RestoStage.css';

const RestoStage = () => {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    whenPageReady(550).then(() => {
      if (cancelled) return;
      return import('../lib/restoScene');
    }).then((mod) => {
      if (cancelled || !mod || !stageRef.current || !canvasRef.current) return;
      cleanup = mod.mountRestoScene({
        stage: stageRef.current,
        canvas: canvasRef.current,
      }) || (() => {});
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div className="resto-stage-wrap">
      <div className="resto-stage" ref={stageRef}>
        <canvas
          ref={canvasRef}
          aria-label="Maquette 3D d'un restaurant : un technicien lave les vitres, un autre nettoie le parquet."
        />
      </div>
    </div>
  );
};

export default RestoStage;

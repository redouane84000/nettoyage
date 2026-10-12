import React, { useEffect, useRef } from 'react';
import { whenPageReady } from '../lib/whenPageReady';
import './HouseStage.css';

const HouseStage = () => {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const hintRef = useRef(null);
  const modeRef = useRef(null);
  const modeTextRef = useRef(null);
  const stampRef = useRef(null);
  const hudRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    whenPageReady(550).then(() => {
      if (cancelled) return;
      return import('../lib/houseScene');
    }).then((mod) => {
      if (cancelled || !mod || !stageRef.current || !canvasRef.current) return;
      cleanup = mod.mountHouseScene({
        stage: stageRef.current,
        canvas: canvasRef.current,
        hint: hintRef.current,
        mode: modeRef.current,
        modeText: modeTextRef.current,
        stamp: stampRef.current,
        hud: hudRef.current,
      }) || (() => {});
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div className="house-stage-wrap">
      <div className="house-stage" ref={stageRef}>
        <canvas
          ref={canvasRef}
          aria-label="Maquette 3D : deux techniciens nettoient au jet haute pression la toiture, la façade et la terrasse d'une maison."
        />
        <p className="house-stage-mode is-auto" ref={modeRef}>
          <i />
          <span ref={modeTextRef}>Démonstration automatique</span>
        </p>
        <p className="house-stage-hint" ref={hintRef}>Survolez la maison pour diriger la lance</p>
        <div className="house-stage-stamp" ref={stampRef} hidden>
          <span>Contrôle qualité</span>
          <strong>100 % propre</strong>
        </div>
      </div>
      <ol className="house-hud" ref={hudRef} aria-label="Avancement du chantier de démonstration">
        <li data-k="roof">
          <span className="k">Toiture</span>
          <span className="v">0 %</span>
          <span className="p">22 € HT/m²</span>
          <span className="bar"><i /></span>
        </li>
        <li data-k="facade">
          <span className="k">Façade</span>
          <span className="v">0 %</span>
          <span className="p">16 € HT/m²</span>
          <span className="bar"><i /></span>
        </li>
        <li data-k="walls">
          <span className="k">Pignons</span>
          <span className="v">0 %</span>
          <span className="p">16 € HT/m²</span>
          <span className="bar"><i /></span>
        </li>
        <li data-k="terrace">
          <span className="k">Terrasse</span>
          <span className="v">0 %</span>
          <span className="p">9 € HT/m²</span>
          <span className="bar"><i /></span>
        </li>
      </ol>
    </div>
  );
};

export default HouseStage;

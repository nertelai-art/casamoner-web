'use client';

import { useImperativeHandle, useRef, type Ref } from 'react';
import styles from './SceneSteps.module.css';

export interface SceneStepsHandle {
  setActive(index: number, progress: number): void;
}

interface SceneStepsProps {
  ref?: Ref<SceneStepsHandle>;
  eyebrow: string;
  title: string;
  text: string;
  steps: readonly string[];
  tone?: 'light' | 'dark';
  /** h3 dins d'una secció; h2 quan l'escena és la secció. */
  titleLevel?: 2 | 3;
  titleId?: string;
}

/** Text de l'escena amb els passos narratius; el pas actiu el marca l'escena, sense re-render. */
export function SceneSteps({ ref, eyebrow, title, text, steps, tone = 'light', titleLevel = 3, titleId }: SceneStepsProps) {
  const Title = titleLevel === 2 ? 'h2' : 'h3';
  const list = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useImperativeHandle(ref, () => ({
    setActive(index, progress) {
      list.current?.querySelectorAll('li').forEach((li, i) => {
        li.dataset.state = i < index ? 'done' : i === index ? 'active' : 'todo';
      });
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
    },
  }));

  return (
    <div className={styles.copy} data-tone={tone}>
      <p className="eyebrow">{eyebrow}</p>
      <Title id={titleId} className={styles.title}>
        {title}
      </Title>
      <p className={styles.text}>{text}</p>
      <ol ref={list} className={styles.steps}>
        {steps.map((s, i) => (
          <li key={s} data-state="done">
            <span className={styles.index}>{String(i + 1).padStart(2, '0')}</span>
            {s}
          </li>
        ))}
      </ol>
      <span className={styles.track} aria-hidden="true">
        <span ref={bar} className={styles.bar} />
      </span>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element -- les capes reutilitzen el srcset optimitzat de getImageProps() */
import type { ComponentProps } from 'react';

/**
 * Una capa d'escena: la mateixa foto optimitzada, repetida i retallada.
 * Totes les capes comparteixen URL, així que el navegador la baixa un sol cop.
 * Per defecte és decorativa (`alt=""`); la capa final porta el text alternatiu.
 */
export function LayerImage({ alt = '', ...props }: ComponentProps<'img'>) {
  return <img alt={alt} draggable={false} {...props} />;
}

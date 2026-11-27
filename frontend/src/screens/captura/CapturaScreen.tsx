import { useState } from 'react';
import CapturaFormScreen from './CapturaFormScreen';
import CapturaListaScreen from './CapturaListaScreen';

export type CapturaInicial = { tipo: 'lista' } | { tipo: 'nuevo' } | { tipo: 'abrir'; id: number };

type Vista = { tipo: 'lista'; mensaje?: string } | { tipo: 'form'; id: number | null };

// Módulo "captura" del menú (permiso CAPTURAR): lista de registros y formulario PROESPINNA.
export default function CapturaScreen({ inicial }: { inicial: CapturaInicial }) {
  const [vista, setVista] = useState<Vista>(
    inicial.tipo === 'nuevo'
      ? { tipo: 'form', id: null }
      : inicial.tipo === 'abrir'
        ? { tipo: 'form', id: inicial.id }
        : { tipo: 'lista' },
  );

  if (vista.tipo === 'form') {
    return (
      <CapturaFormScreen
        key={vista.id ?? 'nuevo'}
        id={vista.id}
        onVolver={(mensaje) => setVista({ tipo: 'lista', mensaje })}
      />
    );
  }
  return (
    <CapturaListaScreen
      key={vista.mensaje ?? 'lista'}
      mensaje={vista.mensaje}
      onNuevo={() => setVista({ tipo: 'form', id: null })}
      onAbrir={(id) => setVista({ tipo: 'form', id })}
    />
  );
}

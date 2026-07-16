import { useCallback, useEffect, useRef } from 'react';

/**
 * Beep de dos tonos generado con Web Audio API, sin depender de ningún
 * archivo de audio. Reemplazable por un <audio> con un mp3 propio si
 * más adelante quieren un sonido custom.
 */
function reproducirBeep(ctx: AudioContext) {
  const duracion = 0.15;
  const ahora = ctx.currentTime;

  [880, 1046.5].forEach((frecuencia, i) => {
    const oscilador = ctx.createOscillator();
    const ganancia = ctx.createGain();
    const inicio = ahora + i * (duracion + 0.05);

    oscilador.type = 'sine';
    oscilador.frequency.value = frecuencia;

    ganancia.gain.setValueAtTime(0, inicio);
    ganancia.gain.linearRampToValueAtTime(0.3, inicio + 0.01);
    ganancia.gain.linearRampToValueAtTime(0, inicio + duracion);

    oscilador.connect(ganancia);
    ganancia.connect(ctx.destination);
    oscilador.start(inicio);
    oscilador.stop(inicio + duracion);
  });
}

/**
 * Detecta pedidos nuevos comparando los idPedido de cada poll contra
 * los del poll anterior, y dispara un beep cuando aparece alguno.
 * No suena en el primer fetch (solo inicializa el set conocido).
 */
export function useNewOrderAlarm() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const idsConocidosRef = useRef<Set<string> | null>(null);

  // Los navegadores bloquean el audio hasta la primera interacción del
  // usuario en la pestaña; esto "desbloquea" el AudioContext apenas
  // alguien hace click o toca una tecla (por ejemplo, al loguearse).
  useEffect(() => {
    const desbloquear = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
    };

    window.addEventListener('click', desbloquear);
    window.addEventListener('keydown', desbloquear);
    return () => {
      window.removeEventListener('click', desbloquear);
      window.removeEventListener('keydown', desbloquear);
    };
  }, []);

  const notificarPedidosPendientes = useCallback((idsActuales: string[]) => {
    const setActual = new Set(idsActuales);

    if (idsConocidosRef.current === null) {
      idsConocidosRef.current = setActual;
      return;
    }

    const hayNuevos = idsActuales.some((id) => !idsConocidosRef.current!.has(id));
    idsConocidosRef.current = setActual;

    if (!hayNuevos) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      reproducirBeep(audioCtxRef.current);
    } catch (err) {
      console.warn('No se pudo reproducir la alarma de pedido nuevo:', err);
    }
  }, []);

  return { notificarPedidosPendientes };
}

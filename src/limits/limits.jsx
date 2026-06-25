import React, { useState } from 'react';
import { useTranslation } from '../languajes/i18n';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';

export default function CalculadoraLimitesPro() {
  const { t } = useTranslation();
  const [numerador, setNumerador] = useState('sin(x) - x');
  const [denominador, setDenominador] = useState('x^3');
  const [tendencia, setTendencia] = useState('0');
  const [resultado, setResultado] = useState('');
  const [pasos, setPasos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [showProcedimientoExpanded, setShowProcedimientoExpanded] = useState(false);

  // Helpers: normalization and numeric/lateral checks
  const normalizeExpression = (expr) => {
    if (!expr || typeof expr !== 'string') return expr;
    // Common student synonyms -> nerdamer equivalents
    return expr
      .replace(/\bln\s*\(/gi, 'log(')
      // keep `exp()` as-is because Nerdamer understands it
      .replace(/\bPI\b/gi, 'pi');
  };

  const containsAbsOrSgn = (expr) => {
    if (!expr || typeof expr !== 'string') return false;
    return /\babs\s*\(|\bsgn\s*\(|\bsign\s*\(/i.test(expr);
  };

  const isOscillatoryByPattern = (expr, point) => {
    if (!expr || typeof expr !== 'string') return false;
    // detect common oscillatory patterns like sin(1/x) or cos(1/x) (or around x - a)
    const p = expr.replace(/\s+/g, '');
    // sin(1/x), cos(1/x), tan(1/x)
    if (/\b(?:sin|cos|tan)\s*\(\s*1\s*\/\s*x\s*\)/i.test(p)) return true;
    // sin(1/(x-a)) or sin(1/(x+a)) and variants
    if (/\b(?:sin|cos|tan)\s*\(\s*1\s*\/\s*\(\s*x\s*[+\-]\s*\d+\s*\)\s*\)/i.test(p)) return true;
    // more general: trig(1/(x ...) )
    if (/\b(?:sin|cos|tan)\s*\(\s*1\s*\/\s*\(?.*x.*\)?\s*\)/i.test(p)) return true;
    return false;
  };

  const isUnresolvedSymbolic = (resStr) => {
    if (!resStr || typeof resStr !== 'string') return false;
    const s = resStr.toLowerCase();
    return s.includes('limit(') || s.includes('diff(') || s.includes('integrate(') || s.includes('derive(') || s.includes('d(');
  };

  const evalNumeric = (exprRaw, xValue) => {
    try {
      const expr = normalizeExpression(exprRaw);
      const substituted = nerdamer(expr).evaluate({ x: xValue });
      const asStr = substituted ? substituted.toString() : String(substituted);
      const asNum = Number(asStr);
      if (!isFinite(asNum)) return asStr; // could be 'Infinity' etc
      return asNum;
    } catch (e) {
      return NaN;
    }
  };

  const lateralEvaluate = (numExpr, denExpr, point) => {
    const eps = Math.max(1e-6, Math.abs(point) * 1e-6, 1e-6);
    const leftX = (isNaN(point) ? 0 : point) - eps;
    const rightX = (isNaN(point) ? 0 : point) + eps;

    const ln = normalizeExpression(numExpr);
    const ld = normalizeExpression(denExpr);

    const lnLeft = evalNumeric(ln, leftX);
    const lnRight = evalNumeric(ln, rightX);
    const ldLeft = evalNumeric(ld, leftX);
    const ldRight = evalNumeric(ld, rightX);

    const computeRatio = (n, d) => {
      if (d === 0 || d === '0' || d === 'Infinity' || d === '-Infinity') {
        // determine sign using n and d
        if (typeof n === 'number' && isFinite(n)) return (n > 0) ? '+Infinity' : (n < 0) ? '-Infinity' : 'NaN';
        return 'Infinity';
      }
      const nn = Number(n);
      const dd = Number(d);
      if (!isFinite(nn) || !isFinite(dd)) return (String(n).includes('-') || String(d).includes('-')) ? '-Infinity' : 'Infinity';
      return nn / dd;
    };

    const leftVal = computeRatio(lnLeft, ldLeft);
    const rightVal = computeRatio(lnRight, ldRight);

    return { leftVal, rightVal, leftX, rightX, lnLeft, lnRight, ldLeft, ldRight };
  };

  const limpiarParaAPI = (expr) => encodeURIComponent(expr.replace(/\s+/g, ''));

  const derivarConNewton = async (expresion) => {
    try {
      const response = await fetch(`https://newton.vercel.app/api/v2/derive/${limpiarParaAPI(expresion)}`);
      const data = await response.json();
      return data.result;
    } catch (error) {
      throw new Error(t('limits.messages.derivativeError'));
    }
  };

  const esInfinito = (val) => val === 'Infinity' || val === '-Infinity' || val === '∞' || val === '-∞';

  const calcularLimite = async () => {
    setCargando(true);
    setPasos([]);
    setResultado('');

    const noHayDenominador = !denominador.trim() || denominador.trim() === '1';

    // CASO 1: Sin denominador (Cálculo directo)
    if (noHayDenominador) {
      try {
        const normNum = normalizeExpression(numerador);
        // Detect oscillation even for direct limits
        if (isOscillatoryByPattern(normNum)) {
          setResultado(t('limits.messages.noExist'));
          setPasos([t('limits.messages.oscillationDetected'), t('limits.messages.noExist')]);
          setCargando(false);
          return;
        }

        const res = nerdamer.limit(normNum, 'x', tendencia).toString();
        // If Nerdamer couldn't resolve symbolically, try lateral numeric checks
        if (isUnresolvedSymbolic(res) || String(res).toLowerCase().includes('limit(')) {
          const isInfPoint = String(tendencia).toLowerCase().includes('inf');
          const point = isInfPoint ? NaN : Number(tendencia);
          if (!isInfPoint && !isNaN(point)) {
            const lateral = lateralEvaluate(numerador, '1', point);
            const format = (v) => {
              if (v === '+Infinity' || v === 'Infinity') return '+∞';
              if (v === '-Infinity') return '-∞';
              if (v === 'NaN') return 'No definido';
              if (typeof v === 'number') return String(v);
              return String(v);
            };
            const leftTxt = format(lateral.leftVal);
            const rightTxt = format(lateral.rightVal);
            setPasos([
              t('limits.messages.lateralLeft', { t: tendencia, value: leftTxt }),
              t('limits.messages.lateralRight', { t: tendencia, value: rightTxt })
            ]);
            if (leftTxt === rightTxt) {
              setResultado(leftTxt);
              setPasos(prev => [...prev, t('limits.messages.bothLateralsEqual', { value: leftTxt })]);
            } else {
              setResultado(t('limits.messages.noExist'));
              setPasos(prev => [...prev, t('limits.messages.lateralsDifferent')]);
            }
            setCargando(false);
            return;
          }

          setResultado(t('limits.messages.couldNotDetermineSymbolically'));
          setPasos([t('limits.messages.nerdamerFailed')]);
          setCargando(false);
          return;
        }

        setResultado(res);
        setPasos([t('limits.messages.directCalculated', { value: res })]);
      } catch (e) {
        setResultado(t('limits.messages.errorCalculating') + ' ' + e.message);
        setPasos([t('limits.messages.errorCalculating') + ' ' + e.message]);
      }
      setCargando(false);
      return;
    }

    // CASO 2: Con denominador (Bucle de L'Hôpital)
    let numActual = numerador;
    let denActual = denominador;
    let iteracion = 0;
    const MAX_ITERACIONES = 6;

    try {
      while (iteracion <= MAX_ITERACIONES) {
        setPasos(prev => [...prev, t('limits.messages.attempt', { n: iteracion + 1, t: tendencia })]);

        let limNum, limDen;
        try {
          const normNum = normalizeExpression(numActual);
          const normDen = normalizeExpression(denActual);
          const exprNum = nerdamer.limit(normNum, 'x', tendencia).toString();
          const exprDen = nerdamer.limit(normDen, 'x', tendencia).toString();

          // FORZAR EVALUACIÓN: Convierte "e^0 - 1" a "0" para comparaciones correctas
          try { limNum = nerdamer(exprNum).evaluate().toString(); } catch(e) { limNum = exprNum; }
          try { limDen = nerdamer(exprDen).evaluate().toString(); } catch(e) { limDen = exprDen; }
        } catch (e) {
          throw new Error(t('limits.messages.invalidSyntax'));
        }

        const esCeroSobreCero = (limNum === '0' && limDen === '0');
        const esInfSobreInf = esInfinito(limNum) && esInfinito(limDen);

        // If expressions are oscillatory, do not apply L'Hôpital; report non-existence
        if (isOscillatoryByPattern(numActual) || isOscillatoryByPattern(denActual)) {
          setPasos(prev => [...prev, t('limits.messages.oscillationNoLHopital')]);
          setResultado(t('limits.messages.noExist'));
          break;
        }

        if (esCeroSobreCero || esInfSobreInf) {
          const tipoIndet = esCeroSobreCero ? '0/0' : '∞/∞';
          setPasos(prev => [...prev, t('limits.messages.detectedIndet', { type: tipoIndet })]);

          if (iteracion === MAX_ITERACIONES) {
            throw new Error(t('limits.messages.maxIterationsReached'));
          }

          numActual = await derivarConNewton(normalizeExpression(numActual));
          denActual = await derivarConNewton(normalizeExpression(denActual));

          setPasos(prev => [...prev, t('limits.messages.derivatives', { num: numActual, den: denActual })]);
          iteracion++;

        } else if (limDen === '0' && limNum !== '0') {
          // Posible infinito: evaluar laterales automáticamente y manejar abs/sgn/oscilaciones
          const isInfPoint = String(tendencia).toLowerCase().includes('inf');
          const point = isInfPoint ? NaN : Number(tendencia);

          // If abs/sgn present or denominator -> 0 we do lateral check
          if (!isInfPoint) {
            const lateral = lateralEvaluate(numActual, denActual, point);
            const format = (v) => {
              if (v === '+Infinity' || v === 'Infinity') return '+∞';
              if (v === '-Infinity') return '-∞';
              if (v === 'NaN') return 'No definido';
              if (typeof v === 'number') return String(v);
              return String(v);
            };

            const leftTxt = format(lateral.leftVal);
            const rightTxt = format(lateral.rightVal);

            setPasos(prev => [...prev,
              t('limits.messages.lateralLeft', { t: tendencia, value: leftTxt }),
              t('limits.messages.lateralRight', { t: tendencia, value: rightTxt })
            ]);

            if (leftTxt === rightTxt) {
              setResultado(leftTxt);
              setPasos(prev => [...prev, t('limits.messages.bothLateralsEqual', { value: leftTxt })]);
            } else {
              setResultado(t('limits.messages.noExist'));
              setPasos(prev => [...prev, t('limits.messages.lateralsDifferent')]);
            }
            break;
          } else {
            const signo = Number(limNum) > 0 ? '+∞' : '-∞';
            setResultado(signo + ' (infinito)');
            setPasos(prev => [...prev, t('limits.messages.numeratorNotZeroDenZero')]);
            break;
          }
        } else {
          // Antes de aceptar el resultado simbólico, detectar oscilaciones o abs/sgn
          const fullFunc = `(${numActual})/(${denActual})`;
          if (!String(tendencia).toLowerCase().includes('inf')) {
            if (isOscillatoryByPattern(numActual) || isOscillatoryByPattern(denActual) || containsAbsOrSgn(numActual) || containsAbsOrSgn(denActual)) {
              // Do lateral numeric check
              const point = Number(tendencia);
              if (!isNaN(point)) {
                const lateral = lateralEvaluate(numActual, denActual, point);
                const format = (v) => {
                  if (v === '+Infinity' || v === 'Infinity') return '+∞';
                  if (v === '-Infinity') return '-∞';
                  if (v === 'NaN') return 'No definido';
                  if (typeof v === 'number') return String(v);
                  return String(v);
                };
                const leftTxt = format(lateral.leftVal);
                const rightTxt = format(lateral.rightVal);
                if (leftTxt === rightTxt) {
                  setResultado(leftTxt);
                  setPasos(prev => [...prev, t('limits.messages.directCalculated', { value: leftTxt })]);
                } else {
                  // oscillation or sign change
                  setResultado(t('limits.messages.noExist'));
                  setPasos(prev => [...prev,
                    t('limits.messages.lateralLeft', { t: tendencia, value: leftTxt }),
                    t('limits.messages.lateralRight', { t: tendencia, value: rightTxt }),
                    t('limits.messages.lateralsDifferent')
                  ]);
                }
                break;
              }
            }
          }

          const funcionCompleta = `(${normalizeExpression(numActual)})/(${normalizeExpression(denActual)})`;
          const limiteFinal = nerdamer.limit(funcionCompleta, 'x', tendencia).toString();
          // If Nerdamer returned unresolved symbolic, try lateral checks
          if (isUnresolvedSymbolic(limiteFinal) || String(limiteFinal).toLowerCase().includes('limit(')) {
            const point = Number(tendencia);
            if (!isNaN(point)) {
              const lateral = lateralEvaluate(numActual, denActual, point);
              const format = (v) => {
                if (v === '+Infinity' || v === 'Infinity') return '+∞';
                if (v === '-Infinity') return '-∞';
                if (v === 'NaN') return 'No definido';
                if (typeof v === 'number') return String(v);
                return String(v);
              };
              const leftTxt = format(lateral.leftVal);
              const rightTxt = format(lateral.rightVal);
              if (leftTxt === rightTxt) {
                setResultado(leftTxt);
                setPasos(prev => [...prev, t('limits.messages.directCalculated', { value: leftTxt })]);
              } else {
                  setResultado(t('limits.messages.noExist'));
                  setPasos(prev => [...prev,
                    t('limits.messages.lateralLeft', { t: tendencia, value: leftTxt }),
                    t('limits.messages.lateralRight', { t: tendencia, value: rightTxt }),
                    t('limits.messages.lateralsDifferent')
                  ]);
              }
            } else {
              setResultado(t('limits.messages.couldNotDetermineSymbolically'));
              setPasos(prev => [...prev, t('limits.messages.nerdamerFailed')]);
            }
          } else {
            setResultado(limiteFinal);
            setPasos(prev => [...prev, t('limits.messages.directCalculated', { value: limiteFinal })]);
          }
          break;
        }
      }
    } catch (error) {
      setResultado(t('limits.messages.couldNotDetermineSymbolically'));
      setPasos(prev => [...prev, t('limits.messages.errorCalculating') + ' ' + error.message]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-card rounded-md shadow-sm">
      <h2 className="text-2xl font-semibold text-center mb-4">{t('limits.calculator.heading')}</h2>

      <p className="text-sm text-muted-foreground mb-4">
        {t('limits.calculator.hint', { x: <strong>x</strong> })}
      </p>

      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('limits.calculator.numerator')}</label>
          <input
            className="w-full px-4 py-2 rounded-md bg-input border border-border text-foreground"
            type="text"
            value={numerador}
            onChange={e => setNumerador(e.target.value)}
            placeholder={t('limits.calculator.placeholder.numerator')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('limits.calculator.denominator')} <span className="text-xs text-muted-foreground">{t('limits.calculator.denominatorOptional')}</span></label>
          <input
            className="w-full px-4 py-2 rounded-md bg-input border border-border text-foreground"
            type="text"
            value={denominador}
            onChange={e => setDenominador(e.target.value)}
            placeholder={t('limits.calculator.placeholder.denominator')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('limits.calculator.whenTendsTo')}</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 px-4 py-2 rounded-md bg-input border border-border text-foreground"
              type="text"
              value={tendencia}
              onChange={e => setTendencia(e.target.value)}
              placeholder={t('limits.calculator.placeholder.tendency')}
            />
            <button type="button" onClick={() => setTendencia('Infinity')} className="w-full sm:w-auto px-3 py-2 rounded-md bg-muted text-sm">+∞</button>
            <button type="button" onClick={() => setTendencia('-Infinity')} className="w-full sm:w-auto px-3 py-2 rounded-md bg-muted text-sm">-∞</button>
          </div>
        </div>
      </div>

      <button
        onClick={calcularLimite}
        disabled={cargando}
        className={`w-full px-6 py-3 rounded-md text-sm text-white ${cargando ? 'bg-muted/60 cursor-not-allowed' : 'bg-primary hover:scale-105 hover:shadow-lg transition transform'}`}
      >
        {cargando ? t('limits.calculator.calculating') : t('limits.calculator.calculateButton')}
      </button>

      <div className="mt-5 p-4 bg-surface rounded-md border border-border">
        <h3 className="text-lg font-medium">{t('limits.calculator.result')}</h3>
        <p className="mt-2 text-xl font-semibold text-foreground">{resultado || (cargando ? '...' : '—')}</p>

        <div className="mt-4">
          <h4 className="text-sm font-medium">{t('limits.calculator.procedure')}</h4>
          <div className="mt-3 bg-muted/5 p-3 rounded-md border border-border">
            {pasos.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('limits.calculator.noSteps')}</p>
            ) : (
              <ol className="list-decimal list-inside text-sm text-foreground space-y-1">
                {pasos.map((paso, index) => (
                  <li key={index} className="py-0.5">{paso}</li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
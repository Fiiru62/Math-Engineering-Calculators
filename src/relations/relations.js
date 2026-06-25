// UTILIDADES PARA PARSEAR Y ANALIZAR RELACIONES BINARIAS
// Internacionalización: obtiene textos desde los JSON en src/languajes
import es from '../languajes/es.json';
import en from '../languajes/en.json';
import pt from '../languajes/pt.json';

const resources = { es, en, pt };

function t(key, vars) {
  const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('lang')) || 'es';
  const parts = key.split('.');
  let cur = resources[lang];
  for (const p of parts) {
    if (!cur) break;
    cur = cur[p];
  }
  let str = cur || key;
  if (vars && typeof str === 'string') {
    Object.keys(vars).forEach(k => {
      str = str.replace(new RegExp(`\\{\\s*${k}\\s*\\}`, 'g'), vars[k]);
    });
  }
  return str;
}

export function parseRelationText(text) {
  // Valida que haya texto
  if (!text || typeof text !== 'string') 
    return { error: t('relations.errors.emptyInput') };

  // Elimina las llaves externas si existen {}
  const trimmed = text.trim();
  const inside = trimmed.replace(/^\{\s*/,'').replace(/\s*\}$/,'');

  // Si quedó vacío, la relación es vacía
  if (inside.length === 0) 
    return { pairs: [], baseSet: [] };

  // Expresión regular para extraer pares del tipo (A,B)
  const pairRegex = /\(\s*([^,\s()]+)\s*,\s*([^,\s()]+)\s*\)/g;

  const pairs = [];
  let m;

  // Extrae todos los pares encontrados
  while ((m = pairRegex.exec(inside)) !== null) {
    pairs.push([m[1].trim(), m[2].trim()]);
  }

  // Si no se encontró ningún par válido
  if (pairs.length === 0) {
    return { error: t('relations.errors.noPairs') };
  }

  // Construye el conjunto base a partir de todos los elementos que aparecen
  const baseSet = Array.from(new Set(pairs.flat()));

  // Elimina pares duplicados
  const seen = new Set();
  const uniquePairs = [];

  for (const [a,b] of pairs) {
    const key = `${a}@@${b}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePairs.push([a,b]);
    }
  }

  return { pairs: uniquePairs, baseSet };
}

// Genera una clave única para cada par
function pairKey(a,b) { 
  return `${a}@@${b}`; 
}

// PROPIEDADES DE LA RELACIÓN

// Reflexiva: para todo x del conjunto base debe existir (x,x)
function isReflexive(pairs, baseSet) {
  const set = new Set(pairs.map(p=>pairKey(p[0],p[1])));
  const missing = [];

  for (const x of baseSet) {
    if (!set.has(pairKey(x,x))) 
      missing.push([x,x]);
  }

  const holds = missing.length === 0;
  return {
    holds,
    explanation: holds
      ? t('relationsUtils.reflexiveTrue')
      : t('relationsUtils.reflexiveFalse', { pairs: formatPairs(missing) }),
    evidence: missing
  };
}

// Irreflexiva: no debe existir ningún (x,x)
function isIrreflexive(pairs) {
  const reflexives = pairs.filter(([a,b])=>a===b);
  const holds = reflexives.length === 0;
  return {
    holds,
    explanation: holds
      ? t('relationsUtils.irreflexiveTrue')
      : t('relationsUtils.irreflexiveFalse', { pairs: formatPairs(reflexives) }),
    evidence: reflexives
  };
}

// Simétrica: si (a,b) está, debe estar (b,a)
function isSymmetric(pairs) {
  const set = new Set(pairs.map(p=>pairKey(p[0],p[1])));
  const counterexamples = [];

  for (const [a,b] of pairs) {
    if (!set.has(pairKey(b,a))) 
      counterexamples.push([[a,b],[b,a]]);
  }

  const holds = counterexamples.length === 0;
  return {
    holds,
    explanation: holds
      ? t('relationsUtils.symmetricTrue')
      : t('relationsUtils.symmetricFalse'),
    evidence: counterexamples
  };
}

// Asimétrica:
// 1) No puede haber (x,x)
// 2) Si (a,b) está, no puede estar (b,a)
function isAsymmetric(pairs) {
  const diag = pairs.filter(([a,b])=>a===b);
  const set = new Set(pairs.map(p=>pairKey(p[0],p[1])));
  const counterexamples = [];

  for (const [a,b] of pairs) {
    if (a !== b && set.has(pairKey(b,a))) {
      counterexamples.push([[a,b],[b,a]]);
    }
  }

  const holds = diag.length === 0 && counterexamples.length === 0;
  return {
    holds,
    explanation: holds
      ? t('relationsUtils.asymmetricTrue')
      : t('relationsUtils.asymmetricFalse'),
    evidence: { reflexives: diag, mutual: counterexamples }
  };
}

// Antisimétrica:
// Si (a,b) y (b,a) existen y a ≠ b, falla
function isAntisymmetric(pairs) {
  const set = new Set(pairs.map(p=>pairKey(p[0],p[1])));
  const counterexamples = [];

  for (const [a,b] of pairs) {
    if (a !== b && set.has(pairKey(b,a))) 
      counterexamples.push([[a,b],[b,a]]);
  }

  const holds = counterexamples.length === 0;
  return {
    holds,
    explanation: holds
      ? t('relationsUtils.antisymmetricTrue')
      : t('relationsUtils.antisymmetricFalse'),
    evidence: counterexamples
  };
}

// Transitiva:
// Si (a,b) y (b,c) existen, debe existir (a,c)
function isTransitive(pairs) {
  const set = new Set(pairs.map(p=>pairKey(p[0],p[1])));
  const failures = [];

  for (const [a,b] of pairs) {
    for (const [x,y] of pairs) {
      if (b === x) {
        if (!set.has(pairKey(a,y))) {
          failures.push({
            required: [a,y],
            from: [[a,b],[x,y]]
          });
        }
      }
    }
  }

  const holds = failures.length === 0;
  return {
    holds,
    explanation: holds
      ? t('relationsUtils.transitiveTrue')
      : t('relationsUtils.transitiveFalse'),
    evidence: failures
  };
}

// FUNCIÓN PRINCIPAL DE ANÁLISIS

export function analyzeRelation(pairs, baseSet) {
  return {
    reflexive: isReflexive(pairs, baseSet),
    irreflexive: isIrreflexive(pairs),
    symmetric: isSymmetric(pairs),
    asymmetric: isAsymmetric(pairs),
    antisymmetric: isAntisymmetric(pairs),
    transitive: isTransitive(pairs)
  };
}

// FUNCIONES AUXILIARES DE FORMATO

// Formatea un par como texto
function formatPair(p) { 
  return `(${p[0]},${p[1]})`; 
}

// Formatea una lista de pares
function formatPairs(list) { 
  return list.map(formatPair).join(', '); 
}

// Formatea una lista simple
function formatList(list) { 
  return list.length === 0 ? '∅' : list.join(', '); 
}
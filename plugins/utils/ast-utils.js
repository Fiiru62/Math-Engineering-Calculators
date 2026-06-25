import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverseBabel from '@babel/traverse';
import {
	isJSXIdentifier,
	isJSXMemberExpression,
} from '@babel/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VITE_PROJECT_ROOT = path.resolve(__dirname, '../../../..');

// Lista negra de componentes que no deben extraerse (componentes utilitarios/no visuales)
const COMPONENT_BLACKLIST = new Set([
	'Helmet',
	'HelmetProvider',
	'Head',
	'head',
	'Meta',
	'meta',
	'Script',
	'script',
	'NoScript',
	'noscript',
	'Style',
	'style',
	'title',
	'Title',
	'link',
	'Link',
]);

/**
 * Valida que una ruta de archivo sea segura para acceder
 * @param {string} filePath - Ruta de archivo relativa
 * @returns {{ isValid: boolean, absolutePath?: string, error?: string }} - Objeto que contiene el resultado de la validación
 */
export function validateFilePath(filePath) {
	if (!filePath) {
		return { isValid: false, error: 'Missing filePath' };
	}

	const absoluteFilePath = path.resolve(VITE_PROJECT_ROOT, filePath);

	if (filePath.includes('..')
		|| !absoluteFilePath.startsWith(VITE_PROJECT_ROOT)
		|| absoluteFilePath.includes('node_modules')) {
		return { isValid: false, error: 'Invalid path' };
	}

	if (!fs.existsSync(absoluteFilePath)) {
		return { isValid: false, error: 'File not found' };
	}

	return { isValid: true, absolutePath: absoluteFilePath };
}

/**
 * Parsea un archivo a un AST de Babel
 * @param {string} absoluteFilePath - Ruta absoluta al archivo
 * @returns {object} AST de Babel
 */
export function parseFileToAST(absoluteFilePath) {
	const content = fs.readFileSync(absoluteFilePath, 'utf-8');

	return parse(content, {
		sourceType: 'module',
		plugins: ['jsx', 'typescript'],
		errorRecovery: true,
	});
}

/**
 * Encuentra un elemento de apertura JSX en una línea y columna específicas
 * @param {object} ast - AST de Babel
 * @param {number} line - Número de línea (comenzando en 1)
 * @param {number} column - Número de columna (0-indexado para get-code-block, 1-indexado para apply-edit)
 * @returns {object | null} Ruta de Babel al elemento de apertura JSX
 */
export function findJSXElementAtPosition(ast, line, column) {
	let targetNodePath = null;
	let closestNodePath = null;
	let closestDistance = Infinity;
	const allNodesOnLine = [];

	const visitor = {
		JSXOpeningElement(path) {
			const node = path.node;
			if (node.loc) {
				// Coincidencia exacta (con tolerancia por diferencias de columna de uno)
				if (node.loc.start.line === line
					&& Math.abs(node.loc.start.column - column) <= 1) {
					targetNodePath = path;
					path.stop();
					return;
				}

				// Registrar todos los nodos en la misma línea
				if (node.loc.start.line === line) {
					allNodesOnLine.push({
						path,
						column: node.loc.start.column,
						distance: Math.abs(node.loc.start.column - column),
					});
				}

				// Registrar la coincidencia más cercana en la misma línea como fallback
				if (node.loc.start.line === line) {
					const distance = Math.abs(node.loc.start.column - column);
					if (distance < closestDistance) {
						closestDistance = distance;
						closestNodePath = path;
					}
				}
			}
		},
			// También verificar nodos JSXElement que contienen la posición
		JSXElement(path) {
			const node = path.node;
			if (!node.loc) {
				return;
			}

				// Comprobar si este elemento abarca la línea objetivo (para elementos multilínea)
			if (node.loc.start.line > line || node.loc.end.line < line) {
				return;
			}

				// Si estamos dentro del rango de este elemento, considerar su elemento de apertura
			if (!path.node.openingElement?.loc) {
				return;
			}

			const openingLine = path.node.openingElement.loc.start.line;
			const openingCol = path.node.openingElement.loc.start.column;

					// Preferir elementos que empiezan en la línea exacta
			if (openingLine === line) {
				const distance = Math.abs(openingCol - column);
				if (distance < closestDistance) {
					closestDistance = distance;
					closestNodePath = path.get('openingElement');
				}
				return;
			}

					// Manejar elementos que empiezan antes de la línea objetivo
			if (openingLine < line) {
				const distance = (line - openingLine) * 100; // Penalize by line distance
				if (distance < closestDistance) {
					closestDistance = distance;
					closestNodePath = path.get('openingElement');
				}
			}
		},
	};

	traverseBabel.default(ast, visitor);

	// Devolver coincidencia exacta si se encuentra; de lo contrario devolver la coincidencia más cercana si está dentro de una distancia razonable
	// Usar un umbral mayor (50 caracteres) para elementos en la misma línea, 5 líneas para elementos multilínea
	const threshold = closestDistance < 100 ? 50 : 500;
	return targetNodePath || (closestDistance <= threshold ? closestNodePath : null);
}

/**
 * Comprueba si el nombre de un elemento JSX está en la lista negra
 * @param {object} jsxOpeningElement - Nodo de elemento de apertura JSX de Babel
 * @returns {boolean} True si está en la lista negra
 */
function isBlacklistedComponent(jsxOpeningElement) {
	if (!jsxOpeningElement || !jsxOpeningElement.name) {
		return false;
	}

	// Manejar JSXIdentifier (p. ej., <Helmet>)
	if (isJSXIdentifier(jsxOpeningElement.name)) {
		return COMPONENT_BLACKLIST.has(jsxOpeningElement.name.name);
	}

	// Manejar JSXMemberExpression (p. ej., <React.Fragment>)
	if (isJSXMemberExpression(jsxOpeningElement.name)) {
		let current = jsxOpeningElement.name;
		while (isJSXMemberExpression(current)) {
			current = current.property;
		}
		if (isJSXIdentifier(current)) {
			return COMPONENT_BLACKLIST.has(current.name);
		}
	}

	return false;
}

/**
 * Genera código a partir de un nodo AST
 * @param {object} node - Nodo AST de Babel
 * @param {object} options - Opciones del generador
 * @returns {string} Código generado
 */
export function generateCode(node, options = {}) {
	const generateFunction = generate.default || generate;
	const output = generateFunction(node, options);
	return output.code;
}

/**
 * Genera un archivo fuente completo desde el AST con mapas de origen
 * @param {object} ast - AST de Babel
 * @param {string} sourceFileName - Nombre del archivo fuente para el mapa
 * @param {string} originalCode - Código fuente original
 * @returns {{code: string, map: object}} - Objeto que contiene el código generado y el mapa de origen
 */
export function generateSourceWithMap(ast, sourceFileName, originalCode) {
	const generateFunction = generate.default || generate;
	return generateFunction(ast, {
		sourceMaps: true,
		sourceFileName,
	}, originalCode);
}

/**
 * Extrae bloques de código de un elemento JSX en una ubicación específica
 * @param {string} filePath - Ruta de archivo relativa
 * @param {number} line - Número de línea
 * @param {number} column - Número de columna
 * @param {object} [domContext] - Contexto DOM opcional para devolver ante fallo
 * @returns {{success: boolean, filePath?: string, specificLine?: string, error?: string, domContext?: object}} - Objeto con metadatos para LLM
 */
export function extractCodeBlocks(filePath, line, column, domContext) {
	try {
		// Validar ruta de archivo
		const validation = validateFilePath(filePath);
		if (!validation.isValid) {
			return { success: false, error: validation.error, domContext };
		}

		// Parsear AST
		const ast = parseFileToAST(validation.absolutePath);

		// Encontrar nodo objetivo
		const targetNodePath = findJSXElementAtPosition(ast, line, column);

		if (!targetNodePath) {
			return { success: false, error: 'Target node not found at specified line/column', domContext };
		}

		// Comprobar si el nodo objetivo es un componente en la lista negra
		const isBlacklisted = isBlacklistedComponent(targetNodePath.node);

		if (isBlacklisted) {
			return {
				success: true,
				filePath,
				specificLine: '',
			};
		}

		// Obtener el código de la línea específica
		const specificLine = generateCode(targetNodePath.parentPath?.node || targetNodePath.node);

		return {
			success: true,
			filePath,
			specificLine,
		};
	} catch (error) {
		console.error('[ast-utils] Error extracting code blocks:', error);
		return { success: false, error: 'Failed to extract code blocks', domContext };
	}
}

/**
 * Ruta raíz del proyecto
 */
export { VITE_PROJECT_ROOT };

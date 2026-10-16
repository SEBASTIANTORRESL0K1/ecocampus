#!/usr/bin/env python3
"""
Analiza un documento .md (tesis/reporte en formato APA-ish, citas en español)
y genera un reporte con:
  1. Referencias bibliográficas con conteo de veces citadas (por apellido)
  2. Citas en el texto que NO tienen referencia correspondiente en la bibliografía
  3. Referencias en la bibliografía que NUNCA fueron citadas en el texto

Uso:
    python analizar_citas.py <ruta_al_md> [--out reporte_citas.md] [--ref-heading "Referencias"]

Limitaciones conocidas (heurísticas, no un parser APA completo):
  - Detecta citas parentéticas: (Apellido, 2020), (Apellido & Apellido2, 2020),
    (Apellido et al., 2020), (Apellido y Apellido2, 2020; Otro, 2019).
  - Detecta citas narrativas: Apellido (2020), Apellido y Apellido2 (2020), Apellido et al.
    (2020), incluyendo cuando van precedidas de "Según", "De acuerdo con", etc. (el patrón
    solo exige un nombre propio pegado a un paréntesis que contenga ÚNICAMENTE el año).
  - NO detecta citas sin ningún paréntesis, tipo "Apellido 2020" a secas.
  - El apellido de cada referencia se extrae de forma heurística (todo lo que precede a las
    iniciales tipo "L. F." antes del año). Autores institucionales (ej. "Global Footprint
    Network") se manejan como una sola "unidad".
  - El emparejamiento cita <-> referencia se hace por (apellido normalizado + año). Variantes de
    conector ("y" vs "&") se cuentan como citas distintas si así se pidió, pero para el cruce
    con la bibliografía se normalizan (el conector no debe impedir encontrar la referencia).
  - Siempre revisa manualmente los resultados marcados como "posible falso positivo/negativo"
    antes de tomarlos como definitivos.
"""

import argparse
import re
import sys
import unicodedata
from collections import defaultdict, OrderedDict

YEAR_RE = r'(1[89]\d{2}|20\d{2})[a-z]?'


def strip_accents(s):
    return ''.join(
        c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn'
    )


def normalize_surname(s):
    """Normaliza un apellido para comparación: minúsculas, sin acentos, sin espacios extra."""
    s = strip_accents(s).lower().strip()
    s = re.sub(r'[^a-z0-9 ]', '', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()


# ---------------------------------------------------------------------------
# 1. Extraer el bloque de referencias y parsear cada entrada
# ---------------------------------------------------------------------------

def find_references_block(text, ref_heading):
    """Devuelve el texto desde el encabezado de referencias hasta el final del documento
    (o hasta el siguiente encabezado de nivel 1 '# ')."""
    pattern = re.compile(
        r'^#{1,2}\s*\*{0,2}' + re.escape(ref_heading) + r'\*{0,2}\s*$',
        re.IGNORECASE | re.MULTILINE,
    )
    m = pattern.search(text)
    if not m:
        return None
    start = m.end()
    rest = text[start:]
    # cortar si aparece otro encabezado de nivel 1 después (apéndices, anexos, etc. se
    # incluyen salvo que empiecen con '# ' — un nuevo capítulo)
    m2 = re.search(r'^\#\s+\*{0,2}[A-ZÁÉÍÓÚÑ]', rest, re.MULTILINE)
    if m2:
        rest = rest[:m2.start()]
    return rest


def split_reference_entries(ref_block):
    """Cada referencia empieza con '<numero>. ' al inicio de línea (permitiendo líneas en
    blanco/indentación entre ellas, típico de exportes de Google Docs a .md)."""
    # Unificar saltos de línea sueltos dentro de una misma referencia: unimos líneas hasta
    # encontrar el patrón "N. " al inicio de una línea (ignorando líneas vacías).
    lines = ref_block.split('\n')
    entries = []
    current = []
    entry_start_re = re.compile(r'^\s*\d+\.\s+')
    for line in lines:
        if entry_start_re.match(line):
            if current:
                entries.append(' '.join(current).strip())
            current = [line.strip()]
        else:
            if line.strip():
                current.append(line.strip())
    if current:
        entries.append(' '.join(current).strip())
    return [e for e in entries if e.strip()]


INITIALS_TOKEN_RE = re.compile(r'^[A-ZÁÉÍÓÚÑ](\.[A-ZÁÉÍÓÚÑ]?)*\.?$')


def extract_surnames_from_reference(entry_text):
    """Heurística: toma el texto ANTES del primer '(añoYYYY)' y extrae los apellidos de cada
    autor. Cada autor suele venir como 'Apellido(s), Inicial. Inicial.' separado por ',' y el
    último por '&' o 'y'."""
    # quitar el número inicial "12. " y marcado markdown que ensucia nombres (negritas, etc.)
    body = re.sub(r'^\s*\d+\.\s*', '', entry_text)
    body = body.replace('**', '').replace('*', '')

    sf_match = re.search(r'\(\s*s\.?\s*f\.?\s*\)', body, re.IGNORECASE)
    year_match = re.search(r'\(\s*' + YEAR_RE + r'\s*[,)]', body)
    if not year_match:
        year_match = re.search(YEAR_RE, body)
    if not year_match and not sf_match:
        return [], None
    if year_match:
        year_norm = re.sub(r'[a-z]$', '', re.search(YEAR_RE, year_match.group(0)).group(0))
        authors_part = body[: year_match.start()]
    else:
        year_norm = 's.f.'
        authors_part = body[: sf_match.start()]
    # separar por '&' o ' y ' (como conectores finales) y por ','
    authors_part = authors_part.replace('&', ',&,')
    # aislar " y " como separador de autor SOLO cuando va entre mayúsculas (para no romper
    # apellidos compuestos como "de la Cruz"); heurística simple: " y " seguido de mayúscula
    authors_part = re.sub(r'\s+y\s+(?=[A-ZÁÉÍÓÚÑ])', ' ,Y, ', authors_part)
    raw_tokens = [t.strip(' .') for t in authors_part.split(',')]
    raw_tokens = [t for t in raw_tokens if t and t not in ('&', 'Y')]

    surnames = []
    pending_surname_parts = []
    for tok in raw_tokens:
        if INITIALS_TOKEN_RE.match(tok):
            # es un bloque de iniciales -> cierra el apellido pendiente
            if pending_surname_parts:
                surnames.append(' '.join(pending_surname_parts))
                pending_surname_parts = []
            continue
        # heurística: si el token es muy largo o contiene minúsculas de conectores,
        # probablemente es apellido (o autor institucional)
        pending_surname_parts.append(tok)
    if pending_surname_parts:
        surnames.append(' '.join(pending_surname_parts))

    # limpiar: quitar tokens vacíos
    surnames = [s for s in surnames if s]
    return surnames, year_norm


def parse_references(ref_block):
    entries = split_reference_entries(ref_block)
    refs = []
    for e in entries:
        surnames, year = extract_surnames_from_reference(e)
        refs.append({
            'raw': e,
            'surnames': surnames,
            'surnames_norm': [normalize_surname(s) for s in surnames],
            'year': year,
        })
    return refs


# ---------------------------------------------------------------------------
# 2. Extraer citas en el cuerpo del texto (antes del bloque de referencias)
# ---------------------------------------------------------------------------

CITATION_GROUP_RE = re.compile(
    r'\(([^()]{2,200}?' + YEAR_RE + r'[^()]{0,10}?)\)'
)


def split_citation_group(group_text):
    """Un grupo '(A, 2000; B y C, 2001)' -> lista de citas individuales."""
    return [c.strip() for c in group_text.split(';') if c.strip()]


def parse_single_citation(piece):
    """'Wackernagel & Rees, 1996' -> (['Wackernagel','Rees'], '1996', texto_original)"""
    piece = piece.replace('**', '').replace('*', '')
    sf_match = re.search(r's\.?\s*f\.?\s*$', piece.strip(), re.IGNORECASE)
    year_match = re.search(YEAR_RE + r'\s*$', piece.strip())
    if year_match:
        year_norm = re.sub(r'[a-z]$', '', year_match.group(0))
        author_part = piece[: year_match.start()].strip().rstrip(',').strip()
    elif sf_match:
        year_norm = 's.f.'
        author_part = piece[: sf_match.start()].strip().rstrip(',').strip()
    else:
        return None, None
    if not author_part:
        return None, None
    if re.search(r'\bet\s*al\.?\b', author_part, re.IGNORECASE):
        first_author = re.split(r'\bet\s*al\.?\b', author_part, flags=re.IGNORECASE)[0].strip(' ,')
        surnames = [first_author] if first_author else []
    else:
        tmp = author_part.replace('&', ',&,')
        tmp = re.sub(r'\s+y\s+(?=[A-ZÁÉÍÓÚÑ])', ' ,Y, ', tmp)
        tmp = re.sub(r'\s+and\s+(?=[A-ZÁÉÍÓÚÑ])', ' ,AND, ', tmp)
        parts = [p.strip(' .') for p in tmp.split(',')]
        surnames = [p for p in parts if p and p not in ('&', 'Y', 'AND')]
    return surnames, year_norm


def parse_citations(body_text):
    citations = []
    for m in CITATION_GROUP_RE.finditer(body_text):
        group = m.group(1)
        for piece in split_citation_group(group):
            surnames, year = parse_single_citation(piece)
            if surnames is None:
                continue
            citations.append({
                'raw': f'({piece})',
                'surnames': surnames,
                'surnames_norm': [normalize_surname(s) for s in surnames],
                'year': year,
                'style': 'parentética',
            })
    return citations


# Citas narrativas: "Según Apellido (2020)...", "Apellido y Apellido2 (2020) plantean...",
# "Apellido et al. (2020)...". Se detectan buscando un nombre propio (mayúscula inicial)
# pegado a un paréntesis que contiene SOLO un año — así no se solapa con el patrón
# parentético de arriba, que exige apellido + año dentro del mismo paréntesis.
# Se admite un apellido compuesto de hasta 2 palabras (ej. "López Álvarez", "Blanco Heras")
# — riesgo conocido: si justo antes del apellido real hay OTRA palabra con mayúscula inicial
# (ej. "Estudio Rodríguez (2020)"), puede capturarla de más. Por eso estas citas siempre se
# marcan "[narrativa]" en el reporte para revisión manual.
NAME_CORE_RE = r'[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ\-]*'
SURNAME_RE = r'(?:' + NAME_CORE_RE + r'\s+)?' + NAME_CORE_RE
NARRATIVE_CITATION_RE = re.compile(
    r'(' + SURNAME_RE + r'(?:\s+(?:y|&)\s+' + SURNAME_RE + r'|\s+et\s*al\.?)?)'
    r'\s*\(\s*(' + YEAR_RE + r')\s*\)'
)


def parse_narrative_citations(body_text):
    citations = []
    for m in NARRATIVE_CITATION_RE.finditer(body_text):
        author_part = m.group(1).strip()
        year_raw = m.group(2)
        year_norm = re.sub(r'[a-z]$', '', year_raw)
        if re.search(r'\bet\s*al\.?\b', author_part, re.IGNORECASE):
            first_author = re.split(r'\bet\s*al\.?\b', author_part, flags=re.IGNORECASE)[0].strip(' .,')
            surnames = [first_author] if first_author else []
        else:
            tmp = author_part.replace('&', ',&,')
            tmp = re.sub(r'\s+y\s+(?=[A-ZÁÉÍÓÚÑ])', ' ,Y, ', tmp)
            parts = [p.strip(' .') for p in tmp.split(',')]
            surnames = [p for p in parts if p and p not in ('&', 'Y')]
        if not surnames:
            continue
        citations.append({
            'raw': f'{author_part} ({year_raw})',
            'surnames': surnames,
            'surnames_norm': [normalize_surname(s) for s in surnames],
            'year': year_norm,
            'style': 'narrativa',
        })
    return citations


def parse_all_citations(body_text):
    """Combina citas parentéticas y narrativas. Los dos patrones son mutuamente excluyentes
    por construcción (uno exige apellido+año dentro del paréntesis, el otro exige que el
    paréntesis contenga SOLO el año), así que no debería haber citas duplicadas."""
    return parse_citations(body_text) + parse_narrative_citations(body_text)


# ---------------------------------------------------------------------------
# 3. Cruce y reporte
# ---------------------------------------------------------------------------

def citation_matches_reference(cit, ref):
    if cit['year'] != ref['year']:
        return False
    if not cit['surnames_norm']:
        return False
    # basta con que el/los apellido(s) citados estén contenidos en los apellidos de la
    # referencia (cubre "et al." -> solo primer autor, y cita con 2 autores vs referencia con
    # más autores por error de captura)
    ref_set = set(ref['surnames_norm'])
    return all(any(cs == rs or cs in rs or rs in cs for rs in ref_set) for cs in cit['surnames_norm'])


def build_report(citations, references):
    # 1. conteo por referencia
    ref_counts = []
    cited_ref_indices = set()
    for i, ref in enumerate(references):
        count = 0
        for cit in citations:
            if citation_matches_reference(cit, ref):
                count += 1
        ref_counts.append(count)
        if count > 0:
            cited_ref_indices.add(i)

    # 2. citas sin referencia
    orphan_citations = []
    for cit in citations:
        if not any(citation_matches_reference(cit, ref) for ref in references):
            orphan_citations.append(cit)

    # 3. referencias sin cita
    uncited_refs = [ref for i, ref in enumerate(references) if i not in cited_ref_indices]

    return ref_counts, orphan_citations, uncited_refs


MAX_LABEL_LEN = 150


def truncate_label(s, max_len=MAX_LABEL_LEN):
    """Evita que un 'apellido' o cita mal parseada (ej. texto/base64 sin espacios pegado por
    error a un bloque de referencias) genere una celda de tabla gigante e ilegible que además
    rompe el layout del resto de la tabla en el preview de Markdown."""
    s = ' '.join(s.split())
    if len(s) <= max_len:
        return s
    return s[:max_len].rstrip() + '… [texto truncado, revisa la referencia original]'


def ref_label(ref):
    if ref['surnames']:
        return truncate_label(f"{', '.join(ref['surnames'])} ({ref['year']})")
    return truncate_label(ref['raw'])


def format_report(references, ref_counts, orphan_citations, uncited_refs, citations, source_name):
    lines = []
    n_parentetica = sum(1 for c in citations if c.get('style') == 'parentética')
    n_narrativa = sum(1 for c in citations if c.get('style') == 'narrativa')
    lines.append(f'# Reporte de citas y referencias — {source_name}\n')
    lines.append(
        f'- Total de citas detectadas en el texto: **{len(citations)}** '
        f'(parentéticas: {n_parentetica}, narrativas: {n_narrativa})'
    )
    lines.append(f'- Total de referencias en la bibliografía: **{len(references)}**\n')

    lines.append('## 1. Referencias con conteo de veces citadas\n')
    lines.append('| # | Apellido(s) y año | N° de citas |')
    lines.append('|---|---|---|')
    order = sorted(range(len(references)), key=lambda i: -ref_counts[i])
    for i in order:
        ref = references[i]
        lines.append(f'| {i + 1} | {ref_label(ref)} | {ref_counts[i]} |')

    lines.append('\n## 2. Citas en el texto SIN referencia en la bibliografía\n')
    if orphan_citations:
        lines.append('> Revisa manualmente: puede deberse a un apellido mal escrito, a un año')
        lines.append('> distinto entre la cita y la referencia, o a que falta agregar la referencia.\n')
        seen = OrderedDict()
        for cit in orphan_citations:
            key = (cit['raw'], cit.get('style', ''))
            seen[key] = seen.get(key, 0) + 1
        for (raw, style), n in seen.items():
            suffix = f' (x{n})' if n > 1 else ''
            style_tag = f' _[{style}]_' if style else ''
            lines.append(f'- {truncate_label(raw)}{suffix}{style_tag}')
    else:
        lines.append('_Ninguna. Todas las citas detectadas tienen referencia correspondiente._')

    lines.append('\n## 3. Referencias en la bibliografía que NUNCA fueron citadas\n')
    if uncited_refs:
        for ref in uncited_refs:
            lines.append(f'- {ref_label(ref)}')
    else:
        lines.append('_Ninguna. Todas las referencias fueron citadas al menos una vez._')

    lines.append('\n---')
    lines.append('_Nota: la detección es heurística (basada en expresiones regulares), no un parser')
    lines.append('APA completo. Detecta citas parentéticas "(Apellido, 2020)" y narrativas')
    lines.append('"Apellido (2020)" / "Según Apellido (2020)...", pero NO citas sin ningún paréntesis')
    lines.append('("Apellido 2020" a secas) ni casos con formato muy irregular. Revisa especialmente')
    lines.append('las secciones 2 y 3 antes de usarlas para corregir la tesis.__')

    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('input_md', help='Ruta al archivo .md a analizar')
    parser.add_argument('--out', default=None, help='Ruta del reporte .md de salida')
    parser.add_argument('--ref-heading', default='Referencias',
                         help='Texto del encabezado que marca el inicio de la bibliografía (default: "Referencias")')
    args = parser.parse_args()

    with open(args.input_md, 'r', encoding='utf-8') as f:
        text = f.read()

    ref_block = find_references_block(text, args.ref_heading)
    if ref_block is None:
        print(f'ERROR: no encontré un encabezado "{args.ref_heading}" en el documento.', file=sys.stderr)
        print('Prueba con --ref-heading "<texto exacto del encabezado>".', file=sys.stderr)
        sys.exit(1)

    body_text = text[: text.index(ref_block)] if ref_block in text else text
    references = parse_references(ref_block)
    citations = parse_all_citations(body_text)

    ref_counts, orphan_citations, uncited_refs = build_report(citations, references)

    import os
    source_name = os.path.basename(args.input_md)
    report = format_report(references, ref_counts, orphan_citations, uncited_refs, citations, source_name)

    out_path = args.out or 'reporte_citas.md'
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(report + '\n')

    print(f'OK: {len(citations)} citas y {len(references)} referencias procesadas.')
    print(f'Reporte guardado en: {out_path}')


if __name__ == '__main__':
    main()

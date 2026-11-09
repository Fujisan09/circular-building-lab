(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ScanCore = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const HEADER_LIMIT = 1024 * 1024;
  const COUNT_UNITS = new Set(['脚', '台', '枚', '点', '個', '本', 'セット']);
  const SCALAR_TYPES = new Set(['char', 'uchar', 'short', 'ushort', 'int', 'uint', 'float', 'double', 'int8', 'uint8', 'int16', 'uint16', 'int32', 'uint32', 'float32', 'float64']);
  function parsePlyHeader(bytes) {
    if (!(bytes instanceof Uint8Array)) bytes = new Uint8Array(bytes);
    if (!bytes.length) throw new Error('ファイルが空です。PLYファイルを選び直してください。');
    if (bytes.length > HEADER_LIMIT) bytes = bytes.subarray(0, HEADER_LIMIT);
    const text = new TextDecoder('utf-8').decode(bytes);
    const end = /(?:^|\r?\n)end_header(?:\r?\n|$)/.exec(text);
    if (!end) throw new Error('先頭1MB以内にPLYヘッダーの終端が見つかりません。書き出したファイルを確認してください。');
    const headerText = text.slice(0, end.index + end[0].length);
    const lines = headerText.split(/\r?\n/);
    if (lines[0] !== 'ply') throw new Error('PLY形式の識別子がありません。拡張子だけを変更したファイルは読み込めません。');
    let format = null, vertexCount = null, faceCount = 0, current = null;
    const vertexProperties = [];
    for (const line of lines.slice(1)) {
      const parts = line.trim().split(/\s+/);
      if (parts[0] === 'format') {
        if (format || parts.length !== 3 || parts[2] !== '1.0' || !['ascii', 'binary_little_endian', 'binary_big_endian'].includes(parts[1])) throw new Error('PLYの形式宣言に対応していません。ASCIIまたはbinary形式のPLY 1.0を使用してください。');
        format = parts[1];
      } else if (parts[0] === 'element') {
        if (parts.length !== 3 || !/^\d+$/.test(parts[2]) || !Number.isSafeInteger(Number(parts[2]))) throw new Error('PLYの要素数が不正です。');
        current = parts[1];
        if (current === 'vertex') {
          if (vertexCount !== null) throw new Error('vertexの宣言が重複しています。');
          vertexCount = Number(parts[2]);
        } else if (current === 'face') faceCount = Number(parts[2]);
      } else if (parts[0] === 'property' && current === 'vertex') {
        if (parts.length === 3 && SCALAR_TYPES.has(parts[1])) vertexProperties.push(parts[2]);
        else if (parts[1] !== 'list') throw new Error('PLYの頂点属性を読み取れませんでした。');
      }
    }
    if (!format || vertexCount === null) throw new Error('PLYの形式または頂点数が記録されていません。');
    if (!['x', 'y', 'z'].every(key => vertexProperties.includes(key))) throw new Error('頂点のx・y・z座標がそろっていません。この画面では点群・メッシュのPLYを扱います。');
    const hasColor = [['red', 'green', 'blue'], ['r', 'g', 'b'], ['diffuse_red', 'diffuse_green', 'diffuse_blue']].some(keys => keys.every(key => vertexProperties.includes(key)));
    return {format, vertexCount, faceCount, hasColor, vertexProperties, headerBytes: new TextEncoder().encode(headerText).length};
  }
  function parseQuantity(raw) {
    const original = String(raw == null ? '' : raw).trim();
    if (!original) return {kind:'invalid', original, reason:'数量を入力してください。'};
    if (/^[−－-]\s*\d+(?:\.\d+)?\s*(?:脚|台|枚|点|個|本|㎡|m²|m2|m|セット|式)?$/.test(original)) return {kind:'invalid', original, reason:'数量に負の値は使用できません。正の数量、範囲、または未確認の状況を入力してください。'};
    const match = /^(\d+(?:\.\d{1,6})?)\s*(脚|台|枚|点|個|本|㎡|m²|m2|m|セット)$/.exec(original);
    if (!match) return {kind:'whole', original};
    const value = Number(match[1]), unit = match[2];
    if (!(value > 0) || value > 1000000000 || (COUNT_UNITS.has(unit) && !Number.isInteger(value))) return {kind:'invalid', original, reason:'数量は正の値で入力してください。個数の単位には整数を使用します。'};
    return {kind:'numeric', original, value, unit, scaled:Math.round(value * 1000000)};
  }
  function formatQuantity(value, unit) { return String(Math.round(value * 1000000) / 1000000) + unit; }
  function allocation(raw, existing, requested) {
    const q = parseQuantity(raw);
    if (q.kind === 'invalid') throw new Error(q.reason);
    if (q.kind === 'whole') {
      if (existing) throw new Error('この数量は全量で準備済みです。重ねて準備できません。');
      if (String(requested).trim() !== q.original) throw new Error('範囲・概数・一式などの数量は、原文のまま全量で準備します。');
      return {kind:'whole', quantity:q.original, amount:null, remaining:'全量準備済み'};
    }
    const add = parseQuantity(requested);
    if (add.kind !== 'numeric' || add.unit !== q.unit) throw new Error('準備する数量は元の数量と同じ単位で入力してください。例：10' + q.unit);
    const previous = existing ? parseQuantity(existing.quantity) : {kind:'numeric', scaled:0, unit:q.unit};
    if (previous.kind !== 'numeric' || previous.unit !== q.unit) throw new Error('準備済み数量との整合を確認してください。');
    const total = previous.scaled + add.scaled;
    if (total > q.scaled) throw new Error('残数量を超えています。準備できる残りは' + formatQuantity((q.scaled - previous.scaled) / 1000000, q.unit) + 'です。');
    return {kind:'numeric', quantity:formatQuantity(total / 1000000, q.unit), amount:total / 1000000, remaining:formatQuantity((q.scaled - total) / 1000000, q.unit)};
  }
  function remaining(raw, existing) {
    const q = parseQuantity(raw);
    if (q.kind !== 'numeric') return existing ? '全量準備済み' : q.original;
    const p = existing ? parseQuantity(existing.quantity) : {kind:'numeric', scaled:0};
    return formatQuantity(Math.max(0, q.scaled - (p.kind === 'numeric' ? p.scaled : 0)) / 1000000, q.unit);
  }
  function csvCell(value) {
    let text = String(value == null ? '' : value);
    if (/^[\s\uFEFF]*[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }
  function toCSV(items) {
    const keys = ['id','name','category','quantity','timing','region','dimensions','condition','note'];
    const headers = ['記録ID','品目','カテゴリー','数量（単位込み）','出品時期','公開地域','寸法','状態','出品者メモ'];
    return '\uFEFF' + [headers.map(csvCell).join(','), ...items.map(item => keys.map(key => csvCell(item[key])).join(','))].join('\r\n');
  }
  return {HEADER_LIMIT, parsePlyHeader, parseQuantity, allocation, remaining, formatQuantity, csvCell, toCSV};
}));

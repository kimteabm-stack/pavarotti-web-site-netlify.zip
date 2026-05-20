const EXPORT_FILE_BASE = "10208_김태범_성악가_발표";

function safeXml(value) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function plainTextFromHtml(html) {
  const box = document.createElement("div");
  box.innerHTML = html;
  return box.innerText.replace(/\n{3,}/g, "\n\n").trim();
}

function slideLines(item) {
  return plainTextFromHtml(item.h)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^\d+\s*\/\s*\d+$/.test(line))
    .filter((line) => !["OPERA", "VOICE"].includes(line));
}

function setExportBusy(state) {
  document.querySelectorAll(".downloadBar button").forEach((button) => {
    button.disabled = state;
  });
}

function buildPrintPage() {
  const styles = [...document.querySelectorAll("link[rel='stylesheet']")]
    .filter((link) => !link.href.includes("download.css"))
    .map((link) => `<link rel="stylesheet" href="${link.href}">`)
    .join("");
  const pages = slides
    .map(
      (item, index) => `<section class="slide"><div class="inner"><div class="kicker">${
        item.n ? `<span class="num">${item.n}</span>` : ""
      }<span>${item.k}</span></div><div class="content">${item.h}</div><div class="pageNo">${
        index + 1
      } / ${slides.length}</div><div class="shapeLayer v${index % 5}"><span class="shape ring"></span><span class="shape square"></span><span class="shape slab"></span><span class="shape staff"></span><span class="shape note"></span></div></div></section>`
    )
    .join("");

  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${EXPORT_FILE_BASE} PDF</title>${styles}<style>html,body{overflow:visible!important;background:#f7f7f1}.slide{page-break-after:always;break-after:page}.slide:last-child{page-break-after:auto;break-after:auto}@page{size:landscape;margin:0}.nav,.downloadBar{display:none!important}</style></head><body>${pages}<script>setTimeout(function(){print()},700)<\/script></body></html>`;
}

function savePdfDeck() {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("팝업이 막혔습니다. 팝업 허용 후 다시 눌러주세요.");
    return;
  }
  printWindow.document.open();
  printWindow.document.write(buildPrintPage());
  printWindow.document.close();
}

const PPT_EMU = 914400;
const PPT_W = 13.333;
const PPT_H = 7.5;

function emu(inches) {
  return Math.round(inches * PPT_EMU);
}

function pptColor(color) {
  return String(color).replace("#", "").toUpperCase();
}

function pptSolid(color) {
  return `<a:solidFill><a:srgbClr val="${pptColor(color)}"/></a:solidFill>`;
}

function pptRun(text, size, color, bold) {
  return `<a:r><a:rPr lang="ko-KR" sz="${Math.round(size * 100)}"${
    bold ? ' b="1"' : ""
  }>${pptSolid(color)}<a:latin typeface="Malgun Gothic"/><a:ea typeface="Malgun Gothic"/><a:cs typeface="Malgun Gothic"/></a:rPr><a:t>${safeXml(text)}</a:t></a:r>`;
}

function pptParagraph(text, size, color, bold = false, align = "l") {
  return `<a:p><a:pPr algn="${align}"/>${pptRun(text, size, color, bold)}<a:endParaRPr lang="ko-KR"/></a:p>`;
}

function pptTextBox(id, x, y, w, h, lines, options = {}) {
  const textLines = Array.isArray(lines) ? lines : [lines];
  const size = options.size ?? 20;
  const color = options.color ?? "#111111";
  const bold = options.bold ?? false;
  const align = options.align ?? "l";
  const paras = textLines.map((line) => pptParagraph(line, size, color, bold, align)).join("");
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="Text ${id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${emu(x)}" y="${emu(y)}"/><a:ext cx="${emu(w)}" cy="${emu(h)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0"><a:spAutoFit/></a:bodyPr><a:lstStyle/>${paras}</p:txBody></p:sp>`;
}

function pptShape(id, preset, x, y, w, h, fill = "#111111", line = "#111111") {
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="Shape ${id}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${emu(x)}" y="${emu(y)}"/><a:ext cx="${emu(w)}" cy="${emu(h)}"/></a:xfrm><a:prstGeom prst="${preset}"><a:avLst/></a:prstGeom>${pptSolid(fill)}<a:ln w="12700">${pptSolid(line)}</a:ln></p:spPr></p:sp>`;
}

function cleanPptText(line) {
  return line
    .replace(/\s+/g, " ")
    .replace(/^Breath|^Tone|^Pitch|^Language|^Acting|^Care|^Opera|^Art Song|^Oratorio|^Ensemble/, "")
    .trim();
}

function makePptSlide(item, index) {
  const lines = slideLines(item).map(cleanPptText).filter(Boolean);
  const parts = [
    pptShape(2, "rect", 0, 0, PPT_W, PPT_H, "#F7F7F1", "#F7F7F1"),
    pptShape(3, "ellipse", 10.2, -0.65, 3.7, 3.7, "#F7F7F1", "#D7D7CF"),
    pptShape(4, "rect", 0.55, 6.78, 1.05, 0.18, "#111111", "#111111"),
  ];

  if (index === 0) {
    parts.push(pptTextBox(5, 0.75, 0.62, 3.2, 0.35, "10208 김태범 발표", { size: 13, bold: true, color: "#4A4A4A" }));
    parts.push(pptTextBox(6, 0.75, 1.35, 6.4, 1.25, ["성악가란", "무엇일까?"], { size: 44, bold: true, color: "#111111" }));
    parts.push(
      pptTextBox(
        7,
        0.8,
        3.25,
        7.2,
        0.95,
        "루치아노 파바로티를 대표 사례로 보면서 성악가가 하는 일, 필요한 역량, 성악가 안의 종류를 쉽게 살펴봅니다.",
        { size: 17, bold: false, color: "#3E3E3E" }
      )
    );
    parts.push(pptShape(8, "rect", 8.3, 1.05, 3.9, 4.9, "#FFFFFF", "#111111"));
    parts.push(pptTextBox(9, 8.65, 2.85, 3.2, 0.6, "OPERA VOICE", { size: 24, bold: true, align: "ctr", color: "#111111" }));
  } else if (/감사합니다/.test(lines.join(" "))) {
    parts.push(pptTextBox(5, 1.1, 2.35, 11.1, 0.95, "감사합니다", { size: 54, bold: true, align: "ctr", color: "#111111" }));
    parts.push(pptTextBox(6, 4.2, 3.65, 5, 0.38, "10208 김태범", { size: 20, bold: true, align: "ctr", color: "#4A4A4A" }));
    parts.push(pptTextBox(7, 4.2, 4.15, 5, 0.3, "성악가란 무엇일까?", { size: 13, align: "ctr", color: "#4A4A4A" }));
  } else {
    const title = lines[0] || item.k || "";
    const body = lines.slice(1, 9);
    parts.push(pptTextBox(5, 0.62, 0.48, 0.42, 0.23, String(index + 1).padStart(2, "0"), { size: 9, bold: true, color: "#FFFFFF", align: "ctr" }));
    parts.push(pptShape(6, "rect", 0.55, 0.38, 0.62, 0.36, "#111111", "#111111"));
    parts.push(pptTextBox(7, 1.25, 0.47, 4.2, 0.28, item.k || "", { size: 9, bold: true, color: "#4A4A4A" }));
    parts.push(pptTextBox(8, 0.72, 1.08, 10.8, 1.05, title, { size: title.length > 22 ? 26 : 30, bold: true, color: "#111111" }));
    body.forEach((line, lineIndex) => {
      const y = 2.55 + lineIndex * 0.5;
      parts.push(pptShape(20 + lineIndex, "rect", 0.82, y + 0.11, 0.11, 0.11, "#111111", "#111111"));
      parts.push(pptTextBox(40 + lineIndex, 1.06, y, 10.75, 0.34, line, { size: line.length > 34 ? 13 : 15, color: "#3E3E3E" }));
    });
  }

  parts.push(pptTextBox(90, 11.55, 6.88, 0.9, 0.24, `${index + 1} / ${slides.length}`, { size: 8, bold: true, align: "r", color: "#111111" }));

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${parts.join("")}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
}

function contentTypesXml(count) {
  const slideOverrides = Array.from({ length: count }, (_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>${slideOverrides}</Types>`;
}

function presentationXml(count) {
  const ids = Array.from({ length: count }, (_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${ids}</p:sldIdLst><p:sldSz cx="${emu(PPT_W)}" cy="${emu(PPT_H)}" type="wide"/><p:notesSz cx="6858000" cy="9144000"/><p:defaultTextStyle><a:defPPr><a:defRPr lang="ko-KR"><a:latin typeface="Malgun Gothic"/><a:ea typeface="Malgun Gothic"/></a:defRPr></a:defPPr></p:defaultTextStyle></p:presentation>`;
}

function presentationRelsXml(count) {
  const slideRels = Array.from({ length: count }, (_, i) => `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>${slideRels}</Relationships>`;
}

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
const APP_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft PowerPoint</Application><PresentationFormat>On-screen Show (16:9)</PresentationFormat><Slides>17</Slides></Properties>`;
const CORE_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>성악가란 무엇일까?</dc:title><dc:creator>10208 김태범</dc:creator><cp:lastModifiedBy>10208 김태범</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">2026-05-20T00:00:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-05-20T00:00:00Z</dcterms:modified></cp:coreProperties>`;
const THEME_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Clean Mono"><a:themeElements><a:clrScheme name="Mono"><a:dk1><a:srgbClr val="111111"/></a:dk1><a:lt1><a:srgbClr val="F7F7F1"/></a:lt1><a:dk2><a:srgbClr val="3E3E3E"/></a:dk2><a:lt2><a:srgbClr val="FFFFFF"/></a:lt2><a:accent1><a:srgbClr val="111111"/></a:accent1><a:accent2><a:srgbClr val="4A4A4A"/></a:accent2><a:accent3><a:srgbClr val="D7D7CF"/></a:accent3><a:accent4><a:srgbClr val="FFFFFF"/></a:accent4><a:accent5><a:srgbClr val="888888"/></a:accent5><a:accent6><a:srgbClr val="CCCCCC"/></a:accent6><a:hlink><a:srgbClr val="111111"/></a:hlink><a:folHlink><a:srgbClr val="111111"/></a:folHlink></a:clrScheme><a:fontScheme name="Malgun"><a:majorFont><a:latin typeface="Malgun Gothic"/><a:ea typeface="Malgun Gothic"/><a:cs typeface="Malgun Gothic"/></a:majorFont><a:minorFont><a:latin typeface="Malgun Gothic"/><a:ea typeface="Malgun Gothic"/><a:cs typeface="Malgun Gothic"/></a:minorFont></a:fontScheme><a:fmtScheme name="Clean"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>`;
const MASTER_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>`;
const MASTER_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`;
const LAYOUT_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`;
const LAYOUT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`;

function slideRelXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>`;
}

function makePptxFiles() {
  const files = [
    ["[Content_Types].xml", contentTypesXml(slides.length)],
    ["_rels/.rels", ROOT_RELS],
    ["docProps/app.xml", APP_XML.replace("<Slides>17</Slides>", `<Slides>${slides.length}</Slides>`)],
    ["docProps/core.xml", CORE_XML],
    ["ppt/presentation.xml", presentationXml(slides.length)],
    ["ppt/_rels/presentation.xml.rels", presentationRelsXml(slides.length)],
    ["ppt/theme/theme1.xml", THEME_XML],
    ["ppt/slideMasters/slideMaster1.xml", MASTER_XML],
    ["ppt/slideMasters/_rels/slideMaster1.xml.rels", MASTER_RELS],
    ["ppt/slideLayouts/slideLayout1.xml", LAYOUT_XML],
    ["ppt/slideLayouts/_rels/slideLayout1.xml.rels", LAYOUT_RELS],
  ];
  slides.forEach((item, index) => {
    files.push([`ppt/slides/slide${index + 1}.xml`, makePptSlide(item, index)]);
    files.push([`ppt/slides/_rels/slide${index + 1}.xml.rels`, slideRelXml()]);
  });
  return files;
}

let crcTable;
function crc32(bytes) {
  if (!crcTable) {
    crcTable = Array.from({ length: 256 }, (_, n) => {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      return c >>> 0;
    });
  }
  let crc = 0xffffffff;
  bytes.forEach((byte) => {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });
  return (crc ^ 0xffffffff) >>> 0;
}

function dosTimeDate(date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function u16(value) {
  return new Uint8Array([value & 255, (value >>> 8) & 255]);
}

function u32(value) {
  return new Uint8Array([value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]);
}

function zipStore(files) {
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  const { time, day } = dosTimeDate(new Date());

  files.forEach(([name, content]) => {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(content);
    const crc = crc32(data);
    const local = [
      u32(0x04034b50),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(time),
      u16(day),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
      data,
    ];
    chunks.push(...local);
    const localLength = local.reduce((sum, part) => sum + part.length, 0);
    central.push(
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(time),
      u16(day),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBytes
    );
    offset += localLength;
  });

  const centralOffset = offset;
  const centralLength = central.reduce((sum, part) => sum + part.length, 0);
  chunks.push(...central);
  chunks.push(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(centralLength), u32(centralOffset), u16(0));
  return new Blob(chunks, { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
}

function savePptDeck() {
  setExportBusy(true);
  try {
    const blob = zipStore(makePptxFiles());
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${EXPORT_FILE_BASE}.pptx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  } catch (error) {
    console.error(error);
    alert("PPT 파일을 만드는 중 문제가 생겼습니다. 새로고침 후 다시 눌러주세요.");
  } finally {
    setExportBusy(false);
  }
}

document.getElementById("downloadPdf")?.addEventListener("click", savePdfDeck);
document.getElementById("downloadPpt")?.addEventListener("click", savePptDeck);
window.deckExportReady = true;

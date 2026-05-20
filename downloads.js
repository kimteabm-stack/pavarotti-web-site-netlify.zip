function fileSafeName(ext){return `10208_김태범_성악가_발표.${ext}`}
function plainText(html){const box=document.createElement('div');box.innerHTML=html;return box.innerText.replace(/\n{3,}/g,'\n\n').trim()}
function splitLines(text){return text.split('\n').map(s=>s.trim()).filter(Boolean).filter(s=>!/^\d+\s*\/\s*\d+$/.test(s))}
function setBusy(state){document.querySelectorAll('.downloadBar button').forEach(b=>b.disabled=state)}
async function downloadPpt(){
  if(typeof pptxgen==='undefined'){alert('PPT 변환 파일을 불러오는 중입니다. 잠시 후 다시 눌러주세요.');return}
  setBusy(true);
  try{
    const pptx=new pptxgen();
    pptx.layout='LAYOUT_WIDE';
    pptx.author='10208 김태범';
    pptx.subject='성악가 발표';
    pptx.title='성악가란 무엇일까?';
    pptx.lang='ko-KR';
    pptx.theme={headFontFace:'Malgun Gothic',bodyFontFace:'Malgun Gothic',lang:'ko-KR'};
    const ink='111111',paper='F7F7F1',muted='4A4A4A';
    slides.forEach((item,i)=>{
      const s=pptx.addSlide();
      s.background={color:paper};
      s.addShape(pptx.ShapeType.ellipse,{x:10.1,y:-.6,w:3.8,h:3.8,fill:{color:paper,transparency:100},line:{color:'D8D8D0',width:1.2,transparency:10}});
      s.addShape(pptx.ShapeType.rect,{x:.45,y:6.55,w:1,h:.26,fill:{color:ink,transparency:8},line:{color:ink,transparency:100},rotate:-6});
      s.addText(String(i+1).padStart(2,'0'),{x:.55,y:.42,w:.52,h:.28,fontFace:'Malgun Gothic',fontSize:9,bold:true,color:'FFFFFF',align:'center',fill:{color:ink},margin:0});
      s.addText(item.k||'',{x:.72,y:.54,w:4.2,h:.28,fontFace:'Malgun Gothic',fontSize:9,bold:true,color:muted,margin:0});
      const lines=splitLines(plainText(item.h));
      const title=lines[0]||item.k||'';
      const body=lines.slice(1).filter(line=>!['OPERA','VOICE'].includes(line));
      if(i===slides.length-2){
        s.addText('감사합니다',{x:1.2,y:2.15,w:10.9,h:1.25,fontFace:'Malgun Gothic',fontSize:56,bold:true,color:ink,align:'center',margin:0,fit:'shrink'});
        s.addText('10208 김태범',{x:4.2,y:3.65,w:5,h:.45,fontFace:'Malgun Gothic',fontSize:20,bold:true,color:muted,align:'center',margin:0});
        s.addText('성악가란 무엇일까?',{x:4.2,y:4.15,w:5,h:.35,fontFace:'Malgun Gothic',fontSize:13,color:muted,align:'center',margin:0});
      }else{
        s.addText(title,{x:.72,y:1.08,w:9.6,h:1.25,fontFace:'Malgun Gothic',fontSize:i===0?40:30,bold:true,color:ink,fit:'shrink',margin:0});
        body.slice(0,8).forEach((line,j)=>{const y=2.65+j*.52;s.addShape(pptx.ShapeType.rect,{x:.82,y:y+.08,w:.12,h:.12,fill:{color:ink},line:{color:ink}});s.addText(line,{x:1.08,y,w:10.6,h:.34,fontFace:'Malgun Gothic',fontSize:15,color:muted,fit:'shrink',margin:0});});
      }
      s.addText(`${i+1} / ${slides.length}`,{x:11.55,y:6.92,w:.9,h:.22,fontFace:'Malgun Gothic',fontSize:8,bold:true,color:ink,align:'right',margin:0});
    });
    await pptx.writeFile({fileName:fileSafeName('pptx')});
  }catch(e){console.error(e);alert('PPT 다운로드 중 문제가 생겼습니다. 새로고침 후 다시 눌러주세요.')}finally{setBusy(false)}
}
function pdfPrintHtml(){
  const css=['manga.css?v=20260520f','accent.css?v=20260520f'].map(h=>`<link rel="stylesheet" href="${h}">`).join('');
  const pages=slides.map((s,i)=>`<section class="slide"><div class="inner"><div class="kicker">${s.n?`<span class="num">${s.n}</span>`:''}<span>${s.k}</span></div><div class="content">${s.h}</div><div class="pageNo">${i+1} / ${slides.length}</div><div class="shapeLayer v${i%5}"><span class="shape ring"></span><span class="shape square"></span><span class="shape slab"></span><span class="shape staff"></span><span class="shape note"></span></div></div></section>`).join('');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>10208 김태범 발표 PDF</title>${css}<style>html,body{overflow:visible!important;background:#f7f7f1}.slide{page-break-after:always;break-after:page}.slide:last-child{page-break-after:auto;break-after:auto}@page{size:landscape;margin:0}.nav,.downloadBar{display:none!important}</style></head><body>${pages}<script>setTimeout(()=>print(),700)<\/script></body></html>`;
}
function downloadPdf(){
  const win=window.open('','_blank');
  if(!win){alert('팝업이 막혔습니다. 팝업 허용 후 다시 눌러주세요.');return}
  win.document.open();
  win.document.write(pdfPrintHtml());
  win.document.close();
}
document.getElementById('downloadPpt')?.addEventListener('click',downloadPpt);
document.getElementById('downloadPdf')?.addEventListener('click',downloadPdf);

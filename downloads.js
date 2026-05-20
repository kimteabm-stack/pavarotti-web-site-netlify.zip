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
        const usable=body.slice(0,8);
        usable.forEach((line,j)=>{const y=2.65+j*.52;s.addShape(pptx.ShapeType.rect,{x:.82,y:y+.08,w:.12,h:.12,fill:{color:ink},line:{color:ink}});s.addText(line,{x:1.08,y,w:10.6,h:.34,fontFace:'Malgun Gothic',fontSize:15,color:muted,fit:'shrink',margin:0});});
      }
      s.addText(`${i+1} / ${slides.length}`,{x:11.55,y:6.92,w:.9,h:.22,fontFace:'Malgun Gothic',fontSize:8,bold:true,color:ink,align:'right',margin:0});
    });
    await pptx.writeFile({fileName:fileSafeName('pptx')});
  }catch(e){console.error(e);alert('PPT 다운로드 중 문제가 생겼습니다. 새로고침 후 다시 눌러주세요.')}finally{setBusy(false)}
}
async function captureSlideImage(i){
  show(i);
  await new Promise(r=>setTimeout(r,180));
  document.querySelectorAll('img').forEach(img=>{try{img.crossOrigin='anonymous'}catch(e){}});
  const canvas=await html2canvas(document.getElementById('slide'),{scale:1.6,backgroundColor:'#f7f7f1',useCORS:true,logging:false});
  return canvas.toDataURL('image/jpeg',.92);
}
async function downloadPdf(){
  if(typeof html2canvas==='undefined'||!window.jspdf){alert('PDF 변환 파일을 불러오는 중입니다. 잠시 후 다시 눌러주세요.');return}
  setBusy(true);
  const start=index;
  try{
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
    for(let i=0;i<slides.length;i++){
      if(i>0)pdf.addPage();
      const img=await captureSlideImage(i);
      pdf.addImage(img,'JPEG',0,0,297,210);
    }
    pdf.save(fileSafeName('pdf'));
  }catch(e){console.error(e);alert('PDF 다운로드 중 문제가 생겼습니다. 새로고침 후 다시 눌러주세요.')}finally{show(start);setBusy(false)}
}
document.getElementById('downloadPpt')?.addEventListener('click',downloadPpt);
document.getElementById('downloadPdf')?.addEventListener('click',downloadPdf);

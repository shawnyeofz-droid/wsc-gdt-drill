import { useState, useEffect, useRef } from "react";

const C = {
  navy:"#00274D",blue:"#0066A1",teal:"#00A8B5",
  ltBlue:"#E8F4F8",white:"#FFFFFF",offwhite:"#F5F8FA",
  muted:"#607080",border:"#D0DDE6",
  orange:"#F97316",red:"#EF4444",
};

const CATS = [
  {id:"corporate",label:"Corporate Design",code:"CD",icon:"◈"},
  {id:"packaging",label:"Packaging Design",code:"PK",icon:"⬡"},
  {id:"editorial",label:"Editorial Design",code:"ED",icon:"▤"},
  {id:"display",label:"Display Design",code:"DD",icon:"◻"},
  {id:"illustration",label:"Illustration Design",code:"ID",icon:"◌"},
  {id:"advertising",label:"Advertising Design",code:"AD",icon:"▲"},
  {id:"infographic",label:"Infographic Design",code:"IG",icon:"◎"},
  {id:"typography",label:"Typography Design",code:"TY",icon:"Aa"},
  {id:"random",label:"Randomise",code:"RD",icon:"⟳"},
];
const REAL_CATS = CATS.filter(c => c.id !== "random");

const PAPER_REFS = {
  corporate: "Brand name · Mission tagline · Company address and contact · Registration number · Motion: 2-3 sentence brand manifesto or key message script.",
  packaging: "Modelled on WSC2019 TP40 — Poster: short impactful headline + supporting line + URL. Label: product name · category · key ingredients · volume · usage claim · brand philosophy. Option: bilingual (English + one other language).",
  editorial: "Modelled on WSC2022 Ocean Conference and WSC2024 AI & Creativity — Running headline per page. Paragraph styles: headertitle / title / subtitle / bodytext. Sections: Editor's note · Table of contents · Chapter spreads with body copy · Speaker profiles · Timetable table (time / venue / event) · Pull quotes · Back cover QR code.",
  display: "Poster headline + supporting copy + event/brand details · Exhibition section labels · Navigation text · Key brand messages.",
  illustration: "Series title · Concept description (1 paragraph) · Any text elements to incorporate into artwork.",
  advertising: "Key visual headline + subline · Banner/GIF copy (max 8 words + CTA) · Reel caption sequence or VO script (3-5 lines).",
  infographic: "Title + subtitle · 4-6 data points with source attribution · Short section labels.",
  typography: "Feature headline text · Body paragraph · Pull quote or featured word/phrase.",
};

const buildBriefSys = (cat, mins) => `You are a WorldSkills GDT training brief writer. Generate a concise Quick Drill brief for a ${mins}-minute practice session in ${cat}.

## Quick Drill — [Specific TP Name]
### Graphic Design Technology · ${mins}-Minute Drill

---

### The Client
[Client name · Est. year · City, Country · One-sentence mission]

### Background
[Paragraph 1: who they are]

[Paragraph 2: what triggered this brief]

### The Brief
**WHAT:** [one sentence]
**WHY:** [one sentence]
**HOW:** [one sentence]

### Target Audience
[2 sentences]

---

### Deliverable
| Item | Specification |
|------|---------------|
| Format | [value] |
| Dimensions | [value] |
| Colour Mode | [value] |
| Resolution | [value] |
| Bleed | [value] |
| File Naming | QD_[ClientSlug]_[Item] |

### Mandatory Elements
- [constraint 1]
- [constraint 2]
- [constraint 3]

### Assets Provided
- **Logo:** [description]
- **Tagline:** "[tagline]"
- **Colour Palette:**

| Swatch | Name | Hex |
|--------|------|-----|
| ■ | [Name] | #[XXXXXX] |
| ■ | [Name] | #[XXXXXX] |
| ■ | [Name] | #[XXXXXX] |
| ■ | [Name] | #[XXXXXX] |

- **Images:** Appendix_02_Images — [describe contents]
- **Typeface:** [Font name] — [usage note]

### Judging Focus
[2 sentences]

RULES: One deliverable only · Real-sounding client with year and city · Real hex codes · Match ${cat} conventions · Output ONLY the markdown, no preamble.`;

const buildAppendixSys = (cat) => {
  const key = cat.toLowerCase().replace(/\s+design$/i,'').trim();
  const ref = PAPER_REFS[key] || PAPER_REFS.corporate;
  return `You are generating a WSC GDT Appendix document. Write real, usable copy text a student must incorporate into their design. Do NOT write placeholder instructions — write the actual text.

STYLE REFERENCE for ${cat}:
${ref}

OUTPUT this exact format:

## Appendix_01_Text

> Note: All text below must be incorporated into the design.

**[Design element e.g. Poster Headline / Label Front / Running Headline / Page Title]:**
[Write the ACTUAL copy text here — real words a student will use]

**[Next element]:**
[Actual text]

[Write ALL text elements needed. Real sentences. Minimum 150 words total in this section.]

---

## Appendix_02_Images

- hero_image.jpg — [specific description]
- supporting_01.jpg — [specific description]
- supporting_02.jpg — [specific description]
- detail_shot.jpg — [specific description]

---

## Appendix_03_Logos

- Logo_Horizontal_CMYK.ai — primary colour lockup
- Logo_Reversed_White.ai — reversed for dark backgrounds
- Logo_Mono_Black.ai — single colour version

CRITICAL: Write real copy — full sentences and actual words. Never write a description of what the text should be. Output ONLY the markdown. No preamble.`;
};

function iMD(t) {
  return t.split(/(\*\*[^*]+\*\*)/).map((p,i) =>
    p.startsWith('**')&&p.endsWith('**')
      ? <strong key={i} style={{color:C.navy}}>{p.slice(2,-2)}</strong> : p
  );
}

function renderMD(md) {
  const lines = md.split('\n');
  const out=[]; let rows=[]; let inT=false;
  const flush=()=>{
    if(!rows.length)return;
    out.push(
      <div key={`tw${out.length}`} style={{overflowX:'auto',margin:'10px 0'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <tbody>{rows.map((row,ri)=>{
            const cells=row.split('|').filter(c=>c.trim()!==''&&!c.includes('---'));
            if(!cells.length)return null;
            return <tr key={ri} style={{background:ri===0?C.ltBlue:ri%2===0?'#F8FBFD':C.white}}>
              {cells.map((cell,ci)=>{
                const t=cell.trim();
                const isHex=/^#[0-9A-Fa-f]{6}$/.test(t);
                const hexInRow=cells.map(c=>c.trim()).find(c=>/^#[0-9A-Fa-f]{6}$/.test(c));
                return <td key={ci} style={{padding:'5px 10px',border:`1px solid ${C.border}`,fontWeight:ri===0?700:400,verticalAlign:'middle'}}>
                  {isHex
                    ?<span style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{display:'inline-block',width:14,height:14,borderRadius:3,background:t,border:`1px solid ${C.border}`,flexShrink:0}}/>
                        <code style={{fontSize:11}}>{t}</code>
                      </span>
                    :t==='■'&&hexInRow
                    ?<span style={{display:'inline-block',width:18,height:18,borderRadius:4,background:hexInRow,border:`1px solid ${C.border}`}}/>
                    :iMD(t)}
                </td>;
              })}
            </tr>;
          })}</tbody>
        </table>
      </div>
    );
    rows=[]; inT=false;
  };
  lines.forEach((line,i)=>{
    if(line.trim().startsWith('|')){if(!line.includes('---')){inT=true;rows.push(line.trim());}return;}
    else if(inT)flush();
    if(line.startsWith('## '))out.push(<h2 key={i} style={{color:C.navy,borderBottom:`2px solid ${C.blue}`,paddingBottom:4,marginTop:20,fontSize:15,fontWeight:700}}>{line.slice(3)}</h2>);
    else if(line.startsWith('### '))out.push(<h3 key={i} style={{color:C.blue,marginTop:14,marginBottom:2,fontSize:13,fontWeight:700}}>{line.slice(4)}</h3>);
    else if(line.startsWith('---'))out.push(<hr key={i} style={{border:'none',borderTop:`1px solid ${C.border}`,margin:'14px 0'}}/>);
    else if(line.startsWith('> '))out.push(<blockquote key={i} style={{borderLeft:`3px solid ${C.teal}`,paddingLeft:12,margin:'6px 0',fontSize:12,color:C.muted,background:C.ltBlue,padding:'6px 12px',borderRadius:'0 4px 4px 0'}}>{iMD(line.slice(2))}</blockquote>);
    else if(line.match(/^[-•] /))out.push(<li key={i} style={{marginLeft:20,marginBottom:4,fontSize:12,lineHeight:1.6}}>{iMD(line.replace(/^[-•] /,''))}</li>);
    else if(line.trim()==='')out.push(<div key={i} style={{height:6}}/>);
    else out.push(<p key={i} style={{margin:'3px 0',fontSize:12,lineHeight:1.65}}>{iMD(line)}</p>);
  });
  if(inT)flush();
  return out;
}

function TimerRing({remaining,total,size=130}){
  const r=(size-14)/2,circ=2*Math.PI*r,pct=Math.max(0,remaining/total);
  const dash=circ*pct,gap=circ-dash;
  const ringCol=remaining===0?C.red:remaining<=300?C.red:remaining<=600?C.orange:C.teal;
  const mins=Math.floor(remaining/60),secs=remaining%60;
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:'block',margin:'0 auto'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={9}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={ringCol} strokeWidth={9}
        strokeDasharray={`${dash} ${gap}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{transition:'stroke-dasharray 0.5s ease,stroke 0.5s ease'}}/>
      <text x={size/2} y={size/2-5} textAnchor="middle" fill={ringCol} fontSize={24} fontWeight={800} fontFamily="'Segoe UI',system-ui,sans-serif">
        {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
      </text>
      <text x={size/2} y={size/2+13} textAnchor="middle" fill={C.muted} fontSize={9} fontFamily="'Segoe UI',system-ui,sans-serif">remaining</text>
    </svg>
  );
}

export default function App(){
  const [step,setStep]=useState('select');
  const [cat,setCat]=useState(null);
  const [mins,setMins]=useState(null);
  const [brief,setBrief]=useState('');
  const [appendix,setAppendix]=useState('');
  const [tab,setTab]=useState('brief');
  const [error,setError]=useState('');
  const [hover,setHover]=useState(null);
  const [remaining,setRemaining]=useState(0);
  const [running,setRunning]=useState(false);
  const [done,setDone]=useState(false);
  const [bLoad,setBLoad]=useState(false);
  const [aLoad,setALoad]=useState(false);
  const [downloading,setDownloading]=useState(false);
  const intervalRef=useRef(null);
  const selCat=CATS.find(c=>c.id===cat);

  useEffect(()=>{
    if(running){
      intervalRef.current=setInterval(()=>{
        setRemaining(r=>{if(r<=1){setRunning(false);setDone(true);return 0;}return r-1;});
      },1000);
    }else clearInterval(intervalRef.current);
    return()=>clearInterval(intervalRef.current);
  },[running]);

  const api=async(sys,usr)=>{
    const resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:2000,system:sys,messages:[{role:'user',content:usr}]}),
    });
    const d=await resp.json();
    if(!resp.ok)throw new Error(d?.error?.message||'API error '+resp.status);
    return d.content?.find(b=>b.type==='text')?.text||'';
  };

  const loadScript=src=>new Promise((res,rej)=>{
    if(document.querySelector(`script[src="${src}"]`))return res();
    const s=document.createElement('script');
    s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);
  });

  const downloadPDF=async(content,label)=>{
    setDownloading(true);
    try{
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      const mdToHtml=md=>md
        .replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^### (.+)$/gm,'<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/^---$/gm,'<hr/>')
        .replace(/^[-•] (.+)$/gm,'<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g,s=>`<ul>${s}</ul>`)
        .replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>')
        .replace(/\|(.+)\|\n\|[-|: ]+\|\n((?:\|.+\|\n?)*)/g,(_,hdr,rows)=>{
          const ths=hdr.split('|').filter(Boolean).map(h=>`<th>${h.trim()}</th>`).join('');
          const trs=rows.trim().split('\n').map(r=>'<tr>'+r.split('|').filter(Boolean).map(c=>{
            const t=c.trim();
            return /^#[0-9A-Fa-f]{6}$/.test(t)
              ?`<td><span style="display:inline-block;width:12px;height:12px;border-radius:2px;background:${t};border:1px solid #ccc;margin-right:5px;vertical-align:middle"></span><code>${t}</code></td>`
              :`<td>${t==='■'?'':t}</td>`;
          }).join('')+'</tr>').join('');
          return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
        })
        .replace(/\n\n/g,'</p><p>').replace(/^([^<\n].+)$/gm,'<p>$1</p>');
      const date=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'});
      const el=document.createElement('div');
      el.style.cssText='position:fixed;left:-9999px;top:0;width:794px;background:#fff;padding:0;font-family:Arial,sans-serif;font-size:11pt;line-height:1.65;color:#1a2733;box-sizing:border-box;';
      el.innerHTML=`
        <div style="background:#00274D;color:#fff;padding:20px 32px;display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:22px;font-weight:900;"><span style="color:#00A8B5">world</span>skills</div>
          <div style="font-size:10px;opacity:0.65;text-align:right;line-height:1.7;">Graphic Design Technology<br>${label}<br>NYP SDM Training</div>
        </div>
        <div style="height:3px;background:linear-gradient(90deg,#0066A1,#00A8B5)"></div>
        <div style="padding:28px 32px;">
          <div style="display:flex;gap:8px;margin-bottom:20px;">
            <span style="background:#E8F4F8;color:#0066A1;border-radius:4px;padding:3px 10px;font-size:9pt;font-weight:700;">${selCat?.label}</span>
            <span style="background:#CCFBF1;color:#0F766E;border-radius:4px;padding:3px 10px;font-size:9pt;font-weight:700;">${mins}-Minute Drill</span>
          </div>
          <style>
            h2{color:#00274D;border-bottom:2px solid #0066A1;padding-bottom:5px;margin-top:24px;font-size:14pt}
            h3{color:#0066A1;margin-top:16px;font-size:12pt}
            hr{border:none;border-top:1px solid #D0DDE6;margin:16px 0}
            blockquote{border-left:3px solid #00A8B5;background:#E8F4F8;padding:6px 12px;margin:8px 0}
            table{width:100%;border-collapse:collapse;margin:10px 0;font-size:10pt}
            th{background:#E8F4F8;color:#00274D;padding:6px 10px;border:1px solid #D0DDE6;text-align:left;font-weight:700}
            td{padding:5px 10px;border:1px solid #D0DDE6;vertical-align:middle}
            tr:nth-child(even) td{background:#F5F8FA}
            ul{margin:6px 0;padding-left:20px}li{margin-bottom:3px}
            strong{color:#00274D}p{margin:4px 0}
          </style>
          ${mdToHtml(content)}
          <div style="margin-top:40px;color:#607080;font-size:9pt;border-top:1px solid #D0DDE6;padding-top:10px;display:flex;justify-content:space-between;">
            <span>Generated for training purposes · NYP School of Design &amp; Media</span>
            <span>${date}</span>
          </div>
        </div>`;
      document.body.appendChild(el);
      const canvas=await window.html2canvas(el,{scale:2,useCORS:true,backgroundColor:'#ffffff'});
      document.body.removeChild(el);
      const {jsPDF}=window.jspdf;
      const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
      const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight();
      const scaledH=canvas.height*(pw/canvas.width);
      const imgData=canvas.toDataURL('image/png');
      let yOff=0,pageRem=scaledH,pg=0;
      while(pageRem>0){if(pg>0)pdf.addPage();pdf.addImage(imgData,'PNG',0,-yOff,pw,scaledH);yOff+=ph;pageRem-=ph;pg++;}
      pdf.save(`WSC-GDT-${selCat?.label.replace(/\s+/g,'-').toLowerCase()}-${label.toLowerCase().replace(/\s+/g,'-')}.pdf`);
    }catch(e){alert('PDF generation failed — try again.');}
    setDownloading(false);
  };

  const generate=async(catId,duration)=>{
    setBLoad(true);setStep('loading');setError('');
    setBrief('');setAppendix('');setTab('brief');
    setDone(false);setRunning(false);
    clearInterval(intervalRef.current);
    setRemaining(duration*60);
    const c=CATS.find(x=>x.id===catId);
    try{
      const text=await api(buildBriefSys(c.label,duration),`Category: ${c.label}\nDuration: ${duration} minutes\n\nGenerate the brief.`);
      setBrief(text);setStep('drill');
    }catch(e){setError(e.message);setStep('select');}
    setBLoad(false);
  };

  const genAppendix=async()=>{
    setALoad(true);setAppendix('');
    const c=CATS.find(x=>x.id===cat);
    try{
      const text=await api(buildAppendixSys(c.label),`Category: ${c.label}\n\nBrief:\n${brief}\n\nGenerate the appendix text now.`);
      setAppendix(text);
    }catch(e){setAppendix('> Error generating appendix — please try again.');}
    setALoad(false);
  };

  const pickCat=id=>id==='random'?REAL_CATS[Math.floor(Math.random()*REAL_CATS.length)].id:id;
  const reset=()=>{setStep('select');setCat(null);setMins(null);setBrief('');setAppendix('');setTab('brief');setError('');setRunning(false);setDone(false);clearInterval(intervalRef.current);};
  const resetTimer=()=>{setRemaining(mins*60);setRunning(false);setDone(false);clearInterval(intervalRef.current);};

  const timerCol=done?C.red:remaining<=300?C.red:remaining<=600?C.orange:C.teal;
  const elapsed=mins?(mins*60-remaining)/(mins*60):0;
  const milestones=[{label:'Concept',pct:0.30},{label:'Execution',pct:0.70},{label:'Refinement',pct:0.90}];
  const hdrBtn={background:'rgba(255,255,255,0.1)',color:'#fff',border:'1px solid rgba(255,255,255,0.25)',borderRadius:5,padding:'4px 11px',cursor:'pointer',fontSize:11,fontFamily:'inherit'};

  const currentContent=tab==='brief'?brief:appendix;
  const currentLabel=tab==='brief'?`Brief · ${mins} min`:'Appendix';

  return(
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:C.offwhite,minHeight:'100vh'}}>
      <div style={{background:C.navy,padding:'12px 20px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <div><span style={{color:C.teal,fontWeight:900,fontSize:15}}>world</span><span style={{color:'#fff',fontWeight:900,fontSize:15}}>skills</span></div>
        <div style={{width:1,height:16,background:'rgba(255,255,255,0.2)'}}/>
        <span style={{color:'rgba(255,255,255,0.6)',fontSize:10,letterSpacing:'0.08em'}}>GDT · QUICK DRILL</span>
        {step==='drill'&&(
          <div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
            <div style={{background:done?'rgba(239,68,68,0.2)':`${timerCol}22`,border:`1px solid ${timerCol}`,borderRadius:6,padding:'4px 12px',color:timerCol,fontWeight:800,fontSize:13,fontFamily:'monospace',minWidth:70,textAlign:'center',transition:'all 0.5s'}}>
              {done?'TIME UP':`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`}
            </div>
            {currentContent&&(
              <button onClick={()=>downloadPDF(currentContent,currentLabel)} disabled={downloading}
                style={{...hdrBtn,background:'rgba(0,168,181,0.25)',border:'1px solid rgba(0,168,181,0.55)',opacity:downloading?0.6:1,cursor:downloading?'wait':'pointer'}}>
                {downloading?'⏳ Generating...':'⬇ Download PDF'}
              </button>
            )}
            <button onClick={()=>generate(cat,mins)} style={hdrBtn}>↻ New Brief</button>
            <button onClick={reset} style={hdrBtn}>← New Drill</button>
          </div>
        )}
      </div>
      <div style={{height:3,background:`linear-gradient(90deg,${C.blue},${C.teal})`}}/>

      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 16px'}}>

        {step==='select'&&(
          <div>
            <div style={{marginBottom:22}}>
              <h1 style={{color:C.navy,fontSize:20,fontWeight:700,margin:'0 0 4px'}}>Quick Drill</h1>
              <p style={{color:C.muted,fontSize:13,margin:0}}>Select a category. A timed, single-task brief will be generated for practice.</p>
            </div>
            {error&&<div style={{background:'#FEE2E2',color:'#991B1B',padding:'10px 14px',borderRadius:8,marginBottom:16,fontSize:12,border:'1px solid #FCA5A5'}}><strong>Error:</strong> {error}</div>}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(138px,1fr))',gap:10}}>
              {CATS.map(c=>{
                const isR=c.id==='random',isH=hover===c.id;
                return <button key={c.id} onClick={()=>{const r=pickCat(c.id);setCat(r);setStep('duration');}}
                  onMouseOver={()=>setHover(c.id)} onMouseOut={()=>setHover(null)}
                  style={{background:isR?(isH?C.blue:C.navy):(isH?C.ltBlue:C.white),border:`2px solid ${isR?(isH?C.teal:C.blue):(isH?C.teal:C.border)}`,borderRadius:10,padding:'14px 10px',textAlign:'left',cursor:'pointer',transition:'all 0.12s',fontFamily:'inherit'}}>
                  <div style={{fontSize:20,marginBottom:6,color:isR?C.teal:C.blue}}>{c.icon}</div>
                  <div style={{fontWeight:700,fontSize:11,color:isR?'#fff':C.navy,marginBottom:2}}>{c.label}</div>
                  {!isR&&<div style={{marginTop:6,display:'inline-block',background:isH?C.white:C.ltBlue,borderRadius:4,padding:'2px 6px',fontSize:9,color:C.blue,fontWeight:700}}>{c.code}</div>}
                </button>;
              })}
            </div>
          </div>
        )}

        {step==='duration'&&(
          <div>
            <button onClick={()=>setStep('select')} style={{background:'none',border:'none',color:C.blue,cursor:'pointer',fontSize:12,marginBottom:18,padding:0,fontFamily:'inherit'}}>← Back</button>
            <h1 style={{color:C.navy,fontSize:20,fontWeight:700,margin:'0 0 4px'}}>Select Duration</h1>
            <p style={{color:C.muted,fontSize:13,marginBottom:20}}>Category: <strong style={{color:C.navy}}>{selCat?.label}</strong></p>
            <div style={{display:'flex',flexDirection:'column',gap:10,maxWidth:480}}>
              {[{d:30,desc:'Single focused deliverable · Quick concept · Ideal for daily warm-up'},{d:45,desc:'Single deliverable with refined scope · Suitable for weekly mock'}].map(({d,desc})=>(
                <button key={d} onClick={()=>{setMins(d);generate(cat,d);}}
                  onMouseOver={()=>setHover(d)} onMouseOut={()=>setHover(null)}
                  style={{background:hover===d?C.ltBlue:C.white,border:`2px solid ${hover===d?C.teal:C.border}`,borderRadius:10,padding:'16px 18px',textAlign:'left',cursor:'pointer',display:'flex',alignItems:'center',gap:16,fontFamily:'inherit',transition:'all 0.12s'}}>
                  <div style={{width:52,height:52,borderRadius:'50%',background:`${C.teal}18`,border:`2px solid ${C.teal}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:C.teal,flexShrink:0}}>{d}m</div>
                  <div><div style={{fontWeight:700,fontSize:14,color:C.navy,marginBottom:3}}>{d} Minutes</div><div style={{fontSize:11,color:C.muted}}>{desc}</div></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step==='loading'&&(
          <div style={{textAlign:'center',padding:'80px 20px'}}>
            <div style={{width:40,height:40,border:`4px solid ${C.border}`,borderTop:`4px solid ${C.teal}`,borderRadius:'50%',margin:'0 auto 18px',animation:'spin 0.8s linear infinite'}}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{color:C.navy,fontWeight:700,fontSize:14,margin:'0 0 5px'}}>Generating brief...</p>
            <p style={{color:C.muted,fontSize:12}}>Building client · deliverable · assets · colour palette</p>
          </div>
        )}

        {step==='drill'&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 188px',gap:16,alignItems:'start'}}>
            <div style={{background:C.white,borderRadius:10,boxShadow:'0 2px 14px rgba(0,39,77,0.07)',border:`1px solid ${C.border}`,overflow:'hidden'}}>
              {/* Panel header */}
              <div style={{background:C.navy,padding:'11px 22px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><span style={{color:C.teal,fontWeight:900,fontSize:13}}>world</span><span style={{color:'#fff',fontWeight:900,fontSize:13}}>skills</span></div>
                <div style={{display:'flex',gap:6}}>
                  <span style={{background:'rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.85)',borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700}}>{selCat?.label}</span>
                  <span style={{background:`${C.teal}35`,color:C.teal,borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700}}>{mins} min</span>
                </div>
              </div>
              <div style={{height:3,background:`linear-gradient(90deg,${C.blue},${C.teal})`}}/>

              {/* Tabs */}
              <div style={{display:'flex',borderBottom:`1px solid ${C.border}`,background:C.offwhite}}>
                {['brief','appendix'].map(t=>(
                  <button key={t} onClick={()=>setTab(t)}
                    style={{background:tab===t?C.white:'transparent',border:'none',borderBottom:tab===t?`3px solid ${C.teal}`:'3px solid transparent',padding:'10px 20px',cursor:'pointer',fontWeight:tab===t?700:400,fontSize:12,color:tab===t?C.navy:C.muted,fontFamily:'inherit',marginBottom:-1,textTransform:'capitalize',transition:'all 0.15s'}}>
                    {t==='brief'?'Brief':'Appendix'}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div style={{padding:'22px 26px',lineHeight:1.6,minHeight:300}}>
                {tab==='brief'&&renderMD(brief)}
                {tab==='appendix'&&(
                  appendix?renderMD(appendix):
                  aLoad?(
                    <div style={{textAlign:'center',padding:'50px 20px'}}>
                      <div style={{width:34,height:34,border:`4px solid ${C.border}`,borderTop:`4px solid ${C.teal}`,borderRadius:'50%',margin:'0 auto 14px',animation:'spin 0.8s linear infinite'}}/>
                      <p style={{color:C.navy,fontWeight:700,fontSize:13,margin:'0 0 4px'}}>Generating appendix...</p>
                      <p style={{color:C.muted,fontSize:11}}>Writing Appendix_01 text · image list · logo files</p>
                    </div>
                  ):(
                    <div style={{textAlign:'center',padding:'50px 20px'}}>
                      <div style={{fontSize:32,marginBottom:12}}>📄</div>
                      <p style={{color:C.navy,fontWeight:700,fontSize:14,marginBottom:6}}>Generate Appendix Text</p>
                      <p style={{color:C.muted,fontSize:12,maxWidth:380,margin:'0 auto 18px'}}>Generates Appendix_01 copy text, Appendix_02 image list, and Appendix_03 logo files — modelled on real WSC past-year paper style.</p>
                      <button onClick={genAppendix}
                        style={{background:C.navy,color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:'inherit'}}>
                        Generate Appendix
                      </button>
                    </div>
                  )
                )}
              </div>

              <div style={{borderTop:`1px solid ${C.border}`,padding:'8px 24px',display:'flex',justifyContent:'space-between',background:C.offwhite}}>
                <span style={{color:C.muted,fontSize:9}}>Generated for training purposes · NYP School of Design & Media</span>
                <span style={{color:C.muted,fontSize:9}}>{new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</span>
              </div>
            </div>

            {/* Timer */}
            <div style={{position:'sticky',top:16}}>
              <div style={{background:C.white,borderRadius:10,border:`1px solid ${C.border}`,overflow:'hidden',boxShadow:'0 2px 14px rgba(0,39,77,0.07)'}}>
                <div style={{background:C.navy,padding:'10px 14px',textAlign:'center'}}>
                  <div style={{color:'rgba(255,255,255,0.45)',fontSize:9,letterSpacing:'0.1em',fontWeight:700}}>SESSION TIMER</div>
                </div>
                <div style={{padding:'18px 14px 14px',textAlign:'center'}}>
                  {done?(
                    <div style={{padding:'12px 0'}}>
                      <div style={{fontSize:30,marginBottom:6}}>⏱</div>
                      <div style={{color:C.red,fontWeight:800,fontSize:15}}>Time's Up</div>
                      <div style={{color:C.muted,fontSize:11,marginTop:4}}>Wrap up and save your work</div>
                    </div>
                  ):<TimerRing remaining={remaining} total={mins*60} size={134}/>}
                  <div style={{display:'flex',flexDirection:'column',gap:7,marginTop:14}}>
                    {!done&&<button onClick={()=>setRunning(r=>!r)} style={{background:running?'#FEF9C3':C.navy,color:running?'#92400E':'#fff',border:`1px solid ${running?'#EAB308':C.navy}`,borderRadius:7,padding:'8px 0',cursor:'pointer',fontWeight:700,fontSize:12,fontFamily:'inherit',transition:'all 0.15s'}}>
                      {running?'⏸ Pause':remaining===mins*60?'▶ Start':'▶ Resume'}
                    </button>}
                    <button onClick={resetTimer} style={{background:C.offwhite,color:C.muted,border:`1px solid ${C.border}`,borderRadius:7,padding:'7px 0',cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>↺ Reset Timer</button>
                    <button onClick={()=>generate(cat,mins)} style={{background:C.ltBlue,color:C.blue,border:`1px solid ${C.border}`,borderRadius:7,padding:'7px 0',cursor:'pointer',fontSize:11,fontWeight:600,fontFamily:'inherit'}}>↻ New Brief</button>
                  </div>
                </div>
                <div style={{padding:'12px 14px',borderTop:`1px solid ${C.border}`,background:C.offwhite}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                    <span style={{fontSize:9,color:C.muted,fontWeight:600,letterSpacing:'0.06em'}}>PROGRESS</span>
                    <span style={{fontSize:9,color:timerCol,fontWeight:700}}>{Math.round(elapsed*100)}%</span>
                  </div>
                  <div style={{background:C.border,borderRadius:4,height:5,overflow:'hidden',marginBottom:12}}>
                    <div style={{background:timerCol,height:'100%',borderRadius:4,width:`${elapsed*100}%`,transition:'width 0.5s ease,background 0.5s ease'}}/>
                  </div>
                  <div style={{fontSize:9,color:C.muted,fontWeight:600,letterSpacing:'0.06em',marginBottom:6}}>MILESTONES</div>
                  {milestones.map(m=>{
                    const passed=elapsed>=m.pct;
                    return <div key={m.label} style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:passed?C.teal:C.border,flexShrink:0,transition:'background 0.5s',boxShadow:passed?`0 0 0 2px ${C.teal}30`:'none'}}/>
                      <span style={{fontSize:10,color:passed?C.teal:C.muted,fontWeight:passed?700:400,flex:1,transition:'color 0.5s'}}>{m.label}</span>
                      <span style={{fontSize:9,color:C.muted}}>{Math.round(mins*m.pct)}m</span>
                    </div>;
                  })}
                </div>
                <div style={{padding:'10px 14px',borderTop:`1px solid ${C.border}`,display:'flex',justifyContent:'center'}}>
                  <span style={{background:C.ltBlue,color:C.blue,borderRadius:5,padding:'3px 10px',fontSize:9,fontWeight:700}}>{selCat?.icon} {selCat?.code} · {mins} MIN</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
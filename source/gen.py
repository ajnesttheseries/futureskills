# Generates src/slides.html and notes.json for "Future-Ready Skills" (45 min, onsite)
import json, re
SPK = open('src/spk_img.txt').read()
ABOUT = open('src/about.html', encoding='utf-8').read().split('<!--SIM:ABOUT-->')[1]

def sc(bg='light', dark=0, x=4.6, y=-0.1, s=0.62, pose='present', props=None):
    d = {"bg": bg, "bot": {"x": x, "y": y, "s": s, "pose": pose}}
    if dark: d['dark'] = 1
    if props: d['props'] = props
    return json.dumps(d, ensure_ascii=False)

S, NOTES, IDS = [], [], []
def add(id, html, note):
    IDS.append(id); S.append(f'<!--S:{id}-->\n' + html.replace('<section class="slide', f'<section data-id="{id}" class="slide', 1)); NOTES.append(note)

F = [  # letter, key, en, th, color, slide id
    ('F', 'f', 'Fluency with AI', 'ใช้ AI เป็น · รู้ข้อจำกัด', '#2f2ff0', 'SF'),
    ('U', 'u', 'Understand &amp; Verify', 'คิดวิเคราะห์ · ตรวจงาน AI', '#0fa57a', 'SU'),
    ('T', 't', 'Think Creatively', 'คิดใหม่ · เลือกเป็น', '#ff7a1a', 'ST'),
    ('U', 'u2', 'Unlearn &amp; Relearn', 'เลิกบางอย่าง · เรียนไม่หยุด', '#8a4dff', 'SU2'),
    ('R', 'r', 'Resilience &amp; Agility', 'ปรับตัวไว · ล้มแล้วลุก', '#e23d5b', 'SR'),
    ('E', 'e', 'Empathy &amp; Influence', 'เข้าใจคน · สื่อสาร · นำทีม', '#e6a100', 'SE'),
]

# 1 COVER
add('COVER', f'''<section class="slide s-title fr-cover" data-scene='{sc("blue",1,3.6,0,1.15,"wave",[{"type":"sparkles"},{"type":"stairs","x":2.6,"y":-0.6,"z":-0.8,"s":0.8}])}'>
  <div class="col">
    <div class="kicker a" style="--d:.1s">KEYNOTE · 45 นาที</div>
    <h1 class="a" style="--d:.25s">Future-Ready Skills</h1>
    <h1 class="hl mid a" style="--d:.45s">ทักษะแห่งอนาคต</h1>
    <p class="lead a" style="--d:.65s">สู่ความสำเร็จในยุค AI</p>
    <div class="fword a" style="--d:.85s">{''.join(f'<span style="--c:{c}">{l}</span>' for l,_,_,_,c,_ in F)}</div>
  </div>
  <div class="spkr a" style="--d:1.05s">{SPK} alt="ทศพล บ้านคลองสี่"><div><small>วิทยากรโดย</small><b>ทศพล บ้านคลองสี่</b><span>(Aj. NesT the Series)</span></div></div>
</section>''', '''[00:00–00:40] เปิดตัว
• ทักทาย แนะนำหัวข้อ: วันนี้ 45 นาที เราจะคุยเรื่อง "ทักษะ" ไม่ใช่ "เครื่องมือ"
• ชี้คำว่า F-U-T-U-R-E ด้านล่าง: นี่คือ 6 ทักษะที่จะพาทุกคนกลับไปวันนี้''')

# 2 ABOUT
add('ABOUT', ABOUT.replace('<section class="slide', '<section class="slide', 1), '''[00:40–01:20] แนะนำตัวสั้น ๆ
• ทศพล บ้านคลองสี่ (Aj. NesT the Series) หัวหน้าภาควิชาวิศวกรรมมัลติมีเดียและเอ็นเตอร์เทนเมนต์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยกรุงเทพ
• คลิกปกหนังสือเพื่อขยายได้ (ไม่ต้องเล่าทุกเล่ม)
• เชื่อมเข้าเรื่อง: "ทุกองค์กรที่ผมไปสอน คำถามเดียวกันคือ เราต้องเก่งอะไรเพิ่ม"''')

# 3 HOOK
qs = [('🙋', 'สัปดาห์นี้ใช้ AI ช่วยทำงานแล้วอย่างน้อย 1 ครั้ง'), ('🤔', 'เคยเจอ AI ตอบมั่นใจ แต่ผิด'), ('😟', 'เคยคิดว่า "งานเราจะเปลี่ยนไปแค่ไหน"')]
add('HOOK', f'''<section class="slide s-div" data-scene='{sc("night",1,4.3,-0.1,0.9,"think",[{"type":"bubbles","x":2.2,"y":3.0,"z":-0.6,"s":0.8}])}'>
  <div class="col wide2">
    <div class="kicker dk a" style="--d:.1s">เริ่มด้วยการยกมือ</div>
    <h2 class="a" style="--d:.2s">ยกมือ ถ้าข้อไหน “ใช่” สำหรับคุณ</h2>
    <div class="hq">{''.join(f'<div class="hqc" data-st="{i+1}"><i>{e}</i><b>{i+1}</b><span>{t}</span></div>' for i,(e,t) in enumerate(qs))}</div>
    <button class="stp a" style="--d:.4s">▶ ถามข้อถัดไป</button>
    <div class="hqa" data-st="4"><em>ทุกคำตอบถูกหมด</em> — เพราะนี่คือสัญญาณว่า “ทักษะ” ที่งานต้องการ กำลังเปลี่ยน</div>
  </div>
</section>''', '''[01:20–03:00] Hook ยกมือ (3 รอบ)
• กด "ถามข้อถัดไป" ทีละข้อ ให้ยกมือค้างไว้ 2 วินาที แล้วสะท้อนสิ่งที่เห็น เช่น "เกินครึ่งห้องเลยครับ"
• ข้อ 3 พูดเบา ๆ ให้รู้สึกว่าเป็นเรื่องปกติ ไม่ต้องกลัว
• กดครั้งที่ 4 → ขึ้นข้อความเฉลย: ทุกคำตอบถูก แล้วส่งต่อ "มาดูตัวเลขกันว่าเปลี่ยนแค่ไหน"''')

# 4 QUIZ 39
add('QUIZ', f'''<section class="slide" data-scene='{sc("light",0,4.75,-0.15,0.62,"point",[{"type":"clock","x":3.9,"y":2.6,"z":-0.8,"s":0.6}])}'>
  <div class="col wide2">
    <div class="kicker a" style="--d:.1s">ทายตัวเลข</div>
    <h2 class="a" style="--d:.2s">ภายในปี 2030 ทักษะหลักที่เราใช้ทำงานวันนี้<br>จะ<span class="mk">เปลี่ยนไป</span>กี่เปอร์เซ็นต์?</h2>
    <div class="qz a" style="--d:.4s">
      <button class="qo" data-ok="0"><b>A</b>10%</button>
      <button class="qo" data-ok="1"><b>B</b>39%</button>
      <button class="qo" data-ok="0"><b>C</b>70%</button>
    </div>
    <div class="qans">
      <div class="qbig"><b class="big blue" data-to2="39" data-suf="%">39%</b><span>เกือบ <b>2 ใน 5</b> ของทักษะที่เรามีวันนี้<br>จะเปลี่ยนหรือล้าสมัยภายในปี 2030</span></div>
      <div class="sowhat"><em>SO WHAT?</em><span>ไม่ใช่ทุกอย่างจะหายไป แต่ <b>เกือบครึ่ง</b> ต้องอัปเดต</span></div>
    </div>
  </div>
  <div class="src a" style="--d:.6s">SOURCE / WEF Future of Jobs Report 2025 · ผู้ตอบ 1,000+ นายจ้าง 55 เศรษฐกิจ</div>
</section>''', '''[03:00–04:30] ทายตัวเลข
• อ่านคำถาม ให้ยกมือเลือก A / B / C (นับคร่าว ๆ)
• คลิกตัวเลือกใดก็ได้ → เฉลย 39% (ตัวเลขวิ่ง)
• ขยายความ: ปี 2023 ตัวเลขนี้คือ 44% แปลว่าการเปลี่ยนแปลงยังสูงต่อเนื่อง
• ประโยคจำ: "ไม่ได้แปลว่างานหาย แต่แปลว่าวิธีทำงานต้องอัปเดต"''')

# 5 PEOPLE 100
add('PPL', f'''<section class="slide" data-scene='{sc("light",0,5.25,-0.35,0.45,"present")}'>
  <div class="col wide2">
    <div class="kicker a" style="--d:.1s">ถ้าห้องนี้มี 100 คน</div>
    <h2 class="a" style="--d:.2s">ภายในปี 2030 จะมี <span class="mk">59 คน</span> ที่ต้องเรียนเพิ่ม</h2>
    <div class="pplw a" style="--d:.35s">
      <div class="ppl" data-split="41,29,19,11"></div>
      <div class="plg">
        <div class="pgl c0"><i></i><b>41</b><span>ไม่ต้องฝึกเพิ่มมาก</span></div>
        <div class="pgl c1"><i></i><b>29</b><span>Upskill · เก่งขึ้นในงานเดิม</span></div>
        <div class="pgl c2"><i></i><b>19</b><span>Reskill · ย้ายไปงานใหม่ในองค์กร</span></div>
        <div class="pgl c3"><i></i><b>11</b><span>เสี่ยงตกขบวน · เข้าไม่ถึงการฝึก</span></div>
      </div>
    </div>
    <div class="sowhat a" style="--d:.9s"><em>เป้าหมาย</em><span>เลือกเป็น 29 หรือ 19 คนที่ “เรียนเพิ่ม” อย่าเป็น 11 คนที่ถูกทิ้งไว้</span></div>
  </div>
  <div class="src a" style="--d:.6s">SOURCE / WEF Future of Jobs Report 2025 · Skills outlook (workforce of 100)</div>
</section>''', '''[04:30–06:00] คน 100 คน
• รอจุดสีวิ่งครบ แล้วอ่านทีละกลุ่ม (ชี้ที่ legend ได้ จะไฮไลต์กลุ่มนั้น)
• 41 คนไม่ต้องฝึกเพิ่มมาก · 29 คนเก่งขึ้นในงานเดิม · 19 คนย้ายงานในองค์กร · 11 คนเสี่ยง เพราะเข้าไม่ถึงการฝึก
• ถามห้อง: "คุณอยากอยู่กลุ่มไหน" → ประโยคจำ: "ความเสี่ยงไม่ได้อยู่ที่ AI แต่อยู่ที่การไม่เรียนเพิ่ม"''')

# 6 RISE / FALL
up = [('AI &amp; Big Data', 'เร็วที่สุด #1'), ('Networks &amp; Cybersecurity', '#2'), ('Technological literacy', '#3'), ('Creative thinking', ''), ('Resilience · flexibility · agility', ''), ('Curiosity &amp; lifelong learning', ''), ('Leadership &amp; social influence', '')]
add('RISE', f'''<section class="slide" data-scene='{sc("light",0,4.95,-0.25,0.5,"point")}'>
  <div class="col wide2">
    <div class="kicker a" style="--d:.1s">ทักษะไหนขาขึ้น · อะไรลดลง</div>
    <h2 class="a" style="--d:.2s">เทคโนโลยีนำ แต่ <span class="mk">ทักษะความเป็นคน</span> ตามมาติด ๆ</h2>
    <div class="rf">
      <div class="rfu a" style="--d:.35s"><h4>📈 โตเร็วที่สุดถึงปี 2030</h4>{''.join(f'<div class="ri{" t" if i<3 else " h"}"><span>{a}</span>{f"<em>{b}</em>" if b else ""}</div>' for i,(a,b) in enumerate(up))}<p class="rlg"><i class="t"></i>ทักษะเทคโนโลยี <i class="h"></i>ทักษะความเป็นคน</p></div>
      <div class="rfr">
        <div class="rfc a" style="--d:.5s"><h4>🏆 ทักษะหลักอันดับ 1 วันนี้</h4><b>Analytical thinking</b><span>คิดวิเคราะห์ · <b data-to="7">7</b> ใน 10 บริษัทบอกว่าจำเป็น</span></div>
        <div class="rfd a" style="--d:.65s"><h4>📉 ขาลง</h4><span><b>ทักษะ:</b> ใช้มือ ความอดทน ความแม่นยำ (24% คาดว่าลดลง)</span><span><b>อาชีพที่ลดเร็วที่สุด:</b> พนักงานไปรษณีย์ · เคาน์เตอร์ธนาคาร · คีย์ข้อมูล</span></div>
      </div>
    </div>
  </div>
  <div class="src a" style="--d:.6s">SOURCE / WEF Future of Jobs Report 2025 · fastest-growing skills &amp; declining roles</div>
</section>''', '''[06:00–07:45] ขาขึ้น / ขาลง
• ซ้าย: 3 อันดับแรกเป็นเทคโนโลยี (สีน้ำเงิน) แต่ที่เหลือคือทักษะความเป็นคน (สีส้ม): คิดสร้างสรรค์ ยืดหยุ่น อยากรู้ ภาวะผู้นำ
• ขวาบน: ทักษะหลักอันดับ 1 ยังเป็น "คิดวิเคราะห์" 7 ใน 10 บริษัท
• ขวาล่าง: ทักษะที่ลดคืองานใช้มือ/ความแม่นยำแบบทำซ้ำ และอาชีพที่ลดเร็วที่สุดคือพนักงานไปรษณีย์ เคาน์เตอร์ธนาคาร คีย์ข้อมูล (ไม่ต้องพูดให้น่ากลัว)
• ประโยคจำ: "AI ไม่ได้แข่งกับคน AI แข่งกับงานซ้ำ ๆ"''')

# 7 ROLE
add('ROLE', f'''<section class="slide wide" data-scene='{sc("light",0,4.95,-0.25,0.5,"present")}'>
  <div class="kicker a" style="--d:.1s">บทบาทใหม่ของคนทำงาน</div>
  <h2 class="a" style="--d:.2s">จาก “คนทำทุกขั้น” สู่ “คน<span class="mk">สั่ง · ตรวจ · ตัดสินใจ</span>”</h2>
  <div class="rl">
    <div class="rlc a" style="--d:.35s"><h4>BEFORE</h4><div class="rlf"><span class="me">🧑 คิด</span><span class="me">🧑 ค้น</span><span class="me">🧑 ร่าง</span><span class="me">🧑 คำนวณ</span><span class="me">🧑 จัดรูปแบบ</span><span class="me">🧑 ส่ง</span></div><p>เวลาหมดไปกับ “การทำ”</p></div>
    <div class="rlarr a" style="--d:.5s">→</div>
    <div class="rlc aft a" style="--d:.6s"><h4>AFTER</h4><div class="rlf"><span class="me">🧑 สั่ง<small>บอกเป้าหมาย</small></span><span class="ai">🤖 ค้น</span><span class="ai">🤖 ร่าง</span><span class="ai">🤖 คำนวณ</span><span class="me">🧑 ตรวจ<small>ถูกไหม</small></span><span class="me">🧑 ตัดสินใจ<small>เอาไหม</small></span></div><p>เวลาย้ายไปที่ “การคิดและตัดสินใจ”</p></div>
  </div>
  <div class="rls">
    <div class="rlst a" style="--d:.8s"><b data-to="50" data-suf="%">50%</b><span>บอกว่าทักษะที่สำคัญขึ้นคือ<br><b>ตรวจคุณภาพงานของ AI</b></span></div>
    <div class="rlst a" style="--d:.95s"><b data-to="46" data-suf="%">46%</b><span>บอกว่าคือ <b>Critical thinking</b><br>วิเคราะห์อย่างเป็นกลางแล้วตัดสินใจ</span></div>
  </div>
  <div class="src a" style="--d:.7s">SOURCE / Microsoft Work Trend Index 2026 · ผู้ใช้ AI 20,000 คน 10 ประเทศ</div>
</section>''', '''[07:45–09:30] บทบาทใหม่
• ซ้าย: เดิมเราทำเองทุกขั้น · ขวา: AI รับขั้นกลาง (ค้น ร่าง คำนวณ) แต่ "หัว" กับ "ท้าย" ยังเป็นของคน
• ตัวเลข: ยิ่ง AI ทำงานมาก คนยิ่งต้อง "ตรวจเป็น" (50%) และ "คิดเป็น" (46%)
• เกร็ด: กลุ่มใช้ AI ขั้นสูง (16% ของผู้ใช้) 43% ตั้งใจทำงานบางส่วนเองโดยไม่ใช้ AI เพื่อไม่ให้ทักษะหาย (กลุ่มอื่น 30%)
• ส่งต่อ: "แล้วต้องมีทักษะอะไรบ้าง ผมสรุปไว้ 6 ตัว จำง่าย ๆ ว่า FUTURE"''')

# 8 FUTURE overview
add('MAP', f'''<section class="slide wide" data-scene='{sc("night",1,4.95,-0.2,0.5,"cheer",[{"type":"sparkles"}])}'>
  <div class="kicker dk a" style="--d:.1s">6 ทักษะที่ต้องมี</div>
  <h2 class="a" style="--d:.2s">จำง่าย ๆ ว่า <span class="hl">F · U · T · U · R · E</span></h2>
  <div class="fgrid">{''.join(f'<button class="fcard a" style="--d:{.3+i*.1:.1f}s;--c:{c}" data-goto="{sid}"><b>{l}</b><span>{en}</span><em>{th}</em></button>' for i,(l,k,en,th,c,sid) in enumerate(F))}</div>
  <div class="fsplit a" style="--d:1s"><span><i style="--c:#2f2ff0"></i>F · U = ทำงานกับ AI ให้ได้ผลและปลอดภัย</span><span><i style="--c:#ff7a1a"></i>T · U · R = สมองและใจที่โตต่อได้</span><span><i style="--c:#e6a100"></i>E = สิ่งที่ AI แทนไม่ได้</span></div>
</section>''', '''[09:30–10:30] ภาพรวม FUTURE
• อ่านทีละตัว: F ใช้ AI เป็น · U ตรวจเป็น · T คิดใหม่ · U เรียนไม่หยุด · R ปรับตัว · E เข้าใจคน
• ชี้แถบล่าง: 2 ตัวแรกคือทำงานกับ AI · 3 ตัวกลางคือสมองและใจ · ตัวสุดท้ายคือสิ่งที่ AI แทนไม่ได้
• คลิกการ์ดเพื่อกระโดดไปทักษะนั้นได้ (ถ้ามีคนถามเจาะ)
• แต่ละทักษะใช้ 4 นาที: เล่า 1 · ทำกิจกรรม 2 · พากลับไปเป็นนิสัย 1''')

def skill(i, body, habit, ev, scene_props=None, pose='present'):
    l, k, en, th, c, sid = F[i]
    dots = ''.join(f'<i class="{"on" if j==i else ""}" style="--c:{F[j][4]}">{F[j][0]}</i>' for j in range(6))
    return f'''<section class="slide wide sk" style="--c:{c}" data-scene='{sc("light",0,5.3,-0.45,0.4,pose)}'>
  <div class="skh a" style="--d:.1s"><div class="skl">{l}</div><div><div class="skn">{en}</div><div class="skt">{th}</div></div><div class="skd">{dots}</div></div>
  {body}
  <div class="skf a" style="--d:1s"><span class="ev">📊 {ev}</span><span class="hb"><em>นิสัยที่พากลับไป</em>{habit}</span></div>
</section>'''

# 9 F
add('SF', skill(0, '''<div class="fl a" style="--d:.3s">
  <div class="flt"><button class="tgb on" data-v="a">สั่งแบบสั้น</button><button class="tgb" data-v="b">สั่งครบ 5 ส่วน (RCACO)</button><span class="dmy">ข้อมูลสมมติ</span></div>
  <div class="rcl"><div class="rci"><b class="r">R</b><div><strong>Role</strong><span>บทบาท · ให้ AI เป็นใคร</span></div></div><div class="rci"><b class="c">C</b><div><strong>Context</strong><span>บริบท · สถานการณ์</span></div></div><div class="rci"><b class="a2">A</b><div><strong>Action</strong><span>งาน · ให้ทำอะไร</span></div></div><div class="rci"><b class="c2">C</b><div><strong>Constraint</strong><span>เงื่อนไข · ห้าม · จำกัด</span></div></div><div class="rci"><b class="o">O</b><div><strong>Output</strong><span>ผลลัพธ์ · รูปแบบ</span></div></div></div>
  <div class="flp">
    <div class="flq"><div class="va">ช่วยสรุปรายงานยอดขายนี้หน่อย</div><div class="vb2"><div class="pln"><b class="r">R</b><span>คุณคือนักวิเคราะห์ที่สรุปงานให้ผู้บริหาร</span></div><div class="pln"><b class="c">C</b><span>รายงานยอดขาย Q3 ทีมภาคเหนือ · ผู้อ่านมีเวลา 2 นาที</span></div><div class="pln"><b class="a2">A</b><span>สรุปประเด็นสำคัญ + สิ่งที่ต้องตัดสินใจ</span></div><div class="pln"><b class="c2">C</b><span>ไม่เกิน 5 บรรทัด · ใช้ตัวเลขจากรายงานเท่านั้น</span></div><div class="pln"><b class="o">O</b><span>Bullet 3 ข้อ + คำถาม 1 ข้อให้ผู้บริหาร</span></div></div></div>
    <div class="fla"><div class="va">รายงานนี้พูดถึงหลายเรื่อง เช่น ยอดขาย ต้นทุน และแผนงาน โดยรวมผลการดำเนินงานถือว่าน่าพอใจ แต่ยังมีบางจุดที่ควรปรับปรุงเพื่อให้ดียิ่งขึ้นในอนาคต…<p class="vv">😐 อ่านแล้วไม่รู้จะทำอะไรต่อ</p></div><div class="vb2"><ul><li>ยอดขาย Q3 = <b>12.4 ล้านบาท</b> ต่ำกว่าเป้า 8%</li><li>สาเหตุหลัก: ลูกค้ารายใหญ่ 2 รายเลื่อนคำสั่งซื้อ</li><li>ต้นทุนขนส่งเพิ่ม 5% จากเส้นทางใหม่</li></ul><p class="qq">❓ ต้องตัดสินใจ: จัดโปรโมชัน Q4 ทันที หรือรอคำสั่งซื้อที่เลื่อน?</p><p class="vv">😀 พร้อมส่งผู้บริหาร</p></div></div>
  </div>
</div>''', 'ใช้ AI กับงานจริงวันละ 1 งาน แล้วสั่งให้ครบ 5 ส่วน', 'AI &amp; Big Data และ Tech literacy โตเร็วที่สุด (WEF 2025)', [{"type":"bubbles","x":3.9,"y":2.9,"z":-0.8,"s":0.5}]),
'''[10:30–14:30] F · Fluency with AI
• เล่า (1 นาที): ใช้ AI เป็น = รู้ว่าจะสั่งอะไร ได้ผลแบบไหน และรู้ว่ามันพลาดตรงไหนได้
• Demo (2 นาที): ปุ่ม "สั่งแบบสั้น" → ได้คำตอบกว้าง ๆ · กด "สั่งครบ 5 ส่วน" → ได้ตัวเลข สาเหตุ และคำถามให้ตัดสินใจ
• อธิบาย RCACO จากแถบด้านบน: R = Role บทบาท (ให้ AI เป็นใคร) · C = Context บริบท (สถานการณ์/ข้อมูล) · A = Action งาน (ให้ทำอะไร) · C = Constraint เงื่อนไข (ห้าม/จำกัดอะไร) · O = Output ผลลัพธ์ (หน้าตาแบบไหน)
• กด 'สั่งครบ 5 ส่วน' แล้วชี้ Prompt ทีละบรรทัดให้ตรงกับตัวอักษร
• ถามห้อง: "อันไหนเอาไปส่งหัวหน้าได้เลย" (ยกมือ)
• นิสัย: วันละ 1 งานจริง ไม่ต้องรอคอร์ส''')

# 10 U verify
add('SU', skill(1, '''<div class="vf a" style="--d:.3s">
  <div class="vft"><b>🤖 AI สรุปผลแบบสำรวจพนักงาน 2026</b><span class="dmy">ข้อมูลสมมติ</span><button class="tmr" data-sec="60">⏱ จับเวลา 60 วินาที</button></div>
  <div class="vfb">
    <p>จากผู้ตอบแบบสำรวจ 480 คน <s data-n="1">(อัตราตอบกลับ 60% ของพนักงาน 600 คน)<em>480 ÷ 600 = 80% ไม่ใช่ 60%</em></s> ความพึงพอใจเฉลี่ยอยู่ที่ 4.2 จาก 5 สูงขึ้นจากปีก่อน (3.9)</p>
    <p>คะแนนรายฝ่าย: ฝ่ายผลิต 3.8 · ฝ่ายบัญชี 4.1 · ฝ่ายขาย 4.5 <s data-n="2">ดังนั้นฝ่ายที่ต้องเร่งปรับปรุงที่สุดคือฝ่ายขาย<em>ฝ่ายขายคะแนนสูงสุด ข้อสรุปขัดกับข้อมูล</em></s></p>
    <p><s data-n="3">ผลวิจัยระบุว่า 92% ของพนักงานไทยอยากทำงานแบบไฮบริด<em>ตัวเลขนี้ไม่มีในข้อมูล และไม่บอกแหล่งที่มา</em></s> จึงควรเพิ่มวันทำงานจากที่บ้านเป็น 3 วันต่อสัปดาห์</p>
  </div>
  <div class="vfc"><button class="hnt">🔍 เฉลยทีละจุด</button><span class="hc">พบ 0 / 3</span><div class="chk"><b>เช็ก 3 ข้อทุกครั้ง</b><span>① ตัวเลขคำนวณถูกไหม</span><span>② มีแหล่งที่มาไหม</span><span>③ ข้อสรุปตรงกับข้อมูลไหม</span></div></div>
</div>''', 'ก่อนส่งงานที่ AI ช่วยทำ เช็ก 3 ข้อ: ตัวเลข · แหล่งที่มา · ตรรกะ', 'ทักษะที่สำคัญขึ้น: ตรวจงาน AI 50% · Critical thinking 46% (Microsoft WTI 2026)', [{"type":"magnifier","x":3.9,"y":2.8,"z":-0.8,"s":0.55}], 'think'),
'''[14:30–18:30] U · Understand & Verify
• เล่า (1 นาที): AI ตอบเร็วและมั่นใจ แต่ "มั่นใจ" ไม่ได้แปลว่า "ถูก" หน้าที่เราคือคนตรวจ
• กิจกรรม (2 นาที): กด "จับเวลา 60 วินาที" ให้คนข้าง ๆ ช่วยกันหาจุดผิด 3 จุด แล้วยกมือบอกว่าเจอกี่จุด
• กด "เฉลยทีละจุด" 3 ครั้ง: ① คำนวณผิด (480/600 = 80%) ② ข้อสรุปขัดข้อมูล ③ ตัวเลขไม่มีแหล่งที่มา
• นิสัย: เช็ก 3 ข้อ ตัวเลข · แหล่งที่มา · ตรรกะ ก่อนส่งงานทุกครั้ง''')

# 11 T creative
ideas = ['ส่งวาระล่วงหน้า 24 ชม.', 'ยืนประชุม 15 นาที', 'อัปเดตงานใน Chat ประชุมแค่เรื่องที่ต้องตัดสินใจ', 'ให้ AI สรุปประชุม + รายการงานทันที', 'เชิญเฉพาะคนที่ต้องตัดสินใจ', 'ประชุมทุก 2 สัปดาห์แทนทุกสัปดาห์', 'จับเวลาวาระละ 5 นาที', 'วันพุธไม่มีประชุม', 'ให้ AI ถามความเห็นทุกคนก่อนประชุมแล้วรวมสรุป', 'วาระละ 1 เจ้าของ 1 การตัดสินใจ']
add('ST', skill(2, f'''<div class="crx a" style="--d:.3s">
  <div class="crq"><span>โจทย์</span>ทำยังไงให้ประชุมประจำสัปดาห์ <b>สั้นลงครึ่งหนึ่ง</b>?<em>🤖 AI เสนอมา 10 ไอเดียใน 5 วินาที</em></div>
  <div class="crg">{''.join(f'<button class="idea"><i>{j+1}</i>{t}</button>' for j,t in enumerate(ideas))}</div>
  <div class="crc"><b>คนเลือก ด้วย 3 เกณฑ์</b><span>✨ ใหม่สำหรับทีมเรา</span><span>🛠 ทำได้ภายในสัปดาห์นี้</span><span>❤️ ทีมยอมรับ</span><button class="clr">ล้างดาว</button></div>
</div>''', 'ให้ AI ช่วยคิด “กว้าง” อย่างน้อย 10 ทาง แล้วคนเลือก “แคบ” ด้วยเกณฑ์ของทีม', 'Creative thinking อยู่ใน Top 5 ทักษะหลักและโตต่อเนื่อง (WEF 2025)', [{"type":"bulb","x":3.9,"y":2.8,"z":-0.8,"s":0.6}], 'think'),
'''[18:30–22:30] T · Think Creatively
• เล่า (1 นาที): ยุค AI ไอเดียถูกลง แต่ "การเลือกไอเดียที่ใช่" แพงขึ้น ความคิดสร้างสรรค์คือ ตั้งโจทย์ดี + เลือกเป็น
• กิจกรรม (2 นาที): ให้ห้องโหวตยกมือว่าข้อไหนใช้กับทีมตัวเองได้ คลิกการ์ดเพื่อติดดาว ⭐ ข้อที่คนยกมือเยอะ
• ถาม 1–2 คน: "เลือกข้อนี้เพราะอะไร" → ชี้ว่าเหตุผลของแต่ละคนต่างกันตามบริบททีม = สิ่งที่ AI ไม่รู้
• นิสัย: AI คิดกว้าง 10 ทาง คนเลือกแคบด้วยเกณฑ์ 3 ข้อ''')

# 12 U2 unlearn
add('SU2', skill(3, '''<div class="ul a" style="--d:.3s">
  <div class="ssk">
    <div class="ssc stop"><h4>🛑 STOP · เลิก</h4><span>พิมพ์รายงานรูปแบบเดิมเองทุกเดือน</span><span>คิดว่า “ต้องรู้ทุกอย่างก่อนถึงจะเริ่ม”</span></div>
    <div class="ssc start"><h4>🚀 START · เริ่ม</h4><span>ให้ AI ร่าง แล้วเราตรวจและปรับ</span><span>ถาม AI ให้ “สอน” เรื่องที่ไม่รู้ทีละขั้น</span></div>
    <div class="ssc keep"><h4>🧠 KEEP · เก็บไว้</h4><span>ทำบางงานเองโดยไม่ใช้ AI เพื่อไม่ให้ทักษะหาย</span><span>เขียนสรุปสิ่งที่เรียนด้วยคำของตัวเอง</span></div>
  </div>
  <div class="ulm"><div class="ulb"><b data-to="15">15</b><span>นาที / วัน</span></div><i>=</i><div class="ulb y"><b data-to="91">91</b><span>ชั่วโมง / ปี</span></div><p>เท่ากับเรียนคอร์สเต็มวัน (8 ชม.) ได้ <b>11 วัน</b> ต่อปี</p></div>
</div>''', 'เรียน 15 นาทีทุกวัน และเขียน STOP 1 อย่าง START 1 อย่าง', 'Curiosity &amp; lifelong learning อยู่ใน 10 ทักษะที่โตเร็วที่สุด (WEF 2025)', [{"type":"stairs","x":3.9,"y":2.4,"z":-0.9,"s":0.5}]),
'''[22:30–26:30] U · Unlearn & Relearn
• เล่า (1 นาที): ทักษะเกือบ 40% ต้องอัปเดต ดังนั้นการ "เลิก" วิธีเดิมสำคัญพอ ๆ กับการเรียนใหม่
• ชี้ 3 การ์ด: STOP · START · KEEP — KEEP มาจากงานวิจัย: คนที่ใช้ AI เก่งที่สุดตั้งใจทำบางงานเองเพื่อรักษาทักษะ
• กิจกรรม (2 นาที): ให้ทุกคนเขียนในมือถือหรือกระดาษ STOP 1 อย่าง START 1 อย่าง แล้วบอกคนข้าง ๆ
• ตัวเลข: 15 นาที/วัน × 365 วัน ≈ 91 ชั่วโมง ≈ คอร์สเต็มวัน 11 วัน''')

# 13 R resilience
flips = [('“ฉันทำไม่ได้”', '“ฉัน<b>ยัง</b>ทำไม่ได้… <b>ตอนนี้</b>”'), ('“AI จะมาแย่งงาน”', '“งานบางส่วนจะเปลี่ยน ฉัน<b>เลือกได้</b>ว่าจะไปทางไหน”'), ('“ลองแล้วพัง เสียเวลา”', '“พังรอบนี้ = <b>ได้ข้อมูล</b>สำหรับรอบหน้า”')]
add('SR', skill(4, f'''<div class="rs a" style="--d:.3s">
  <div class="rsf">{''.join(f'<button class="flip"><span class="fr1"><q>{a}</q><small>คลิกเพื่อเปลี่ยนมุมคิด</small></span><span class="fr2"><q>{b}</q></span></button>' for a,b in flips)}</div>
  <div class="rsl"><span>🧪 ลองเล็ก ๆ</span><i>→</i><span>📏 วัดผล</span><i>→</i><span>🔧 ปรับ</span><i>↺</i><em>ทุกสัปดาห์</em></div>
</div>''', 'ทดลองเล็ก ๆ 1 อย่างทุกสัปดาห์ แล้วถามตัวเองว่า “ได้เรียนอะไร”', 'Resilience, flexibility &amp; agility คือทักษะหลักอันดับ 2 (WEF 2025)', [{"type":"shield","x":3.9,"y":2.6,"z":-0.8,"s":0.55}], 'shield'),
'''[26:30–30:30] R · Resilience & Agility
• เล่า (1 นาที): การเปลี่ยนแปลงไม่หยุด ความต่างอยู่ที่ "ฟื้นตัวเร็วแค่ไหน" และ "กล้าลองเล็ก ๆ ไหม"
• กิจกรรม (2 นาที): อ่านประโยคซ้ายดัง ๆ ให้ห้องช่วยคิดว่าจะเปลี่ยนเป็นมุมไหน แล้วคลิกการ์ดเฉลย ทำทีละใบ
• ชี้ Loop ล่าง: ลองเล็ก → วัดผล → ปรับ ทุกสัปดาห์ ไม่ต้องรอโปรเจกต์ใหญ่
• นิสัย: ทดลองเล็ก ๆ สัปดาห์ละ 1 อย่าง''')

# 14 E empathy
add('SE', skill(5, '''<div class="em a" style="--d:.3s">
  <div class="emt"><span>สถานการณ์: แจ้งทีมว่าโปรเจกต์ต้องเลื่อน 2 สัปดาห์ และต้องทำงานเพิ่มช่วงเสาร์</span><button class="tgb on" data-v="a">🤖 AI ร่าง</button><button class="tgb" data-v="b">🧑 คนเติมใจ</button></div>
  <div class="emm"><div class="va"><p>เรียนทีมงานทุกท่าน</p><p>ขอแจ้งให้ทราบว่าโปรเจกต์ถูกเลื่อนออกไป 2 สัปดาห์ เนื่องจากความล่าช้าของผู้ส่งมอบ ทั้งนี้ขอให้ทุกท่านเข้าทำงานในวันเสาร์ที่ 6 และ 13 เพื่อให้งานเสร็จตามกำหนดใหม่</p><p>ขอบคุณครับ</p><p class="vv">😐 ถูกต้อง แต่ทีมอ่านแล้วรู้สึกถูกสั่ง</p></div>
  <div class="vb2"><p>ทุกคนครับ</p><p><mark>ก่อนอื่นขอบคุณที่ทุ่มเทกันมาตลอดเดือนนี้ ผมเห็นครับ</mark> โปรเจกต์ต้องเลื่อน 2 สัปดาห์ เพราะผู้ส่งมอบส่งของช้า <mark>ไม่ใช่เพราะงานของทีมเรา</mark></p><p>เราต้องเข้างานวันเสาร์ที่ 6 และ 13 <mark>ผมจะเข้าด้วยทั้ง 2 วัน มีอาหารกลางวัน และให้หยุดชดเชยวันศุกร์ถัดไป</mark></p><p><mark>ใครติดธุระวันไหน บอกผมได้ภายในพรุ่งนี้ เราจะจัดคนให้</mark> ขอบคุณครับ</p><p class="vv">😀 ข้อมูลเท่าเดิม แต่ทีมรู้สึกว่ามีคนเห็นใจ</p></div></div>
</div>''', 'ให้ AI ร่าง แล้วเติม 3 อย่างที่ AI ไม่รู้: ความรู้สึก · เหตุผล · สิ่งที่เราจะช่วย', 'Leadership &amp; social influence โตเร็ว · Empathy อยู่ใน 10 ทักษะหลัก (WEF 2025)', [{"type":"people","x":3.9,"y":2.6,"z":-0.8,"s":0.55}], 'wave'),
'''[30:30–34:30] E · Empathy & Influence
• เล่า (1 นาที): AI เขียนได้ถูก แต่ยังไม่รู้จักทีมเรา ความไว้ใจและความสัมพันธ์ยังเป็นงานของคน
• Demo (2 นาที): อ่านร่างของ AI ก่อน ถามห้องว่า "ถ้าได้รับข้อความนี้ รู้สึกยังไง" → กด "คนเติมใจ" ชี้ส่วนที่ไฮไลต์ทีละจุด
• สิ่งที่เติม: ขอบคุณ · บอกเหตุผลที่ไม่โทษทีม · หัวหน้าลงมือด้วย · ทางเลือกให้คนที่ติดธุระ
• นิสัย: AI ร่าง คนเติม 3 อย่าง ความรู้สึก เหตุผล สิ่งที่เราจะช่วย''')

# 15 SELF CHECK
rows = ''.join(f'<div class="scr" data-i="{j}" style="--c:{c}"><b>{l}</b><span>{en}</span><div class="scbt">{"".join(f"<button data-v={v}>{v}</button>" for v in range(1,6))}</div></div>' for j,(l,k,en,th,c,sid) in enumerate(F))
add('CHECK', f'''<section class="slide wide" data-scene='{sc("light",0,5.2,-0.3,0.42,"point")}'>
  <div class="kicker a" style="--d:.1s">Self-check · 1 นาที</div>
  <h2 class="a" style="--d:.2s">ให้คะแนนตัวเอง 1–5 ทั้ง 6 ทักษะ</h2>
  <div class="sc a" style="--d:.3s">
    <div class="scl">{rows}<p class="sch">1 = เพิ่งเริ่ม · 3 = ทำได้บ้าง · 5 = สอนคนอื่นได้</p></div>
    <div class="scv"><svg class="radar" viewBox="-215 -220 430 440"></svg><div class="scr2">ทักษะที่ควรเริ่มก่อน: <b class="low">—</b></div><button class="scx">↺ ล้างคะแนน</button></div>
  </div>
</section>''', '''[34:30–37:30] Self-check
• ให้ทุกคนให้คะแนนตัวเองในใจหรือบนกระดาษ 1–5 ทั้ง 6 ทักษะ (1 นาที)
• วิทยากรสาธิตบนจอ: คลิกคะแนนของตัวเองหรือของอาสาสมัคร 1 คน กราฟใยแมงมุมจะขึ้นตาม และระบบชี้ทักษะคะแนนต่ำสุด
• ย้ำ: ไม่มีใครเต็มทุกช่อง คะแนนต่ำ = จุดที่คุ้มที่สุดที่จะเริ่ม
• กด "ล้างคะแนน" ก่อนไปหน้าถัดไปถ้าจะสาธิตซ้ำ''')

# 16 PLAN 1-1-1
add('PLAN', f'''<section class="slide wide" data-scene='{sc("light",0,5.1,-0.3,0.48,"present")}'>
  <div class="kicker a" style="--d:.1s">แผน 30 วัน</div>
  <h2 class="a" style="--d:.2s">แผน <span class="mk">1 · 1 · 1</span> ที่เริ่มได้พรุ่งนี้</h2>
  <div class="p3">
    <div class="p3c a" style="--d:.3s"><i>1</i><b>ทักษะ</b><span>เลือกทักษะที่คะแนนต่ำสุด 1 ตัว</span><em>เช่น U · ตรวจงาน AI</em></div>
    <div class="p3c a" style="--d:.45s"><i>1</i><b>งานจริง</b><span>เลือกงานจริงที่จะฝึกทักษะนั้น</span><em>เช่น รายงานประจำเดือน</em></div>
    <div class="p3c a" style="--d:.6s"><i>1</i><b>นิสัย / สัปดาห์</b><span>ทำซ้ำทุกสัปดาห์ จนเป็นอัตโนมัติ</span><em>เช่น เช็ก 3 ข้อก่อนส่งทุกครั้ง</em></div>
  </div>
  <div class="p4 a" style="--d:.8s"><span><b>สัปดาห์ 1</b>ลองครั้งแรก</span><span><b>สัปดาห์ 2</b>ทำซ้ำ + จดสิ่งที่เรียน</span><span><b>สัปดาห์ 3</b>ชวนเพื่อน 1 คน</span><span><b>สัปดาห์ 4</b>เทียบก่อน–หลัง</span></div>
  <div class="ptm a" style="--d:.9s"><span>💬 บอกแผนของคุณกับคนข้าง ๆ</span><button class="tmr big" data-sec="60">⏱ 60 วินาที</button></div>
</section>''', '''[37:30–41:00] แผน 1-1-1
• อธิบาย 3 การ์ด: 1 ทักษะ (จาก Self-check) · 1 งานจริง · 1 นิสัยรายสัปดาห์
• แถบ 4 สัปดาห์: ลอง → ทำซ้ำ → ชวนเพื่อน → เทียบก่อน–หลัง
• กด "60 วินาที" ให้จับคู่บอกแผนกับคนข้าง ๆ (คนละ 30 วินาที)
• หมดเวลา ถาม 1–2 คนให้แชร์แผนสั้น ๆ''')

# 17 CLOSE
add('CLOSE', f'''<section class="slide s-title fr-close" data-scene='{sc("blue",1,3.6,0,1.1,"cheer",[{"type":"confetti"},{"type":"sparkles"}])}'>
  <div class="col">
    <div class="kicker dk a" style="--d:.1s">ข้อคิดก่อนจากกัน</div>
    <h1 class="quote a" style="--d:.25s">อนาคตไม่ได้เป็นของคนที่รู้มากที่สุด<br><span class="hl">แต่เป็นของคนที่เรียนรู้เร็วที่สุด</span></h1>
    <div class="fword sm a" style="--d:.55s">{''.join(f'<span style="--c:{c}">{l}</span>' for l,_,_,_,c,_ in F)}</div>
    <p class="lead a" style="--d:.7s">ขอบคุณครับ · <b>Q&amp;A</b></p>
  </div>
  <div class="spkr a" style="--d:.9s">{SPK} alt="ทศพล บ้านคลองสี่"><div><small>วิทยากรโดย</small><b>ทศพล บ้านคลองสี่</b><span>(Aj. NesT the Series)</span></div></div>
</section>''', '''[41:00–45:00] ปิด + Q&A
• ทวน FUTURE เร็ว ๆ 6 ตัว ใน 20 วินาที
• อ่านประโยคปิดช้า ๆ แล้วเงียบ 2 วินาที
• เปิดถาม-ตอบ (คำถามที่น่าจะเจออยู่ในเอกสารบทพูด)''')

open('src/slides.html', 'w', encoding='utf-8').write('\n'.join(S))
json.dump({'ids': IDS, 'notes': NOTES}, open('notes.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(len(IDS), IDS)

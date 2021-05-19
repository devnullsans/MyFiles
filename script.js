'use strict';
let db, ti;
const El = {
  wL: [...document.getElementsByTagName('label')],
  tI: [...document.getElementsByTagName('input')],
  cM: document.getElementById('mc'),
  mP: document.getElementById('mp'),
  dL: document.createElement('a'),
  sD: new Set()
};
const pfM = (m, c) => {
  El.mP.innerText = m;
  El.mP.style.color = c;
  El.mP.style.visibility = 'visible';
  window.clearTimeout(ti);
  ti = window.setTimeout(() => El.mP.style.visibility = 'hidden', 3256);
};
const shE = (ev) => {
  console.error(ev);
  pfM('ERROR', 'crimson');
};
const shW = (ev) => {
  console.warn(ev);
  pfM('WARND', 'orangered');
};
const shM = (ev) => {
  console.log(ev);
  pfM('ALLOK', 'green');
};
const gID = (chk = []) => {
  let id;
  const A = Array(10).fill(36);
  do id = A.map(e => ((e * Math.random()) | 0).toString(e)).join('');
  while (chk.find?.(i => i === id));
  return id;
};
const dlF = (fl) => {
  El.dL.download = fl.name;
  El.dL.href = URL.createObjectURL(fl);
  El.dL.click();
  URL.revokeObjectURL(El.dL.href);
};
El.tI[0].onclick = (ev) => {
  ev.preventDefault();
  if (!window.confirm('Delete All your Files?')) return;
  db.transaction('Files', 'readwrite').objectStore('Files').clear().onsuccess = (se) => {
    El.cM.innerHTML = null;
    El.sD.clear();
    El.tI[2].disabled = El.tI[3].disabled = true;
    El.wL[2].classList.add('ld');
    El.wL[3].classList.add('ld');
    shM(se);
  };
};
El.tI[1].onchange = (ev) => {
  ev.preventDefault();
  let htm = '';
  const ids = [...El.cM.getElementsByTagName('div')].map(d => d.id);
  const store = db.transaction('Files', 'readwrite').objectStore('Files');
  store.transaction.oncomplete = (ce) => {
    El.cM.innerHTML = htm;
    shM(ce);
  };
  for (const data of ev.target.files) {
    const fid = gID(ids);
    store.add({ fid, data }).onsuccess = () => htm +=
    `<div onclick="slD(event)" id="${fid}">
    <Span class="ico-s">${data.type}</Span>
    <Span class="nme-s">${data.name}</Span>
    <Span class="siz-s">${data.size}</Span>
    </div>`;
    ids.push(fid);
  }
};
El.tI[2].onclick = (ev) => {
  ev.preventDefault();
  const store = db.transaction('Files').objectStore('Files');
  store.transaction.oncomplete = (ce) => {
    El.sD.forEach(id => document.getElementById(id).classList.toggle('seled'));
    El.sD.clear();
    El.tI[2].disabled = El.tI[3].disabled = true;
    El.wL[2].classList.add('ld');
    El.wL[3].classList.add('ld');
    shM(ce);
  };
  El.sD.forEach(f => store.get(f).onsuccess = se => dlF(se.target.result.data));
};
El.tI[3].onclick = (ev) => {
  ev.preventDefault();
  if (!window.confirm('Delete your Selected Files?')) return;
  const store = db.transaction('Files', 'readwrite').objectStore('Files');
  store.transaction.oncomplete = (ce) => {
    El.sD.forEach(id => El.cM.removeChild(document.getElementById(id)));
    El.sD.clear();
    El.tI[2].disabled = El.tI[3].disabled = true;
    El.wL[2].classList.add('ld');
    El.wL[3].classList.add('ld');
    shM(ce);
  };
  El.sD.forEach(f => store.delete(f));
};
const slD = (ev) => {
  ev.preventDefault();
  const d = ev.target.tagName === 'DIV' ? ev.target : ev.target.parentElement;
  if (d.classList.toggle('seled')) El.sD.add(d.id);
  else El.sD.delete(d.id);
  if (El.sD.size > 0) {
    El.tI[2].disabled = El.tI[3].disabled = false;
    El.wL[2].classList.remove('ld');
    El.wL[3].classList.remove('ld');
  } else {
    El.tI[2].disabled = El.tI[3].disabled = true;
    El.wL[2].classList.add('ld');
    El.wL[3].classList.add('ld');
  }
};
const cDB = (ev) => {
  if (!ev.target?.result.objectStoreNames.contains('Files'))
    ev.target.result.createObjectStore('Files', { keyPath: 'fid' });
};
const ilF = (ev) => {
  if (!db) {
    db = ev.target.result;
    db.onabort = shW;
    db.onclose = shM;
    db.onerror = shE;
    db.onversionchange = shW;
  }
  db.transaction('Files').objectStore('Files').getAll().onsuccess = (se) => {
    El.cM.innerHTML = se.target.result.map(f =>
    `<div onclick="slD(event)" id="${f.fid}">
    <Span class="ico-s">${f.data.type}</Span>
    <Span class="nme-s">${f.data.name}</Span>
    <Span class="siz-s">${f.data.size}</Span>
    </div>`).join('');
    El.tI[0].disabled = El.tI[1].disabled = false;
    El.wL[0].classList.remove('ld');
    El.wL[1].classList.remove('ld');
  };
};
(() => {
  try { if (!window.indexedDB) return pfM('IDB-API Not Supported!', 'red'); }
  catch (e) { pfM(`Storage Unavailable!\n${e}`, 'red'); }
  const cn = window.indexedDB.open('FilesDB');
  cn.onerror = shE;
  cn.onblocked = shW;
  cn.onupgradeneeded = cDB;
  cn.onsuccess = ilF;
})();

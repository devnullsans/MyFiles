const El = {
  wL: [...document.getElementsByTagName('label')],
  tI: [...document.getElementsByTagName('input')],
  cM: document.getElementById('mc'),
  mP: document.getElementById('mp'),
  dL: document.createElement('a'),
  sD: new Set(),
  iD: new Set()
};
let db, ti;
const off = () => El.mP.style.visibility = 'hidden';
const pfM = (m, c) => {
  El.mP.innerText = m;
  El.mP.style.color = c;
  El.mP.style.visibility = 'visible';
  window.clearTimeout(ti);
  ti = window.setTimeout(off, 3256);
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
const gID = () => {
  const a = Array(10).fill(36);
  a.forEach((e, i) => a[i] = ((e * Math.random()) | 0).toString(e));
  return a.join('');
};
const dlF = (fl) => {
  El.dL.target = '_blank';
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
    El.iD.clear();
    El.tI[2].disabled = El.tI[3].disabled = true;
    El.wL[2].classList.add('ld');
    El.wL[3].classList.add('ld');
    shM(se);
  };
};
El.tI[1].onchange = (ev) => {
  ev.preventDefault();
  let txt = '';
  const store = db.transaction('Files', 'readwrite').objectStore('Files');
  store.transaction.oncomplete = (ce) => {
    El.cM.innerHTML += txt;
    shM(ce);
  };
  for (data of ev.target.files) {
    let fid = gID();
    while (El.iD.has(fid)) fid = gID();
    El.iD.add(fid);
    const o = { fid, data };
    store.add(o).onsuccess = () => txt += `<div onclick="slD(event)" id="${o.fid}"><Span class="ico-s">${o.data.type}</Span><Span class="nme-s">${o.data.name}</Span><Span class="siz-s">${o.data.size}</Span></div>`;
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
  El.sD.forEach(f => store.delete(f).onsuccess = () => El.iD.delete(f));
};
const slD = (ev) => {
  ev.preventDefault();
  const d = ev.target.tagName === 'DIV' ? ev.target : ev.target.parentElement;
  if (d.classList.toggle('seled')) El.sD.add(d.id);
  else El.sD.delete(d.id);
  // below code could be shifted to a new function if needed
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
  if (!ev.target?.result?.objectStoreNames?.contains('Files'))
    ev.target?.result?.createObjectStore('Files', { keyPath: 'fid' });
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
    El.cM.innerHTML = se.target.result.map((f) => {
      El.iD.add(f.fid);
      return `<div onclick="slD(event)" id="${f.fid}">
      <Span class="ico-s">${f.data.type}</Span>
      <Span class="nme-s">${f.data.name}</Span>
      <Span class="siz-s">${f.data.size}</Span></div>`;
    }).join('');
    El.tI[0].disabled = El.tI[1].disabled = false;
    El.wL[0].classList.remove('ld');
    El.wL[1].classList.remove('ld');
  };
};
(() => {
  try {
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || { READ_WRITE: 'readwrite' };
    if (!window.indexedDB) throw new Error('IDB-API Not Supported!');
  } catch (err) { return shE(err); }
  const cn = window.indexedDB.open('FilesDB');
  cn.onerror = shE;
  cn.onblocked = shW;
  cn.onupgradeneeded = cDB;
  cn.onsuccess = ilF;
})();
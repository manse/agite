document.addEventListener('Agite_open', e => {
  chrome.runtime.sendMessage({
    namespace: 'agite',
    event: 'open',
    data: e.detail
  });
});

chrome.runtime.onMessage.addListener(e => {
  if (e.namespace !== 'agite') return;
  switch (e.event) {
    case 'update':
      updateParameter();
      break;
    case 'clear':
      clearParameter();
      break;
  }
});

function updateParameter() {
  chrome.storage.local.get(['match', 'find', 'replace', 'regex'], result => {
    executeCode(`window.__agite__ = ${JSON.stringify(result)}`);
  });
}

function clearParameter() {
  executeCode(`window.__agite__ = null`);
}

function executeCode(code) {
  const script = document.createElement('script');
  script.textContent = code;
  document.body.appendChild(script);
  requestAnimationFrame(() => script.remove());
}

function loadPageScript() {
  const script = document.createElement('script');
  script.src = chrome.extension.getURL('backend/page-script.js');
  document.body.appendChild(script);
  script.addEventListener('load', () => script.remove());
}

loadPageScript();
chrome.runtime.sendMessage({
  namespace: 'agite',
  event: 'ready'
});

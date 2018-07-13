const connections = {};

chrome.runtime.onConnect.addListener(port => {
  let tabId = null;
  const listener = e => {
    if (e.namespace !== 'agite') return;
    switch (e.event) {
      case 'init':
        console.info('Add connection:', e.tabId);
        tabId = e.tabId;
        connections[tabId] = port;
        chrome.tabs.sendMessage(tabId, {
          namespace: 'agite',
          event: 'update'
        });
        break;
      case 'update':
        console.info('Update parameter:', e.tabId);
        chrome.tabs.sendMessage(e.tabId, {
          namespace: 'agite',
          event: 'update'
        });
        break;
    }
  };
  port.onMessage.addListener(listener);
  port.onDisconnect.addListener(_ => {
    console.info('Disconnect:', tabId);
    port.onMessage.removeListener(listener);
    if (!tabId) return;
    delete connections[tabId];
    console.info('Clear parameter:', tabId);
    chrome.tabs.sendMessage(tabId, {
      namespace: 'agite',
      event: 'clear'
    });
  });
});

chrome.runtime.onMessage.addListener((e, { tab }) => {
  if (!tab || e.namespace !== 'agite') return true;
  switch (e.event) {
    case 'open':
      const connection = connections[tab.id];
      connection &&
        connection.postMessage({
          namespace: 'agite',
          event: 'open',
          data: e.data
        });
      break;
    case 'ready':
      if (connections[tab.id]) {
        console.info('Do setup parameter', tab.id);
        chrome.tabs.sendMessage(tab.id, {
          namespace: 'agite',
          event: 'update'
        });
      } else {
        console.info('Skip setup parameter', tab.id);
      }
      break;
  }
  return true;
});

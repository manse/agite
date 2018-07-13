const app = new Vue({
  el: '#app',
  data: {
    match: '',
    find: '',
    replace: '',
    regex: false,
    id: 0,
    logs: []
  },
  methods: {
    addLog: function(url) {
      this.logs.push({
        id: this.id++,
        url
      });
      if (this.logs.length > 100) {
        this.logs.shift();
      }
    },
    restore: function({ match, find, replace, regex }) {
      this.match = match;
      this.find = find;
      this.replace = replace;
      this.regex = regex;
    },
    clear: function() {
      this.match = '';
      this.find = '';
      this.replace = '';
    }
  },
  watch: {
    match: function() {
      updateParameters(this);
    },
    find: function() {
      updateParameters(this);
    },
    replace: function() {
      updateParameters(this);
    },
    regex: function() {
      updateParameters(this);
    }
  },
  computed: {
    displayLogs: function() {
      const rMatch = new RegExp(this.match);
      const rFind = new RegExp(`(${this.find})`, 'g');
      const isMatch = this.regex
        ? str => rMatch.test(str)
        : str => this.match && str.indexOf(this.match) !== -1;
      const transformBeforeUrl = this.regex
        ? str => str.replace(rFind, '<b>$1</b>')
        : str => str.split(this.find).join(`<b>${this.find}</b>`);
      const transformAfterUrl = this.regex
        ? str => str.replace(rFind, `<b>${this.replace}</b>`)
        : str => str.split(this.find).join(`<b>${this.replace}</b>`);
      return this.logs
        .slice()
        .reverse()
        .filter(log => !this.match || isMatch(log.url))
        .map(log => ({
          ...log,
          beforeUrlHTML: transformBeforeUrl(log.url),
          afterUrlHTML: transformAfterUrl(log.url)
        }));
    }
  }
});

chrome.storage.local.get(['match', 'find', 'replace', 'regex'], result => {
  app.restore(result);
});

function updateParameters({ match, find, replace, regex }) {
  chrome.storage.local.set({ match, find, replace, regex }, () => {
    backgroundConnection.postMessage({
      namespace: 'agite',
      event: 'update',
      tabId: chrome.devtools.inspectedWindow.tabId
    });
  });
}

chrome.runtime.onMessage.addListener(({ namespace, event, data }) => {
  if (namespace !== 'agite') return;
  switch (event) {
    case 'open':
      app.addLog(data.url);
      break;
  }
});

const backgroundConnection = chrome.runtime.connect({
  name: 'agite'
});
backgroundConnection.postMessage({
  namespace: 'agite',
  event: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId
});

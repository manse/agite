(() => {
  const _open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    document.dispatchEvent(
      new CustomEvent('Agite_open', {
        detail: {
          method: arguments[0],
          url: arguments[1]
        }
      })
    );
    const params = [].slice.call(arguments);
    if (window.__agite__) {
      const { match, find, replace, regex } = window.__agite__;
      const isMatch = regex
        ? str => new RegExp(match).test(str)
        : str => match && str.indexOf(match) !== -1;
      const transform = regex
        ? str => str.replace(new RegExp(`(${find})`, 'g'), replace)
        : str => str.split(find).join(replace);
      if (isMatch(params[1])) {
        params[1] = transform(params[1]);
      }
    }
    return _open.apply(this, params);
  };
})();

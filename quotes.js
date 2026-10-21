(() => {
// Daily quotes, in the current language. Everything is old enough to be in the public domain, and
// only quotes with a known source are included (no internet misattributions). Everyone sees the
// same quote on the same day.
function quoteFor(date){
  let list = L.t("quotes");
  if(!Array.isArray(list) || list.length !== I18N.en.quotes.length) list = I18N.en.quotes;
  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())/86400000);
  const n = list.length;
  const i = ((dayNumber*37) % n + n) % n;   // 37 is coprime with the list length, so every quote comes round
  return {text:list[i][0], by:list[i][1]};
}

window.Quotes = {quoteFor};
})();

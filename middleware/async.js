// Express 4 não captura erros de funções async: este wrapper manda o erro para o tratador central (app.js).
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

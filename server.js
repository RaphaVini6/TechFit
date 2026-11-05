require('dotenv').config();

const app = require('./app');
const { iniciarBanco } = require('./models');

const port = process.env.PORT || 3000;

iniciarBanco()
  .then(() => {
    app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
  })
  .catch((error) => {
    console.error('Erro ao conectar ao banco de dados', error);
    process.exit(1);
  });

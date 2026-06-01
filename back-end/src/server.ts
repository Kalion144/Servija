import 'dotenv/config'

import app from './app.js'

import { conectarBanco }
from './db/connection.js'

const port = process.env.PORT || 3000

async function iniciarServidor() {

  await conectarBanco()

  app.listen(port, () => {

    console.log(
      `🚀 Servidor rodando em http://localhost:${port}`
    )

  })

}

iniciarServidor()
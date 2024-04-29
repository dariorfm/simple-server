require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const Note = require('./models/note')

// Definiendo middleware personalizado
const requestLogger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path:', req.path)
  console.log('Body:', req.body)
  console.log('---')
  next()
}

// Middleware que se usa para servir archivos estáticos
app.use(express.static('dist'))

// Middleware que se usa para capturar solicitudes que contienen datos JSON
// Los datos se almacenan en req.body
// Es importante que este middleware se use antes de los middleware que manejan las rutas
// De lo contrario, req.body estará vacío
app.use(express.json())

// Usando el middleware personalizado tan solo después del middleware que captura solicitudes con datos JSON
app.use(requestLogger)

// Middleware que se usa para permitir solicitudes desde cualquier origen
app.use(cors())

// Datos de prueba o recursos de la API
/* const notes = [
  {
    id: 1,
    content: 'HTML is easy',
    date: '2019-05-30T17:30:31.098Z',
    important: true
  },
  {
    id: 2,
    content: 'Browser can execute only Javascript',
    date: '2019-05-30T18:39:34.091Z',
    important: false
  },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    date: '2019-05-30T19:20:14.298Z',
    important: true
  }
]
*/

// Rutas
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (req, res) => {
  Note.find({}).then(result => {
    res.json(result)
  })
})

app.get('/api/notes/:id', (req, res, next) => {
  Note.findById(req.params.id).then(note => {
    if (note) {
      res.json(note)
    } else {
      res.status(404).end()
    }
  })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (req, res, next) => {
  Note.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
      console.log('This line prints the result parameter:' + result)
    })
    .catch(error => next(error))
})

app.post('/api/notes', (req, res, next) => {
  const body = req.body
  if (body.content === undefined) {
    return res.status(400).json({ error: 'content missing' })
  }
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  })

  note.save().then(savedNote => {
    res.json(savedNote)
  })
    .catch(error => next(error))
})

app.put('/api/notes/:id', (req, res, next) => {
  const { content, important } = req.body

  Note.findByIdAndUpdate(
    req.params.id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedNote => {
      res.json(updatedNote)
    })
    .catch(error => next(error))
})

// Middleware que se usa para captirar solicitudes desconocidas
// Tener en cuenta que el orden de los middleware es importante
// Si se coloca al final, capturará todas las solicitudes que no hayan sido capturadas por los middleware anteriores
// Esta es solo la definición de la función, no se está usando, se usará después de las rutas
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// Middleware que se usa para manejar errores
const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

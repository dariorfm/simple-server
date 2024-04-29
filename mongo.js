const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Give password as an argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://dariorfm:${password}@clustera.vtlomcy.mongodb.net/noteApp?retryWrites=true&w=majority&appName=ClusterA` // URL de la base de datos;

mongoose.set('strictQuery', false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
  content: process.argv[3],
  important: process.argv[4]
})

note.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
})

/* Note.find({}).then(result => {
    result.forEach(note => {
      console.log(note)
    })
    mongoose.connection.close()
}); */

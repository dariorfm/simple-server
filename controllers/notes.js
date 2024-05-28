const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
  res.json(notes)
})

notesRouter.put('/:id', async (req, res, next) => {
  const { content, important } = req.body

  const note = {
    content,
    important
  }

  const updatedNote = await Note.findByIdAndUpdate(req.params.id, note, { new: true })
  res.json(updatedNote)
})

notesRouter.post('/', async (req, res, next) => {
  const body = req.body

  const user = await User.findById(body.userId)

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    user: user._id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()

  res.status(201).json(savedNote)
})

notesRouter.get('/:id', async (req, res, next) => {
  const note = await Note.findById(req.params.id)
  if (note) {
    res.json(note)
  } else {
    res.status(404).end()
  }
})

notesRouter.delete('/:id', async (req, res, next) => {
  await Note.findByIdAndDelete(req.params.id)
  res.status(204).end()
})

module.exports = notesRouter

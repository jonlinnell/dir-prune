require('dotenv').config()

const fs = require('fs')
const path = require('path')
const moment = require('moment')

const { MAXAGE, TARGET } = process.env

const omitFiles = ['logs', 'readme.txt']

if (
  (!MAXAGE) ||
  (!TARGET)
) {
  throw new Error('Configuration error.')
}

const target = path.resolve(TARGET)

fs.readdir(target, (error, files) => {
  if (error) throw new Error(error)

  files.forEach((file) => {
    if (omitFiles.indexOf(file) === -1) {
      const resolvedFile = path.join(TARGET, file)

      const modifiedDate = moment(fs.statSync(resolvedFile).mtime)
      const deleteDate = moment(modifiedDate).add(MAXAGE, 'days')

      if (deleteDate < moment()) {
        fs.unlink(resolvedFile, (unlinkError) => {
          if (unlinkError) { process.stderr.write(`There was an error: ${unlinkError}.\n`) }
        })
      }
    }
  })
})

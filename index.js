require('dotenv').config()

const fs = require('fs')
const path = require('path')
const moment = require('moment')
const { addWeekDays } = require('moment-business')

const { MAXAGE, TARGET, VERBOSE } = process.env

const omitFiles = ['logs', 'readme.txt']

if (
  (!MAXAGE) ||
  (!TARGET)
) {
  throw new Error('Configuration error.')
}

const target = path.resolve(TARGET)

const logDeletion = file => fs.writeFile(
  path.join(target, 'logs', `${moment().format('YYYYMMDD')}.log`),
  `[${moment().format('HH:mm:ss')}] ${file} deleted.`,
  {
    encoding: 'utf8',
    flag: 'a+',
  },
  err => { if (err) { console.error(err) } }
)

fs.readdir(target, (error, files) => {
  if (error) throw new Error(error)

  files.forEach((file) => {
    if (omitFiles.indexOf(file) === -1) {
      const resolvedFile = path.join(TARGET, file)

      const modifiedDate = moment(fs.statSync(resolvedFile).mtime)
      const deleteDate = moment(modifiedDate)
      addWeekDays(deleteDate.startOf('day'), MAXAGE)

      if (VERBOSE) { console.log(`File "${file}", modified at ${modifiedDate}, due to be deleted on ${deleteDate}.`) }

      if (deleteDate < moment()) {
        fs.unlink(resolvedFile, (unlinkError) => {
          if (unlinkError) {
            console.error(`There was an error: ${unlinkError}.`)
          } else {
            if (VERBOSE) { console.log(`File "${file}" deleted.`) }
            logDeletion(file)
          }
        })
      } else {
        if (VERBOSE) { console.log(`Skipping file "${file}"; too early to delete.`) }
      }
    }
  })
})

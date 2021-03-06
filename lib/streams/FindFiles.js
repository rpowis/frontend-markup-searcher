import glob from 'glob'
import {Readable} from 'stream'

class FindFiles extends Readable {
  constructor (options, filePathPattern) {
    super(options)

    this.filePathPattern = filePathPattern
  }

  _read () {
    const files = glob.sync(this.filePathPattern, {
      ignore: '**/node_modules/**'
    })

    files.forEach((file) => this.push(file))

    this.push(null)
  }
}

export default FindFiles

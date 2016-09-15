import 'app/views/index/style.sass'

import React, { PropTypes } from 'react'
import { connect }          from 'react-redux'

import translate from 'app/hoc/translate'

// simple checks for file type

const isPDF = file => file && file.type === 'application/pdf'
const isIMG = file => file && (
  file.type === 'image/png' ||
  file.type === 'image/jpeg'
)

// make sure the images don't get too large while maintaining the original
// aspect ratio

const resize = ({ width, height }, { MAX_WIDTH, MAX_HEIGHT }) => {
  if(width > height) {
    if(width > MAX_WIDTH) {
      return {
        width:  MAX_WIDTH,
        height: MAX_WIDTH / width * height,
      }
    }
  }
  if(height > MAX_HEIGHT) {
    return {
      width:  MAX_HEIGHT / height * width,
      height: MAX_HEIGHT,
    }
  }
  return { width, height }
}

/**
 * Different declarations for the
 */
const A4 = {
  PPI72:  { MAX_WIDTH: 595,  MAX_HEIGHT: 842,  DESC: '72 PPI'  },
  PPI200: { MAX_WIDTH: 1654, MAX_HEIGHT: 2339, DESC: '200 PPI' },
}

/**
 * Index view of the application.
 */
export const IndexView = React.createClass({
  propTypes: {
    route: PropTypes.object.isRequired,
  },
  contextTypes: {
    translate: PropTypes.func.isRequired,
  },
  getInitialState() {
    return {
      file: null, dataURL: '', size: A4.PPI72,
    }
  },
  setSize(event) {
    this.setState({ size: A4[event.target.value] }, this.setImage)
  },
  setFile(event) {
    event.preventDefault()
    return this.setState({ file: event.target.files[0] }, this.setImage)
  },
  setImage() {
    const reader = new FileReader()

    reader.onload = () => {
      if (!isIMG(this.state.file)) return

      const img    = document.createElement('img')
      const canvas = document.createElement('canvas')

      img.src = reader.result

      img.onload = () => {
        const { width, height } = resize(img, this.state.size)

        canvas.width  = width
        canvas.height = height

        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        this.setState({ dataURL: canvas.toDataURL(this.state.file.type) })
      }
    }
    return reader.readAsDataURL(this.state.file)
  },
  getImageSize() {
    return atob(this.state.dataURL.substr(this.state.dataURL.indexOf(',') + 1))
      .length / 1000
  },
  render() {
    return (
      <article className="index-view">
        <form onSubmit={event => event.preventDefault()}>
          <input type="file" onChange={this.setFile} />
          <select onChange={this.setSize}>
            {Object.keys(A4).map((size, key) =>
              <option key={key} value={size}>{A4[size].DESC}</option>)}
          </select>
        </form>
        <div>
          size ~ {this.getImageSize()} kb
        </div>
        {isIMG(this.state.file) &&
          <img src={this.state.dataURL} />}
      </article>
    )
  },
})

const smart = connect(
  state => ({
    route: state.routing,
  }))

export default smart(translate(IndexView, require('app/localization.json')))

/**
 * The annotation information,
 * all the size is measured in viewport 1.0 scale
**/
const AnnoInfo = {
  doc_id: '',
  anno_type: 'edit',
  size: {
    min: 15 // min width or height
  },
  pen: {
    size: 2,
    color: '#FF0000'
  },
  text: {
    size: 8,
    color: '#FF0000'
  },
  point: {
    size: 30
  }
}

export function setAnnoInfo (info = {}) {
  Object.keys(info).forEach((key) => {
    AnnoInfo[key] = info[key]
  })
}

export function getAnnoInfo (key) {
  if (key) {
    return AnnoInfo[key]
  } else {
    return AnnoInfo
  }
}

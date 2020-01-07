/**
 * The annotation information
**/
const AnnoInfo = {
  doc_id: '',
  anno_type: 'edit',
  pen: {
    size: 2,
    color: '#FF0000'
  },
  text: {
    size: 10,
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

/**
 * The annotation information
**/
const AnnoInfo = {
  doc_id: '',
  anno_type: 'edit'
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

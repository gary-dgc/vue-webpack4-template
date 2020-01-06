import { uuid } from '../helpers/Utils'
// Adapter should never be invoked publicly
export default class StoreAdapter {
  getAllAnnotations (documentId) {
    return JSON.parse(localStorage.getItem(`${documentId}/annotations`)) || []
  }

  getAnnotations (documentId, pageNumber) {
    return new Promise((resolve, reject) => {
      const annotations = this.getAllAnnotations(documentId).filter((i) => {
        return i.page === pageNumber && i.class === 'Annotation'
      })

      resolve({
        documentId,
        pageNumber,
        annotations
      })
    })
  }

  getAnnotation (documentId, annotationId) {
    return Promise.resolve(this.getAnnotations(documentId)[this.findAnnotation(documentId, annotationId)])
  }

  addAnnotation (documentId, pageNumber, annotation) {
    return new Promise((resolve, reject) => {
      annotation.class = 'Annotation'
      if (!annotation.uuid) {
        annotation.uuid = uuid()
      }
      annotation.page = pageNumber

      const annotations = this.getAllAnnotations(documentId)
      annotations.push(annotation)
      this.updateAnnotations(documentId, annotations)

      resolve(annotation)
    })
  }

  editAnnotation (documentId, annotationId, annotation) {
    return new Promise((resolve, reject) => {
      const annotations = this.getAllAnnotations(documentId)
      annotations[this.findAnnotation(documentId, annotationId)] = annotation
      this.updateAnnotations(documentId, annotations)

      resolve(annotation)
    })
  }

  updateAnnotations (documentId, annotations) {
    localStorage.setItem(`${documentId}/annotations`, JSON.stringify(annotations))
  }

  deleteAnnotation (documentId, annotationId) {
    return new Promise((resolve, reject) => {
      const index = this.findAnnotation(documentId, annotationId)
      if (index > -1) {
        const annotations = this.getAllAnnotations(documentId)
        annotations.splice(index, 1)
        this.updateAnnotations(documentId, annotations)
      }

      resolve(true)
    })
  }

  findAnnotation (documentId, annotationId) {
    let index = -1
    const annotations = this.getAllAnnotations(documentId)
    for (let i = 0, l = annotations.length; i < l; i++) {
      if (annotations[i].uuid === annotationId) {
        index = i
        break
      }
    }
    return index
  }
}

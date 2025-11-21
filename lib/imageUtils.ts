// Image utility functions for thumbnail generation

export const createThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 150 // Thumbnail size
        let width = img.width
        let height = img.height
        
        // Calculate aspect ratio
        if (width > height) {
          if (width > maxSize) {
            height = (height / width) * maxSize
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width / height) * maxSize
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        
        // Compress to 40% quality for thumbnail
        resolve(canvas.toDataURL('image/jpeg', 0.4))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export const generateThumbnailFromUrl = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxSize = 150
      let width = img.width
      let height = img.height
      
      if (width > height) {
        if (width > maxSize) {
          height = (height / width) * maxSize
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width / height) * maxSize
          height = maxSize
        }
      }
      
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      
      resolve(canvas.toDataURL('image/jpeg', 0.4))
    }
    img.src = url
  })
}

export const addWatermark = (
  imageUrl: string,
  text: string
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      canvas.width = img.width
      canvas.height = img.height
      
      ctx.drawImage(img, 0, 0)
      
      // Watermark style - subtle
      const fontSize = Math.max(12, img.width / 50)
      ctx.font = `${fontSize}px Arial`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
      
      const padding = 15
      const textWidth = ctx.measureText(text).width
      
      // Position 1: bottom-right
      ctx.fillText(text, img.width - textWidth - padding, img.height - padding)
      
      // Position 2: top-left
      ctx.fillText(text, padding, padding + fontSize)
      
      // Position 3: center
      ctx.fillText(text, (img.width - textWidth) / 2, img.height / 2)
      
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.src = imageUrl
  })
}

const generateSKU = () => {
  const datePart = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
  const randomPart = Math.floor(Math.random() * 9000 + 1000)
  return `SKU-${datePart}-${randomPart}`
}

export default generateSKU

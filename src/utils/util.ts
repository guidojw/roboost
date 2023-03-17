export function makeCommaSeparatedString (array: string[]): string {
  if (array.length <= 1) {
    return array[0] ?? ''
  }
  const firsts = array.slice(0, array.length - 1)
  const last = array[array.length - 1]
  return `${firsts.join(', ')} & ${last}`
}

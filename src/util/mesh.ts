// 采样
export const gird = (size: number) => {
  const buffer = new Float32Array(size * size * 6 * 3);
  let i = 0;

  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      buffer[i++] = x / size;
      buffer[i++] = 0;
      buffer[i++] = y / size;

      buffer[i++] = x / size;
      buffer[i++] = 0;
      buffer[i++] = (y + 1) / size;

      buffer[i++] = (x + 1) / size;
      buffer[i++] = 0;
      buffer[i++] = (y + 1) / size;

      buffer[i++] = x / size;
      buffer[i++] = 0;
      buffer[i++] = y / size;

      buffer[i++] = (x + 1) / size;
      buffer[i++] = 0;
      buffer[i++] = (y + 1) / size;

      buffer[i++] = (x + 1) / size;
      buffer[i++] = 0;
      buffer[i++] = y / size;
    }
  }
  return buffer;
};

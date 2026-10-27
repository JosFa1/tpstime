import { isLocalPreview } from './localPreview';

test('preview access requires development, explicit opt-in, and a loopback host', () => {
  expect(isLocalPreview('development', 'true', 'localhost')).toBe(true);
  expect(isLocalPreview('production', 'true', 'localhost')).toBe(false);
  expect(isLocalPreview('development', 'false', 'localhost')).toBe(false);
  expect(isLocalPreview('development', 'true', 'www.tpstime.com')).toBe(false);
});

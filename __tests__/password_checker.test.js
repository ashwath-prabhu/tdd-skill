const { checkPasswordStrength } = require('../password_checker');

test('checkPasswordStrength returns "weak" for a password under 8 characters', () => {
  expect(checkPasswordStrength('abc123')).toBe('weak');
});

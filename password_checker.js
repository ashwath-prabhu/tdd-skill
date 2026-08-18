function checkPasswordStrength(password) {
  if (password.length < 8) {
    return 'weak';
  }
}

module.exports = { checkPasswordStrength };

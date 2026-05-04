const password = prompt("Password: ")
if (!password) {
  console.error("No password provided.")
  process.exit(1)
}
const hash = await Bun.password.hash(password)
console.log(`\nADMIN_PASSWORD_HASH=${hash}`)

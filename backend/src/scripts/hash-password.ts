const password = prompt("Password: ")
if (!password) {
  console.error("No password provided.")
  process.exit(1)
}

const hash = await Bun.password.hash(password)

// Bun's dotenv loader performs `$VAR` substitution on values, *including*
// inside single and double quotes. Argon2id hashes contain `$argon2id`,
// `$v`, `$m`, etc. — Bun would expand each as an empty/missing variable
// and silently corrupt the hash. The only reliable disabler is backslash-
// escaping every `$`. Print the line ready to paste.
const escaped = hash.replaceAll("$", "\\$")
const envLine = `ADMIN_PASSWORD_HASH=${escaped}`

console.log()
console.log("Paste this line into backend/.env (the leading `\\` before each `$` is required):")
console.log()
console.log(envLine)
console.log()
console.log("Then restart `bun run dev` so the new env is loaded.")

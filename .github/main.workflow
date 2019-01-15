workflow "New workflow" {
  on = "push"
  resolves = ["danger/danger-js"]
}

action "danger/danger-js" {
  uses = "danger/danger-js"
  secrets = ["GITHUB_TOKEN"]
}

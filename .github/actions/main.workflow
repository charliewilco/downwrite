workflow "New workflow" {
  on = "push"
  resolves = ["Danger"]
}

action "Danger" {
  uses = "danger/danger"
  secrets = ["GITHUB_TOKEN"]
}
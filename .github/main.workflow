workflow "New workflow" {
  on = "push"
  resolves = ["Danger"]
}

action "Danger" {
  uses = "duck8823/actions/danger"
  secrets = ["GITHUB_TOKEN"]
}

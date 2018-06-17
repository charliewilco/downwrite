export default function redirect(ctx, path) {
  if (ctx.res) {
    ctx.res.writeHead(302, { Location: path })
    ctx.res.end()
  } else {
    document.location.pathname = path
  }
}

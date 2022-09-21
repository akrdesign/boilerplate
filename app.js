require('dotenv').config()

const express = require("express")
const app = express()
const path = require('path')
const port = 3000

const Prismic = require('@prismicio/client')
const PrismicH = require('@prismicio/helpers')
const { response } = require("express")

// Initialize the prismic.io api
const initApi = async req => {
  return Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req
  })
}

// Link Resolver
const HandleLinkResolver = doc => {
  // if (doc.type === 'page') return `/${doc.lang}/${doc.uid}`
  // if (doc.type === 'homepage') return `/${doc.lang}`

  // Default to homepage
  return '/'
}

// Middleware to inject prismic context
app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: HandleLinkResolver
  }
  res.locals.PrismicH = PrismicH

  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get("/", async (req, res) => {
  res.render('pages/home')
})

app.get("/about", async (req, res) => {
  initApi(req).then(api => {
    api.query(Prismic.Predicates.any('document.type', ['about', 'meta'])).then(response => {
      const { results } = response
      const [about, meta] = results

      console.log(about, meta)


      res.render('pages/about', {
        about,
        meta
      })
    })
  })
})

app.get("/collections", (req, res) => {
  res.render('pages/collections')
})

app.get("/detail/:uid", async (req, res) => {
  res.render('pages/detail')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

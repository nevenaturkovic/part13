const router = require("express").Router()

const { userExtractor } = require("../util/middleware")
const { User, Blog, ReadingList } = require("../models")

router.get("/", async (req, res) => {
  const users = await User.findAll({
    include: [
      {
        model: Blog,
        attributes: { exclude: ["userId"] },
      },
      {
        model: Blog,
        as: "readings",
        attributes: { exclude: ["userId"] },
        through: {
          attributes: [],
        },
      },
    ],
  })
  res.json(users)
})

router.post("/", userExtractor, async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.json(user)
  } catch (error) {
    return res.status(400).json({ error })
  }
})

router.get("/:username", async (req, res) => {
  let where = {}

  if (req.query.read) {
    where = { read: req.query.read }
  }

  const user = await User.findOne({
    where: { username: req.params.username },
    include: [
      // {
      //   model: Blog,
      //   attributes: { exclude: ["userId"] },
      // },
      {
        model: Blog,
        as: "readings",
        attributes: { exclude: ["userId"] },
        through: {
          attributes: ["id", "read"],
          where,
        },
      },
    ],
  })
  if (user) {
    res.json(user)
  } else {
    res.status(404).end()
  }
})

router.put("/:username", async (req, res) => {
  const user = await User.findOne({ where: { username: req.params.username } })
  if (user) {
    await user.update({ username: req.body.username })
    res.json(user)
  } else {
    res.status(404).end()
  }
})

module.exports = router

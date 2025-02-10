const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const passport = require("./config/passportConfig");

const indexRoutes = require("./routes/indexRoutes");
const authRoutes = require("./routes/authRoutes");
const storageRoutes = require("./routes/storageRoutes");

require("dotenv").config();

const prisma = new PrismaClient();
const app = express();

app.use("/node_modules", express.static("node_modules"));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(expressLayouts);
app.set("layout", "layouts/layout");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: "cats", // Change this in production
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // Every 2 minutes
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  // console.log(res.locals.user);
  next();
});

app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/storage", storageRoutes);

const PORT = process.env.PORT || 3000;
app.listen(3000, () => console.log(`App listening on port ${PORT}...`));

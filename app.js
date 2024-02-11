const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const http = require("http");
const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");
const mysql = require("mysql");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
require("dotenv").config();
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
let upload = multer({ storage: storage });
const app = express();
const session = require("express-session");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { generateKey } = require("crypto");
const { title, send } = require("process");
const e = require("express");
const io = new Server(server);
app.use(express.static("public"));
app.set("view engine", "ejs");
io.sockets.on("connection", function (socket) {
  let connections = [];
  console.log("Успешное соединение");
  // Добавление нового соединения в массив
  connections.push(socket);
  socket.on("disconnect", function (data) {
    connections.splice(connections.indexOf(socket), 1);
    console.log("Отключились");
  });
  // Функция получающая сообщение от какого-либо пользователя
  socket.on("team mess", async function (data) {
    console.log(data);
    let x = await prisma.teamUser.findFirst({
      where: {
        username: data.user.username,
      },
    });
    let send;
    send = 0;
    let from_id = null;
    if (data.is) {
      send = 1;
      from_id = x.id;
    }
    let text = await prisma.text.create({
      data: {
        text: data.mess,
      },
    });
    let a = await prisma.teamMess.create({
      data: {
        tm_id: data.team,
        username: data.user.recieve,
        from_id,
        text_id: text.id,
        send,
      },
    });
    let room = await prisma.teamDialog.findFirst({
      where: {
        tm_id: data.team,
        username: data.user.recieve,
      },
    });
    console.log(room);
    if (!room) {
      console.log("not room");
      room = await prisma.teamDialog.create({
        data: {
          tm_id: data.team,
          username: data.user.recieve,
          mid: a.id,
        },
      });
    } else {
      console.log("has room");
      room = await prisma.teamDialog.update({
        where: {
          id: room.id,
        },
        data: {
          mid: a.id,
          updated_at: new Date(),
        },
      });
    }
    io.sockets.emit("tmess " + data.team, {
      mess: data.mess,
      user: data.user,
      is: data.is,
    });
    io.sockets.emit("add mess " + data.user.recieve, {
      mess: data.mess,
      user: data.user,
      is: data.is,
    });
  });
});
app.set("views", path.join(__dirname, "pages"));
app.use(express.urlencoded({ extended: true }));
server.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server listening on port " + process.env.PORT);
});
app.use(
  session({
    secret: "Secret",
    resave: true,
    saveUninitialized: true,
  })
);
function isAuth(req, res, next) {
  if (req.session.auth) {
    req.session.error = false;
    next();
  } else {
    res.redirect("/auth");
  }
}
function isNotAuth(req, res, next) {
  if (!req.session.auth) {
    req.session.error = false;
    next();
  } else {
    res.redirect("/");
  }
}
app.get("/", (req, res) => {
  res.render("home", {
    session: req.session,
  });
});
app.get("/about", (req, res) => {
  res.render("page", {
    session: req.session,
  });
});
app.get("/direct/team/:id/:user", isAuth, async (req, res) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username: req.session.user.username,
        },
        {
          email: req.session.user.username,
        },
      ],
    },
    include: {
      info: true,
      teams: {
        include: {
          team: {
            include: {
              TeamDialog: {
                include: {
                  user: true,
                  team: true,
                  last_mess: {
                    include: {
                      text: {
                        include: {
                          TextFile: true,
                        },
                      },
                    },
                  },
                },
              },
              TeamMess: true,
            },
          },
        },
      },
      TeamDialog: {
        include: {
          user: true,
          team: true,
          last_mess: {
            include: {
              text: {
                include: {
                  TextFile: true,
                },
              },
            },
          },
        },
      },
      createdTeams: true,
      recUser: true,
      sendTeam: true,
      sendUser: true,
    },
  });
  console.log(req.body);
  const id = await prisma.team.findFirst({
    where: {
      id: req.params.id,
    },
  });
  const msg = await prisma.teamMess.findMany({
    where: { username: req.params.user },
    include: { text: true, from: true },
  });
  res.render("direct-admin", {
    session: req.session,
    id: id.num,
    user: req.params.user,
    msg,
  });
});
app.get("/direct/write/:id", isAuth, async (req, res) => {
  req.session.user = await prisma.user.findFirst({
    where: {
      username: req.session.user.username,
    },
    include: {
      info: true,
      teams: {
        include: {
          team: {
            include: {
              TeamMess: true,
              members: true,
            },
          },
        },
      },
      TeamDialog: {
        include: {
          user: true,
          team: true,
          last_mess: {
            include: {
              text: {
                include: {
                  TextFile: true,
                },
              },
            },
          },
        },
      },
      createdTeams: true,
      recUser: true,
      sendTeam: true,
      sendUser: true,
    },
  });
  console.log(req.params);
  const id = await prisma.team.findFirst({
    where: {
      num: Number(req.params.id),
    },
  });
  console.log(id == null);
  if (id == null) {
    res.redirect("/404");
  } else {
    const msg = await prisma.teamMess.findMany({
      where: {
        username: req.session.user.username,
        tm_id: Number(req.params.id),
      },
      include: {
        text: true,
        from: true,
      },
    });
    console.log("msg:");
    console.log(msg);
    res.render("direct-write", {
      session: req.session,
      id: req.params.id,
      team: id.name,
      msg: msg,
    });
  }
});
app.get("/auth", isNotAuth, async (req, res) => {
  const users = await prisma.user.findMany({});
  res.render("auth", {
    session: req.session,
    users,
    bcrypt,
  });
});
app.get("/reg", isAuth, async (req, res) => {
  res.render("reg", {
    session: req.session,
  });
});
app.post("/reg", isNotAuth, (req, res) => {
  let { username, name, surname, email, nick, gender, password } = req.body;
  let salt = 10;
  bcrypt.hash(password, salt, async (err, hash) => {
    if (err) throw err;
    gender = Number(gender);
    console.log(hash);
    let data = await prisma.user.create({
      data: {
        username,
        name,
        surname,
        email,
        nick,
        gender,
        password: hash,
      },
      include: {
        info: true,
        teams: {
          include: {
            team: true,
          },
        },
        TeamDialog: {
          include: {
            user: true,
            team: true,
            last_mess: {
              include: {
                text: {
                  include: {
                    TextFile: true,
                  },
                },
              },
            },
          },
        },
        createdTeams: true,
        recUser: true,
        sendTeam: true,
        sendUser: true,
      },
    });
    req.session.user = data;
    req.session.auth = true;
    console.log(req.session);
    res.redirect("/reg");
  });
});

app.post("/login", isNotAuth, async (req, res) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username: req.body.username,
        },
        {
          email: req.body.username,
        },
      ],
    },
    include: {
      info: true,
      teams: {
        include: {
          team: {
            include: {
              TeamDialog: {
                include: {
                  user: true,
                  team: true,
                  last_mess: {
                    include: {
                      text: {
                        include: {
                          TextFile: true,
                        },
                      },
                    },
                  },
                },
              },
              TeamMess: true,
            },
          },
        },
      },
      TeamDialog: {
        include: {
          team: true,
          last_mess: {
            include: {
              text: {
                include: {
                  TextFile: true,
                },
              },
            },
          },
        },
      },
      createdTeams: true,
      recUser: true,
      sendTeam: true,
      sendUser: true,
    },
  });
  console.log(user == null);
  if (user == null) {
    res.redirect("/auth");
  } else {
    console.log(user);
    let data = req.body.password;
    let hash = user.password;
    bcrypt.compare(data, hash, (err, result) => {
      if (err) throw err;
      console.log(result);
      if (result) {
        req.session.user = user;
        req.session.auth = true;
        res.redirect("/");
      } else {
        res.redirect("/auth");
      }
    });
  }
});

app.get("/direct/teams", isAuth, async (req, res) => {
  req.session.user = await prisma.user.findFirst({
    where: {
      username: req.session.user.username,
    },
    include: {
      info: true,
      teams: {
        include: {
          team: {
            include: {
              TeamMess: true,
              members: true,
            },
          },
        },
      },
      TeamDialog: {
        include: {
          user: true,
          team: true,
          last_mess: {
            include: {
              text: {
                include: {
                  TextFile: true,
                },
              },
            },
          },
        },
      },
      createdTeams: true,
      recUser: true,
      sendTeam: true,
      sendUser: true,
    },
  });
  res.render("direct-team", {
    session: req.session,
  });
});

app.post("/team", isAuth, async (req, res) => {
  console.log(req.body.user);
  let a = await prisma.team.create({
    data: {
      lead: req.body.user,
      name: req.body.name,
      title: req.body.title,
    },
  });
  let b = await prisma.teamUser.create({
    data: {
      username: req.session.user.username,
      team_id: a.num,
    },
    include: {
      team: true,
    },
  });
  req.session.user.createdTeams.push(a);
  req.session.user.teams.push(b);
  console.log(req.session.user.teams);
  res.redirect("/direct/teams");
});

app.post("/team-join", isAuth, async (req, res) => {
  let { num } = await prisma.team.findFirst({
    where: {
      id: req.body.code,
    },
  });
  let a = await prisma.teamUser.create({
    data: {
      username: req.session.user.username,
      team_id: num,
    },
  });
  req.session.user.teams.push(a);
  res.redirect("/teams");
});

app.get("/direct", isAuth, async (req, res) => {
  req.session.user = await prisma.user.findFirst({
    where: {
      username: req.session.user.username,
    },
    include: {
      info: true,
      teams: {
        include: {
          team: {
            include: {
              TeamDialog: {
                include: {
                  user: true,
                  team: true,
                  last_mess: {
                    include: {
                      text: {
                        include: {
                          TextFile: true,
                        },
                      },
                      user: true,
                      from: true,
                    },
                  },
                },
              },
              TeamMess: true,
            },
          },
        },
      },
      TeamDialog: {
        include: {
          user: true,
          team: true,
          last_mess: {
            include: {
              text: {
                include: {
                  TextFile: true,
                },
              },
            },
          },
        },
      },
      createdTeams: true,
      recUser: true,
      sendTeam: true,
      sendUser: true,
    },
  });
  console.log(req.session.user);
  res.render("direct-hub", {
    session: req.session,
  });
});
app.get("/logout", isAuth, (req, res) => {
  req.session.user = false;
  req.session.auth = false;
  res.redirect("/");
});
app.get("*", (req, res) => {
  res.render("error");
});
app.post("*", (req, res) => {
  res.redirect("/404");
});

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const port = 3000;

// Настройка базы данных SQLite и подключенние к ней
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "db.sqlite",
});

// Модель роли
const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  { timestamps: false }
);

// Модель пользователей
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
    },
  },
  { timestamps: false }
);

const Communications = sequelize.define(
  "Communications",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    heading: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    teg: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: false }
);
      async function upsertData() {
        try {
          const dataToInsert = [
            { heading: 'Изменение графиков работы поставщиков в предновогодний период', teg: '#логистика', date: '18.12.2024' },
            { heading: 'Отчет по сертификации фритюров', teg: '#СертификацияФритюров', date: '16.12.2024' },
            { heading: 'OPS Цели 2025', teg: '#СтандартыОперационнойДеятельности', date: '16.12.2024' },
            { heading: 'Замена упаковки для чикен кесадилья', teg: '#НациональныйЗапуск', date: '17.12.2024' },
            { heading: 'Обновлен и актуализирован CSL "Работа с отчетами в R-Keeper"', teg: '#СтандартыОперационнойДеятельности', date: '05.11.2024' },
            { heading: 'Замена химии для кофемашин Franke на CTM', teg: '#логистика', date: '16.12.2024' },
          ];
      
          for (const item of dataToInsert) {
            const [updatedRecord, created] = await Communications.findOrCreate({
              where: { heading: item.heading },
              defaults: item,
            });
            console.log(created ? 'Создана запись:' : 'Обновлена запись:', updatedRecord.toJSON());
          }
        } catch (error) {
          console.error('Ошибка:', error);
        }
      }
      
      upsertData();

const Feedbacks = sequelize.define(
  "Feedbacks",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: false }
);
// Установка связей
Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

// Синхронизация базы данных и создание админа при первом запуске
sequelize
  .sync({ force: false })
  .then(async () => {
    console.log("База данных синхронизирована");

    // Создаем роли если их еще нет
    const userRole = await Role.findOrCreate({
      where: { name: "user" },
      defaults: { name: "user" },
    });
    const adminRole = await Role.findOrCreate({
      where: { name: "admin" },
      defaults: { name: "admin" },
    });

    //Проверка есть ли пользователи в бд
    const usersCount = await User.count();

    //  Создаем админа
    if (usersCount === 0) {
      const adminRole = await Role.findOne({ where: { name: "admin" } });
      if (!adminRole) {
        console.error("Роль администратора не найдена");
        return;
      }
      const hashedPassword = await bcrypt.hash("admin", 10); // Пароль admin
      await User.create({
        login: "admin",
        name: "admind",
        password: hashedPassword,
        roleId: adminRole.id,
      });
      console.log("Администратор создан");
    }
  })
  .catch((err) => console.error(err));
// Middleware (без изменений)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// Проверка авторизации (без изменений)
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

// Проверка роли (без изменений)
function hasRole(roleName) {
  return async (req, res, next) => {
    if (req.session.user) {
      const user = await User.findByPk(req.session.user.id, { include: Role });
      if (user && user.Role.name === roleName) {
        next();
      } else {
        res.status(403).send("Доступ запрещен");
      }
    } else {
      res.redirect("/login");
    }
  };
}
app.get('/table', (req, res) => {
  res.render('table'); 
});
app.get('/communication', (req, res) => {
  res.render('communication', { user: req.user });
});
app.get('/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedbacks.findAll();
    res.json(feedbacks);
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Главная страница
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/profile");
  } else {
    res.redirect("/login");
  }
});

app.post('/feedbacks', async (req, res) => {
  try {
    const { name, email, question } = req.body;
    if (!name || !email || !question) {
      return res.status(400).send('Заполните все поля');
    }
    await Feedbacks.create({ name, email, question });
    res.send('Заявка успешно отправлена!');
  } catch (error) {
    console.error('Ошибка при создании записи:', error);
    res.status(500).send('Ошибка сервера');
  }
});

// Роут для страницы регистрации
app.get("/register", async (req, res) => {
  res.render("register");
});
// Роут для обработки регистрации
app.post("/register", async (req, res) => {
  const { login, password, name } = req.body;
  try {
    const role = await Role.findOne({ where: { name: "user" } });
    if (!role) {
      return res.status(400).send("Роль не найдена");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ login, password: hashedPassword, roleId: role.id, name });
    res.redirect("/register");
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    res.status(400).send("Ошибка регистрации: " + error.message);
  }
});

// Middleware для проверки авторизации
const authMiddleware = (req, res, next) => {
  if (req.session && req.session.user) { // Проверяем существование req.session
    next();
  } else {
    res.redirect('/login');
  }
};

// Middleware для проверки роли администратора
const adminMiddleware = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.redirect('/'); // Перенаправляем на главную, если не админ
  }
};

// Роут для страницы авторизации (без изменений)
app.get("/login", (req, res) => {
  res.render("login");
});

// Роут для обработки авторизации 
app.post("/login", async (req, res) => {
  const { login, password } = req.body;
  try {
    const user = await User.findOne({ where: { login }, include: Role });
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.user = {
        id: user.id,
        login: user.login,
        role: user.Role.name,
      };
      res.redirect("/"); // Перенаправляем на главную страницу
    } else {
      res.status(401).send("Неверный логин или пароль");
    }
  } catch (error) {
    console.error("Ошибка входа:", error);
    res.status(500).send("Ошибка сервера: " + error.message);
  }
});

// Роут для главной страницы (с рендерингом EJS)
app.get("/profile", authMiddleware, (req, res) => {
  res.render("profile", { user: req.session.user });
});

// Роут для страницы админа (с рендерингом EJS)
app.get("/adminp", authMiddleware, adminMiddleware, (req, res) => {
  res.render("admin", { user: req.session.user });
});

//получение пользователя
app.get('/users', async (req, res) => {
  try {
      const users = await User.findAll();
      res.json(users);
  } catch (error) {
      res.status(500).send('Ошибка при получении данных пользователей');
  }
});
// получение коммуниций
app.get('/communications', async (req, res) => {
  try {
      const communications = await Communications.findAll();
      res.json(communications);
  } catch (error) {
      console.error('Ошибка:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Роут для выхода (без изменений)
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Ошибка при выходе:", err);
    res.redirect("/login");
  });
});
app.listen(port, () => {
  console.log(`Сервер запущен на порту http://localhost:${port}`);
});
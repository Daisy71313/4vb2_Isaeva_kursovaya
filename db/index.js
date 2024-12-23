const { Sequelize, DataTypes, Op } = require("sequelize");

const sequelize = new Sequelize("db", "disaeva", "1234", {
  dialect: "sqlite",
  storage: "database.sqlite",
});

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
      validate: {
        len: [5, 10], // Валидация длины имени
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: DataTypes.STRING,
  },
  {
    timestamps: false,
  }
);

async function run() {
  try {
    await sequelize.sync({ force: true });
    console.log("Таблица User пересоздана.");

    // Создание пользователей
    await User.create({ login: "admin711", name: "IsaevaDS", password: 147258 });
  } catch (error) {
    console.error("Ошибка:", error);
  } finally {
    await sequelize.close();
  }
}
const Feedback = sequelize.define(
    "Feedback",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            },
      name: {
        type: DataTypes.STRING,
        allowNull: false, // Добавлено ограничение not null
        },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true // Валидация формата email с помощью Sequelize
          }
      },
      question: {
        type: DataTypes.STRING,
        validate: {
            len: [5, 10000], // Валидация длины имени
          },
        },
    },
    {
      timestamps: false,
    }
  );
  
  async function run() {
    try {
        await sequelize.sync({ force: true });
        console.log("Таблица Feedback пересоздана.");
    
        await Feedback.create({ name: "IsaevaDS", email: "daraisaeva713@gmail.com", question: "plkfdkpdfkpdf" });
      } catch (error) {
        console.error("Ошибка:", error);
      } finally {
        await sequelize.close();
      }
}
  User.hasMany(Feedback, { foreignKey: 'userId' });
  Feedback.belongsTo(User, { foreignKey: 'userId' });
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
        allowNull: false, // Добавлено ограничение not null
        },
      teg: DataTypes.STRING,
      file: DataTypes.STRING,
      date: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );
  
  async function run() {
    try {
      await sequelize.sync({ force: true });
      console.log("Таблица Communications пересоздана.");
  
      await Communications.create({ heading: "WOOOW", desscription: "mmmmmm", photo: "kjocdjosihjdshj", date: "14.12.2024" });
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      await sequelize.close();
    }
  }
  User.hasMany(Communications, { foreignKey: 'userId' });
  Communications.belongsTo(User, { foreignKey: 'userId' });
  const News = sequelize.define(
    "News",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            },
      heading: {
        type: DataTypes.STRING,
        allowNull: false, // Добавлено ограничение not null
        },
      photo: DataTypes.STRING,
      restaurant: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );
  
  async function run() {
    try {
      await sequelize.sync({ force: true });
      console.log("Таблица News пересоздана.");
  
      await News.create({ heading: "WOOOW", desscription: "mmmmmm", photo: "kjocdjosihjdshj", date: "14.12.2024",restaurant:"jhdshjcchj" });
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      await sequelize.close();
    }
  }
  User.hasMany(News, { foreignKey: 'userId' });
  News.belongsTo(User, { foreignKey: 'userId' });
  
  const Events = sequelize.define(
    "Events",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            },
      name: {
        type: DataTypes.STRING,
        allowNull: false, // Добавлено ограничение not null
        },
      desscription: DataTypes.STRING,
      time: DataTypes.STRING,
      date: DataTypes.STRING,
      photo: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );
  
  async function run() {
    try {
      await sequelize.sync({ force: true });
      console.log("Таблица News пересоздана.");
  
      await Events.create({ name: "WOOOW", desscription: "mmmmmm", time: "12:00", photo: "kjocdjosihjdshj", date: "14.12.2024",restaurant:"jhdshjcchj" });
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      await sequelize.close();
    }
  }
 User.hasMany(Events, { foreignKey: 'userId' });
 Events.belongsTo(User, { foreignKey: 'userId' });
run();
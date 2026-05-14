require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "mi_clave_secreta";

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PATCH"],
  },
});

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Usuario ${userId} unido a su sala`);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No enviaste token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "No tienes permiso" });
    }

    next();
  };
}

async function createNotification(userId, message) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      message,
    },
  });

  io.to(`user_${userId}`).emit("notification", notification);

  return notification;
}

async function updateTaskStatus(taskId, runnerId, nextStatus) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("Mandado no existe");
  }

  if (task.runnerId !== runnerId) {
    throw new Error("Este mandado no es tuyo");
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: nextStatus,
    },
  });

  io.to(`user_${task.clientId}`).emit("taskUpdated", updatedTask);
  io.to(`user_${runnerId}`).emit("taskUpdated", updatedTask);

  return { task, updatedTask };
}

app.post("/auth/register", async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;

    if (!name || !phone || !password || !role) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    if (role === "ADMIN") {
      return res.status(403).json({
        message: "No puedes crear administradores públicamente",
      });
    }

    if (role !== "CLIENT" && role !== "RUNNER") {
      return res.status(400).json({ message: "Rol inválido" });
    }

    const existingUser = await prisma.user.findFirst({
      where: { phone },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Ese teléfono ya está registrado",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role,
        status: role === "RUNNER" ? "PENDING" : "ACTIVE",
      },
    });

    res.json({
      message: "Cuenta creada",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creando cuenta" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        message: "Teléfono y contraseña obligatorios",
      });
    }

    const user = await prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      return res.status(401).json({
        message: "Teléfono o contraseña incorrectos",
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password);

    if (!passwordOk) {
      return res.status(401).json({
        message: "Teléfono o contraseña incorrectos",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error en login" });
  }
});

app.get("/notifications", authMiddleware, async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(notifications);
});

app.patch("/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    const notificationId = Number(req.params.id);

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notificación no existe" });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: "No tienes permiso" });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    res.json(updatedNotification);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error actualizando notificación" });
  }
});

app.get("/admin/users", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      status: true,
    },
  });

  res.json(users);
});

app.get("/admin/stats", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const tasks = await prisma.task.findMany();

    const totalUsers = users.length;
    const totalClients = users.filter((user) => user.role === "CLIENT").length;
    const totalRunners = users.filter((user) => user.role === "RUNNER").length;
    const totalAdmins = users.filter((user) => user.role === "ADMIN").length;

    const pendingRunners = users.filter(
      (user) => user.role === "RUNNER" && user.status === "PENDING"
    ).length;

    const approvedRunners = users.filter(
      (user) => user.role === "RUNNER" && user.status === "APPROVED"
    ).length;

    const totalTasks = tasks.length;
    const openTasks = tasks.filter((task) => task.status === "OPEN").length;
    const acceptedTasks = tasks.filter((task) => task.status === "ACCEPTED").length;
    const pickedUpTasks = tasks.filter((task) => task.status === "PICKED_UP").length;
    const onTheWayTasks = tasks.filter((task) => task.status === "ON_THE_WAY").length;
    const deliveredTasks = tasks.filter((task) => task.status === "DELIVERED").length;
    const cancelledTasks = tasks.filter((task) => task.status === "CANCELLED").length;

    const estimatedRevenue = tasks
      .filter((task) => task.status === "DELIVERED" || task.status === "COMPLETED")
      .reduce((total, task) => total + (task.estimatedPrice || 0), 0);

    res.json({
      users: {
        totalUsers,
        totalClients,
        totalRunners,
        totalAdmins,
        pendingRunners,
        approvedRunners,
      },
      tasks: {
        totalTasks,
        openTasks,
        acceptedTasks,
        pickedUpTasks,
        onTheWayTasks,
        deliveredTasks,
        cancelledTasks,
      },
      money: {
        estimatedRevenue,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error cargando estadísticas" });
  }
});

app.patch("/admin/users/:id/approve", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.role !== "RUNNER") {
      return res.status(400).json({
        message: "Solo puedes aprobar mandaderos",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: "APPROVED" },
    });

    await createNotification(
      updatedUser.id,
      "Tu cuenta de mandadero fue aprobada. Ya puedes aceptar mandados."
    );

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      phone: updatedUser.phone,
      role: updatedUser.role,
      status: updatedUser.status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error aprobando runner" });
  }
});

app.post("/tasks", authMiddleware, requireRole("CLIENT"), async (req, res) => {
  try {
    const {
      description,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      distanceKm,
      estimatedPrice,
    } = req.body;

    if (!description) {
      return res.status(400).json({
        message: "La descripción es obligatoria",
      });
    }

    const task = await prisma.task.create({
      data: {
        description,
        status: "OPEN",
        clientId: req.user.id,
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
        distanceKm,
        estimatedPrice,
      },
    });

    res.json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creando mandado" });
  }
});

app.get("/tasks/client/my", authMiddleware, requireRole("CLIENT"), async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: {
      clientId: req.user.id,
    },
  });

  res.json(tasks);
});

app.patch("/tasks/:id/cancel", authMiddleware, requireRole("CLIENT"), async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: "Mandado no existe" });
    }

    if (task.clientId !== req.user.id) {
      return res.status(403).json({
        message: "Este mandado no es tuyo",
      });
    }

    if (task.status !== "OPEN") {
      return res.status(400).json({
        message: "Solo puedes cancelar mandados abiertos",
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "CANCELLED",
      },
    });

    io.to(`user_${task.clientId}`).emit("taskUpdated", updatedTask);

    res.json(updatedTask);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error cancelando mandado" });
  }
});

app.patch("/tasks/:id/rate", authMiddleware, requireRole("CLIENT"), async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "La calificación debe ser entre 1 y 5",
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: "Mandado no existe" });
    }

    if (task.clientId !== req.user.id) {
      return res.status(403).json({
        message: "Este mandado no es tuyo",
      });
    }

    if (task.status !== "DELIVERED" && task.status !== "COMPLETED") {
      return res.status(400).json({
        message: "Solo puedes calificar mandados entregados",
      });
    }

    if (task.rating) {
      return res.status(400).json({
        message: "Este mandado ya fue calificado",
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        rating,
        review: review || "",
      },
    });

    if (task.runnerId) {
      await createNotification(
        task.runnerId,
        `Recibiste una calificación de ${rating}/5 en el mandado: ${task.description}`
      );

      io.to(`user_${task.runnerId}`).emit("taskUpdated", updatedTask);
    }

    io.to(`user_${task.clientId}`).emit("taskUpdated", updatedTask);

    res.json(updatedTask);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error calificando mandado" });
  }
});

app.get("/tasks/available", authMiddleware, requireRole("RUNNER"), async (req, res) => {
  const runner = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!runner || runner.status !== "APPROVED") {
    return res.status(403).json({
      message: "Tu cuenta de mandadero todavía no está aprobada",
    });
  }

  const tasks = await prisma.task.findMany({
    where: {
      status: "OPEN",
      runnerId: null,
    },
  });

  res.json(tasks);
});

app.patch("/tasks/:id/accept", authMiddleware, requireRole("RUNNER"), async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const runner = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!runner || runner.status !== "APPROVED") {
      return res.status(403).json({ message: "Runner no aprobado" });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: "Mandado no existe" });
    }

    if (task.status !== "OPEN" || task.runnerId !== null) {
      return res.status(400).json({
        message: "Este mandado ya no está disponible",
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "ACCEPTED",
        runnerId: req.user.id,
      },
    });

    await createNotification(
      task.clientId,
      `Tu mandado "${task.description}" fue aceptado por un mandadero.`
    );

    io.to(`user_${task.clientId}`).emit("taskUpdated", updatedTask);
    io.to(`user_${req.user.id}`).emit("taskUpdated", updatedTask);

    res.json(updatedTask);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error aceptando mandado" });
  }
});

app.patch("/tasks/:id/pickup", authMiddleware, requireRole("RUNNER"), async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const { task, updatedTask } = await updateTaskStatus(
      taskId,
      req.user.id,
      "PICKED_UP"
    );

    await createNotification(
      task.clientId,
      `Tu mandado "${task.description}" fue recogido por el mandadero.`
    );

    res.json(updatedTask);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message || "Error marcando recogido" });
  }
});

app.patch("/tasks/:id/on-the-way", authMiddleware, requireRole("RUNNER"), async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const { task, updatedTask } = await updateTaskStatus(
      taskId,
      req.user.id,
      "ON_THE_WAY"
    );

    await createNotification(
      task.clientId,
      `Tu mandado "${task.description}" está en camino.`
    );

    res.json(updatedTask);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message || "Error marcando en camino" });
  }
});

app.patch("/tasks/:id/deliver", authMiddleware, requireRole("RUNNER"), async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const { task, updatedTask } = await updateTaskStatus(
      taskId,
      req.user.id,
      "DELIVERED"
    );

    await createNotification(
      task.clientId,
      `Tu mandado "${task.description}" fue entregado. Ya puedes calificar al mandadero.`
    );

    res.json(updatedTask);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message || "Error entregando mandado" });
  }
});

app.get("/tasks/my", authMiddleware, requireRole("RUNNER"), async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: {
      runnerId: req.user.id,
    },
  });

  res.json(tasks);
});

app.get("/runners/earnings", authMiddleware, requireRole("RUNNER"), async (req, res) => {
  const completedTasks = await prisma.task.findMany({
    where: {
      runnerId: req.user.id,
      OR: [
        { status: "DELIVERED" },
        { status: "COMPLETED" },
      ],
    },
  });

  const totalEarnings = completedTasks.reduce((total, task) => {
    return total + (task.estimatedPrice || 0);
  }, 0);

  res.json({
    totalEarnings,
    completedCount: completedTasks.length,
    tasks: completedTasks,
  });
});

app.patch("/tasks/:id/runner-location", authMiddleware, requireRole("RUNNER"), async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const { runnerLat, runnerLng } = req.body;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: "Mandado no existe" });
    }

    if (task.runnerId !== req.user.id) {
      return res.status(403).json({
        message: "Este mandado no es tuyo",
      });
    }

    if (
      task.status !== "ACCEPTED" &&
      task.status !== "PICKED_UP" &&
      task.status !== "ON_THE_WAY"
    ) {
      return res.status(400).json({
        message: "Solo puedes actualizar ubicación en mandados activos",
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        runnerLat,
        runnerLng,
      },
    });

    io.to(`user_${task.clientId}`).emit("runnerLocationUpdated", updatedTask);
    io.to(`user_${req.user.id}`).emit("runnerLocationUpdated", updatedTask);

    res.json(updatedTask);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error actualizando ubicación" });
  }
});

// RUTA VIEJA: la dejamos para compatibilidad
app.patch("/tasks/:id/complete", authMiddleware, requireRole("RUNNER"), async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const { task, updatedTask } = await updateTaskStatus(
      taskId,
      req.user.id,
      "DELIVERED"
    );

    await createNotification(
      task.clientId,
      `Tu mandado "${task.description}" fue entregado. Ya puedes calificar al mandadero.`
    );

    res.json(updatedTask);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message || "Error entregando mandado" });
  }
});

app.get("/tasks/:id/messages", authMiddleware, async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: "Mandado no existe" });
    }

    const isClient = task.clientId === req.user.id;
    const isRunner = task.runnerId === req.user.id;

    if (!isClient && !isRunner) {
      return res.status(403).json({ message: "No tienes permiso" });
    }

    const messages = await prisma.message.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
    });

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error cargando mensajes" });
  }
});

app.post("/tasks/:id/messages", authMiddleware, async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "El mensaje está vacío" });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: "Mandado no existe" });
    }

    const isClient = task.clientId === req.user.id;
    const isRunner = task.runnerId === req.user.id;

    if (!isClient && !isRunner) {
      return res.status(403).json({ message: "No tienes permiso" });
    }

    const message = await prisma.message.create({
      data: {
        taskId,
        senderId: req.user.id,
        text,
      },
    });

    io.to(`user_${task.clientId}`).emit("newMessage", message);

    if (task.runnerId) {
      io.to(`user_${task.runnerId}`).emit("newMessage", message);
    }

    res.json(message);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error enviando mensaje" });
  }
});

server.listen(3000, () => {
  console.log("🚀 Servidor corriendo en http://localhost:3000");
});
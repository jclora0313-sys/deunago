require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || "*";
const JWT_SECRET = process.env.JWT_SECRET || "mi_clave_secreta";




const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PATCH"],
  },
});

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "deunago/runner-documents",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no permitido"));
    }
  },
});

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

async function getRunnerOrFail(runnerId) {
  const runner = await prisma.user.findUnique({
    where: { id: runnerId },
  });

  if (!runner) {
    throw new Error("Runner no encontrado");
  }

  if (runner.role !== "RUNNER") {
    throw new Error("Este usuario no es mandadero");
  }

  return runner;
}

function validateRunnerReady(runner) {
  if (runner.status !== "APPROVED") {
    return "Tu cuenta de mandadero todavía no está aprobada";
  }

  if (!runner.identificationValid) {
    return "Tu identificación todavía no ha sido validada";
  }

  if (!runner.licenseValid) {
    return "Tu licencia todavía no ha sido validada";
  }

  if (!runner.isAvailable) {
    return "Debes ponerte disponible para aceptar mandados";
  }

  return null;
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

// AUTH

// USER PROFILE

app.get("/users/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        isAvailable: true,
        identificationValid: true,
        licenseValid: true,
        identificationUrl: true,
        licenseUrl: true,
        profilePhotoUrl: true,
        mainAddress: true,
        vehicleType: true,
vehiclePlate: true,
bio: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error cargando perfil" });
  }
});

app.patch("/users/me", authMiddleware, async (req, res) => {
  try {
    const {
  name,
  mainAddress,
  vehicleType,
  vehiclePlate,
  bio,
} = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
  name,
  mainAddress,
  vehicleType,
  vehiclePlate,
  bio,
},
    });

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error actualizando perfil" });
  }
});

app.post(
  "/users/me/photo",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No subiste ninguna foto" });
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          profilePhotoUrl: req.file.path,
        },
      });

      res.json(updatedUser);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error subiendo foto de perfil" });
    }
  }
);

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
        isAvailable: false,
        identificationValid: false,
        licenseValid: false,
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
        isAvailable: user.isAvailable,
        identificationValid: user.identificationValid,
        licenseValid: user.licenseValid,
        identificationUrl: user.identificationUrl,
        licenseUrl: user.licenseUrl,
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
        isAvailable: user.isAvailable,
        identificationValid: user.identificationValid,
        licenseValid: user.licenseValid,
        identificationUrl: user.identificationUrl,
        licenseUrl: user.licenseUrl,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error en login" });
  }
});

// NOTIFICATIONS

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

app.patch("/notifications/read-all", authMiddleware, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    res.json({ message: "Todas leídas" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error marcando notificaciones" });
  }
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

// ADMIN

app.get("/admin/tasks", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        id: "desc",
      },
    });

    res.json(tasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error cargando mandados admin",
    });
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
      isAvailable: true,
      identificationValid: true,
      licenseValid: true,
      identificationUrl: true,
      licenseUrl: true,
    },
    orderBy: {
      id: "asc",
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

    const availableRunners = users.filter(
      (user) => user.role === "RUNNER" && user.isAvailable
    ).length;

    const runnersWithValidId = users.filter(
      (user) => user.role === "RUNNER" && user.identificationValid
    ).length;

    const runnersWithValidLicense = users.filter(
      (user) => user.role === "RUNNER" && user.licenseValid
    ).length;

    const totalTasks = tasks.length;
    const openTasks = tasks.filter((task) => task.status === "OPEN").length;
    const acceptedTasks = tasks.filter((task) => task.status === "ACCEPTED").length;
    const pickedUpTasks = tasks.filter((task) => task.status === "PICKED_UP").length;
    const onTheWayTasks = tasks.filter((task) => task.status === "ON_THE_WAY").length;
    const deliveredTasks = tasks.filter((task) => task.status === "DELIVERED").length;
    const cancelledTasks = tasks.filter((task) => task.status === "CANCELLED").length;

    const paidTasks = tasks.filter((task) => task.paymentStatus === "PAID");

const pendingPaymentTasks = tasks.filter(
  (task) =>
    !task.paymentStatus ||
    task.paymentStatus === "PENDING" ||
    task.paymentStatus === "PENDING_REVIEW"
);

const totalCollected = paidTasks.reduce((total, task) => {
  return total + (task.estimatedPrice || 0);
}, 0);

const totalPlatformFee = paidTasks.reduce((total, task) => {
  return total + (task.platformFee || 0);
}, 0);

const totalRunnerEarnings = paidTasks.reduce((total, task) => {
  return total + (task.runnerEarnings || 0);
}, 0);

    res.json({
      users: {
        totalUsers,
        totalClients,
        totalRunners,
        totalAdmins,
        pendingRunners,
        approvedRunners,
        availableRunners,
        runnersWithValidId,
        runnersWithValidLicense,
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
       estimatedRevenue: totalCollected,
totalCollected,
totalPlatformFee,
totalRunnerEarnings,
paidTasksCount: paidTasks.length,
pendingPaymentTasksCount: pendingPaymentTasks.length,
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
      "Tu cuenta de mandadero fue aprobada. Ahora falta validar identificación y licencia si aún no están validadas."
    );

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error aprobando runner" });
  }
});

app.patch("/admin/users/:id/validate-identification", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const runner = await getRunnerOrFail(userId);

    if (!runner.identificationUrl) {
      return res.status(400).json({
        message: "Este runner todavía no subió identificación",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: runner.id },
      data: { identificationValid: true },
    });

    await createNotification(
      updatedUser.id,
      "Tu identificación fue validada por el administrador."
    );

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message || "Error validando identificación" });
  }
});

app.patch("/admin/users/:id/validate-license", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const runner = await getRunnerOrFail(userId);

    if (!runner.licenseUrl) {
      return res.status(400).json({
        message: "Este runner todavía no subió licencia",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: runner.id },
      data: { licenseValid: true },
    });

    await createNotification(
      updatedUser.id,
      "Tu licencia de conducir fue validada por el administrador."
    );

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message || "Error validando licencia" });
  }
});

app.patch(
  "/admin/tasks/:id/pay-runner",
  authMiddleware,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const taskId = Number(req.params.id);

      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        return res.status(404).json({
          message: "Mandado no existe",
        });
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          runnerPayoutStatus: "PAID",
        },
      });

      if (task.runnerId) {
        await createNotification(
          task.runnerId,
          `Tu pago del mandado "${task.description}" fue marcado como pagado.`
        );
      }

      res.json(updatedTask);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error pagando runner",
      });
    }
  }
);

// RUNNER PROFILE

app.post(
  "/runners/upload-identification",
  authMiddleware,
  requireRole("RUNNER"),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No subiste ningún archivo",
        });
      }

      const fileUrl = req.file.path;

      const updatedRunner = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          identificationUrl: fileUrl,
          identificationValid: false,
        },
      });

      await createNotification(
        req.user.id,
        "Tu identificación fue subida. Espera validación del administrador."
      );

      res.json({
        message: "Identificación subida correctamente",
        user: updatedRunner,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error subiendo identificación",
      });
    }
  }
);

app.post(
  "/runners/upload-license",
  authMiddleware,
  requireRole("RUNNER"),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No subiste ningún archivo",
        });
      }

      const fileUrl = req.file.path;

      const updatedRunner = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          licenseUrl: fileUrl,
          licenseValid: false,
        },
      });

      await createNotification(
        req.user.id,
        "Tu licencia fue subida. Espera validación del administrador."
      );

      res.json({
        message: "Licencia subida correctamente",
        user: updatedRunner,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error subiendo licencia",
      });
    }
  }
);

app.patch("/runners/availability", authMiddleware, requireRole("RUNNER"), async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        message: "isAvailable debe ser true o false",
      });
    }

    const runner = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!runner) {
      return res.status(404).json({ message: "Runner no encontrado" });
    }

    if (isAvailable) {
      const problem = validateRunnerReady({
        ...runner,
        isAvailable: true,
      });

      if (problem) {
        return res.status(400).json({ message: problem });
      }
    }

    const updatedRunner = await prisma.user.update({
      where: { id: req.user.id },
      data: { isAvailable },
    });

    res.json(updatedRunner);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error actualizando disponibilidad" });
  }
});

app.patch(
  "/admin/tasks/:id/validate-payment",
  authMiddleware,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const taskId = Number(req.params.id);

      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        return res.status(404).json({ message: "Mandado no existe" });
      }

      if (!task.paymentProofUrl) {
        return res.status(400).json({
          message: "Este mandado no tiene comprobante de pago",
        });
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          paymentStatus: "PAID",
        },
      });

      await createNotification(
        task.clientId,
        `Tu pago del mandado "${task.description}" fue validado.`
      );

      res.json(updatedTask);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error validando pago",
      });
    }
  }
);

// TASKS CLIENT

app.post(
  "/tasks/:id/payment-proof",
  authMiddleware,
  requireRole("CLIENT"),
  upload.single("file"),
  async (req, res) => {
    try {
      const taskId = Number(req.params.id);

      if (!req.file) {
        return res.status(400).json({
          message: "No subiste ningún comprobante",
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

      const fileUrl = req.file.path;

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          paymentProofUrl: fileUrl,
          paymentStatus: "PENDING_REVIEW",
        },
      });

      res.json(updatedTask);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error subiendo comprobante de pago",
      });
    }
  }
);

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
        platformFee: Number((estimatedPrice * 0.3).toFixed(2)),
runnerEarnings: Number((estimatedPrice * 0.7).toFixed(2)),
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
    orderBy: {
      id: "desc",
    },
  });

  res.json(tasks);
});

app.patch("/tasks/:id/cancel", authMiddleware, requireRole("CLIENT"), async (req, res) => {
  try {
    const taskId = Number(req.params.id);

if (task.paymentStatus === "PAID") {
  return res.status(400).json({
    message: "No puedes cancelar un mandado ya pagado",
  });
}

if (task.runnerId) {
  return res.status(400).json({
    message: "No puedes cancelar un mandado ya aceptado",
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

// TASKS RUNNER

app.get("/tasks/available", authMiddleware, requireRole("RUNNER"), async (req, res) => {
  const runner = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!runner) {
    return res.status(404).json({ message: "Runner no encontrado" });
  }

  const problem = validateRunnerReady(runner);

  if (problem) {
    return res.status(403).json({ message: problem });
  }

  const tasks = await prisma.task.findMany({
  where: {
  status: "OPEN",
  runnerId: null,
  paymentStatus: "PAID",
},
    orderBy: {
      id: "desc",
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

 

    if (!runner) {
      return res.status(404).json({ message: "Runner no encontrado" });
    }

    const problem = validateRunnerReady(runner);

    if (problem) {
      return res.status(403).json({ message: problem });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (task.paymentStatus !== "PAID") {
  return res.status(400).json({
    message: "Este mandado todavía no tiene pago validado",
  });
}

if (!task) {
  return res.status(404).json({
    message: "Mandado no encontrado",
  });
}

if (task.status !== "OPEN") {
  return res.status(400).json({
    message: "Este mandado ya no está disponible",
  });
}

if (task.runnerId) {
  return res.status(400).json({
    message: "Otro runner ya aceptó este mandado",
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

const existingTask = await prisma.task.findUnique({
  where: { id: taskId },
});

if (!existingTask || existingTask.status !== "ACCEPTED") {
  return res.status(400).json({
    message: "Solo puedes marcar recogido un mandado aceptado",
  });
}

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

const existingTask = await prisma.task.findUnique({
  where: { id: taskId },
});

if (!existingTask || existingTask.status !== "PICKED_UP") {
  return res.status(400).json({
    message: "Solo puedes marcar en camino después de recoger el mandado",
  });
}

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

const existingTask = await prisma.task.findUnique({
  where: { id: taskId },
});

if (!existingTask?.deliveryProofUrl) {
  return res.status(400).json({
    message: "Debes subir comprobante de entrega antes de marcar entregado",
  });
}

if (!existingTask || existingTask.status !== "ON_THE_WAY") {
  return res.status(400).json({
    message: "Solo puedes entregar un mandado que está en camino",
  });
}

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
    orderBy: {
      id: "desc",
    },
  });

  res.json(tasks);
});

app.get("/runners/earnings", authMiddleware, requireRole("RUNNER"), async (req, res) => {
  const completedTasks = await prisma.task.findMany({
    where: {
      runnerId: req.user.id,
      OR: [{ status: "DELIVERED" }, { status: "COMPLETED" }],
    },
  });

  const totalEarnings = completedTasks.reduce((total, task) => {
  return total + (task.runnerEarnings || 0);
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
app.post(
  "/tasks/:id/delivery-proof",
  authMiddleware,
  requireRole("RUNNER"),
  upload.single("file"),
  async (req, res) => {
    try {
      const taskId = Number(req.params.id);

      if (!req.file) {
        return res.status(400).json({
          message: "No subiste ningún archivo",
        });
      }

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

      const fileUrl = req.file.path;

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          deliveryProofUrl: fileUrl,
        },
      });

      await createNotification(
        task.clientId,
        `El mandadero subió un comprobante de entrega para: ${task.description}`
      );

      io.to(`user_${task.clientId}`).emit("taskUpdated", updatedTask);
      io.to(`user_${req.user.id}`).emit("taskUpdated", updatedTask);

      res.json(updatedTask);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error subiendo comprobante de entrega",
      });
    }
  }
);
// CHAT

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


const cleanText = String(text || "").trim();

if (!cleanText) {
  return res.status(400).json({
    message: "El mensaje está vacío",
  });
}

if (cleanText.length > 500) {
  return res.status(400).json({
    message: "El mensaje no puede tener más de 500 caracteres",
  });
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
        text: cleanText,
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

// OLD COMPATIBILITY ROUTE

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

app.use((error, req, res, next) => {
  if (error.message === "Tipo de archivo no permitido") {
    return res.status(400).json({
      message: "Solo se permiten JPG, PNG, WEBP o PDF",
    });
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "El archivo no puede pesar más de 5 MB",
    });
  }

  console.log(error);

  res.status(500).json({
    message: "Error interno del servidor",
  });
});
app.get("/users/:id/profile", authMiddleware, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        isAvailable: true,
        identificationValid: true,
        licenseValid: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    const completedTasks =
      user.role === "RUNNER"
        ? await prisma.task.findMany({
            where: {
              runnerId: userId,
              OR: [{ status: "DELIVERED" }, { status: "COMPLETED" }],
            },
          })
        : [];

    const ratedTasks = completedTasks.filter((task) => task.rating);

    const averageRating =
      ratedTasks.length > 0
        ? ratedTasks.reduce((total, task) => total + task.rating, 0) /
          ratedTasks.length
        : 0;

    res.json({
      user,
      stats: {
        completedTasks: completedTasks.length,
        reviewsCount: ratedTasks.length,
        averageRating: Number(averageRating.toFixed(1)),
      },
      reviews: ratedTasks.map((task) => ({
        id: task.id,
        rating: task.rating,
        review: task.review,
        description: task.description,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error cargando perfil",
    });
  }
});

server.listen(3000, () => {
  console.log("🚀 Servidor corriendo en http://localhost:3000");
});
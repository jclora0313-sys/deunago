require("dotenv").config();

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const name = process.argv[2];
  const phone = process.argv[3];
  const password = process.argv[4];

  if (!name || !phone || !password) {
    console.log("Uso:");
    console.log('node createAdmin.js "Nombre" "Telefono" "Password"');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findFirst({
    where: { phone },
  });

  if (existingUser) {
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    console.log("Admin actualizado:");
    console.log({
      id: updatedUser.id,
      name: updatedUser.name,
      phone: updatedUser.phone,
      role: updatedUser.role,
      status: updatedUser.status,
    });

    return;
  }

  const admin = await prisma.user.create({
    data: {
      name,
      phone,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Admin creado:");
  console.log({
    id: admin.id,
    name: admin.name,
    phone: admin.phone,
    role: admin.role,
    status: admin.status,
  });
}

main()
  .catch((error) => {
    console.log(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
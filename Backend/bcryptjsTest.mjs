import bcrypt from "bcryptjs";

const hash = '$2b$10$ZJcdMOzjI.VwGOYJCwDT0.aHZuY.gQF.3oDP6t/eXYsgZAILFKNdC'
const password = "Kapil@123";

const match = await bcrypt.compare(password, hash);
console.log("Does it match?", match);

/**
 * seeder.js — Өгөгдлийн санг JSON өгөгдлөөр дүүргэх скрипт
 *
 * Ашиглах:
 *   node seed/seeder.js          → DB цэвэрлэж, seed_data.json-аас оруулна
 *   node seed/seeder.js --clear  → DB-ийг зөвхөн цэвэрлэнэ
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const path     = require('path');
const User     = require('../models/User');
const Student  = require('../models/Student');
const data     = require('./seed_data.json');

const CLEAR_ONLY = process.argv.includes('--clear');

async function clearDB() {
  await Student.deleteMany({});
  await User.deleteMany({});
  console.log('🗑️  Өгөгдлийн сан цэвэрлэгдлээ.');
}

async function seedUsers() {
  const created = {};
  for (const u of data.users) {
    const user = new User({
      username: u.username,
      email:    u.email,
      password: u.password,   // pre-save hook автоматаар bcrypt хийнэ
      role:     u.role,
    });
    await user.save();
    created[u.username] = user._id;
    console.log(`  ✅ Хэрэглэгч: ${u.username} (${u.role})`);
  }
  return created;
}

function calcScore(g) {
  return (g.exam1 ?? 0) + (g.exam2 ?? 0) + (g.attendance ?? 0) + (g.independent ?? 0);
}

async function seedStudents(userIdMap) {
  for (const s of data.students) {
    const createdBy = userIdMap[s.createdByUsername];
    if (!createdBy) {
      console.warn(`  ⚠️  "${s.createdByUsername}" хэрэглэгч олдсонгүй — ${s.name} алгасав`);
      continue;
    }

    const grades = (s.grades || []).map(g => ({
      subject:     g.subject,
      exam1:       g.exam1       ?? 0,
      exam2:       g.exam2       ?? 0,
      attendance:  g.attendance  ?? 0,
      independent: g.independent ?? 0,
      score:       calcScore(g),
    }));

    await Student.create({
      name:         s.name,
      className:    s.className,
      academicYear: s.academicYear || '2024-2025',
      semester:     s.semester     || 1,
      photo:        s.photo        || '',
      createdBy,
      grades,
    });
    console.log(`  ✅ Сурагч: ${s.name} (${s.className})`);
  }
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 MongoDB холбогдлоо\n');

    await clearDB();

    if (CLEAR_ONLY) {
      console.log('\n✔  --clear горим: зөвхөн цэвэрлэлт хийлээ.');
      return;
    }

    console.log('\n👤 Хэрэглэгчид:');
    const userIdMap = await seedUsers();

    console.log('\n🎓 Сурагчид:');
    await seedStudents(userIdMap);

    const userCount    = await User.countDocuments();
    const studentCount = await Student.countDocuments();
    console.log(`\n🎉 Дууслаа! ${userCount} хэрэглэгч, ${studentCount} сурагч оруулагдлаа.`);

    console.log('\n📋 Нэвтрэх мэдээлэл:');
    for (const u of data.users) {
      console.log(`   ${u.role === 'admin' ? '👑' : '👨‍🏫'} ${u.email}  /  ${u.password}`);
    }

  } catch (err) {
    console.error('❌ Алдаа:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB холболт хаагдлаа.');
  }
}

main();

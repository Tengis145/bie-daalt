// БИЕ ДААЛТ — Sample Data
const SUBJECTS = ['Математик','Монгол хэл','Физик','Хими','Англи хэл','Биологи','Газарзүй','Түүх','Мэдээлэл зүй','Уран зохиол'];

const STUDENTS = [
  { id:1, name:'Батбаяр Дорж',   className:'10-А', year:'2024-2025', semester:1,
    grades:[{s:'Математик',e1:28,e2:26,att:18,ind:17},{s:'Монгол хэл',e1:25,e2:27,att:19,ind:18},{s:'Физик',e1:22,e2:20,att:17,ind:15},{s:'Хими',e1:26,e2:24,att:18,ind:16},{s:'Англи хэл',e1:29,e2:28,att:20,ind:19},{s:'Биологи',e1:24,e2:23,att:17,ind:16},{s:'Газарзүй',e1:20,e2:22,att:16,ind:14},{s:'Түүх',e1:27,e2:25,att:18,ind:17}]},
  { id:2, name:'Номин-Эрдэнэ Ган', className:'10-А', year:'2024-2025', semester:1,
    grades:[{s:'Математик',e1:18,e2:16,att:14,ind:12},{s:'Монгол хэл',e1:20,e2:19,att:15,ind:13},{s:'Физик',e1:15,e2:14,att:12,ind:10},{s:'Хими',e1:17,e2:16,att:13,ind:11},{s:'Англи хэл',e1:22,e2:21,att:16,ind:14},{s:'Биологи',e1:19,e2:18,att:14,ind:12},{s:'Газарзүй',e1:16,e2:15,att:13,ind:11},{s:'Түүх',e1:21,e2:20,att:15,ind:13}]},
  { id:3, name:'Энхтуяа Мөнх',   className:'10-Б', year:'2024-2025', semester:1,
    grades:[{s:'Математик',e1:30,e2:29,att:20,ind:20},{s:'Монгол хэл',e1:28,e2:30,att:20,ind:19},{s:'Физик',e1:27,e2:28,att:19,ind:18},{s:'Хими',e1:29,e2:27,att:20,ind:19},{s:'Англи хэл',e1:30,e2:29,att:20,ind:20},{s:'Биологи',e1:26,e2:28,att:19,ind:18},{s:'Газарзүй',e1:25,e2:26,att:18,ind:17},{s:'Түүх',e1:28,e2:27,att:19,ind:18}]},
  { id:4, name:'Тэмүүжин Болд',   className:'10-Б', year:'2024-2025', semester:1,
    grades:[{s:'Математик',e1:24,e2:23,att:17,ind:16},{s:'Монгол хэл',e1:22,e2:21,att:16,ind:15},{s:'Физик',e1:20,e2:19,att:15,ind:14},{s:'Хими',e1:23,e2:22,att:17,ind:15},{s:'Англи хэл',e1:25,e2:24,att:18,ind:17},{s:'Биологи',e1:21,e2:20,att:16,ind:14},{s:'Газарзүй',e1:18,e2:19,att:14,ind:13},{s:'Түүх',e1:22,e2:21,att:16,ind:15}]},
  { id:5, name:'Оюунцэцэг Гал',  className:'11-А', year:'2024-2025', semester:1,
    grades:[{s:'Математик',e1:12,e2:14,att:10,ind:9},{s:'Монгол хэл',e1:16,e2:15,att:12,ind:10},{s:'Физик',e1:10,e2:11,att:9,ind:8},{s:'Хими',e1:13,e2:12,att:10,ind:9},{s:'Англи хэл',e1:18,e2:17,att:13,ind:11},{s:'Биологи',e1:14,e2:13,att:11,ind:9},{s:'Газарзүй',e1:11,e2:12,att:9,ind:8},{s:'Түүх',e1:15,e2:14,att:12,ind:10}]},
  { id:6, name:'Билгүүн Сайхан', className:'11-А', year:'2024-2025', semester:1,
    grades:[{s:'Математик',e1:26,e2:25,att:18,ind:17},{s:'Монгол хэл',e1:24,e2:23,att:17,ind:16},{s:'Физик',e1:23,e2:22,att:16,ind:15},{s:'Хими',e1:25,e2:24,att:18,ind:16},{s:'Англи хэл',e1:27,e2:26,att:19,ind:18},{s:'Биологи',e1:22,e2:21,att:16,ind:15},{s:'Газарзүй',e1:20,e2:21,att:15,ind:14},{s:'Түүх',e1:24,e2:23,att:17,ind:16}]},
  { id:7, name:'Мөнхцэцэг Баяр', className:'11-Б', year:'2024-2025', semester:1,
    grades:[{s:'Математик',e1:19,e2:18,att:14,ind:13},{s:'Монгол хэл',e1:21,e2:20,att:15,ind:14},{s:'Физик',e1:16,e2:17,att:13,ind:11},{s:'Хими',e1:18,e2:17,att:14,ind:12},{s:'Англи хэл',e1:23,e2:22,att:16,ind:15},{s:'Биологи',e1:20,e2:19,att:15,ind:13},{s:'Газарзүй',e1:17,e2:16,att:13,ind:11},{s:'Түүх',e1:22,e2:21,att:15,ind:14}]},
  { id:8, name:'Анхзаяа Нэргүй', className:'11-Б', year:'2024-2025', semester:1,
    grades:[{s:'Математик',e1:29,e2:28,att:20,ind:19},{s:'Монгол хэл',e1:27,e2:26,att:19,ind:18},{s:'Физик',e1:25,e2:26,att:18,ind:17},{s:'Хими',e1:28,e2:27,att:19,ind:18},{s:'Англи хэл',e1:30,e2:29,att:20,ind:19},{s:'Биологи',e1:25,e2:24,att:18,ind:17},{s:'Газарзүй',e1:23,e2:24,att:17,ind:16},{s:'Түүх',e1:26,e2:25,att:18,ind:17}]},
];

function calcScore(g) { return g.e1 + g.e2 + g.att + g.ind; }
function calcAvg(student) {
  const scores = student.grades.map(calcScore);
  return scores.length ? Math.round(scores.reduce((a,b)=>a+b,0) / scores.length * 10)/10 : 0;
}

// Attach to window
Object.assign(window, { STUDENTS, SUBJECTS, calcScore, calcAvg });
